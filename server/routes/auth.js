const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function safeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, username, password, full_name, skill_level, position } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'email, username, and password are required' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const stmt = db.prepare(
      'INSERT INTO users (email, username, password, full_name, skill_level, position) VALUES (?, ?, ?, ?, ?, ?)'
    );

    let result;
    try {
      result = stmt.run(email, username, hashed, full_name || null, skill_level || 'beginner', position || null);
    } catch (e) {
      if (e.message.includes('UNIQUE')) {
        return res.status(409).json({ error: 'Email or username already in use' });
      }
      throw e;
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ user: safeUser(user), token: signToken(user.id) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ user: safeUser(user), token: signToken(user.id) });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

// PUT /api/auth/me
router.put('/me', requireAuth, async (req, res, next) => {
  try {
    const { full_name, skill_level, position, username } = req.body;
    const user = req.user;

    if (username && username !== user.username) {
      const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, user.id);
      if (existing) return res.status(409).json({ error: 'Username already taken' });
    }

    db.prepare(
      'UPDATE users SET full_name = ?, skill_level = ?, position = ?, username = ? WHERE id = ?'
    ).run(
      full_name ?? user.full_name,
      skill_level ?? user.skill_level,
      position ?? user.position,
      username ?? user.username,
      user.id
    );

    const updated = db.prepare('SELECT id, email, username, full_name, skill_level, position, created_at FROM users WHERE id = ?').get(user.id);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
