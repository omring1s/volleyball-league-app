const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /api/invites
router.get('/', (req, res, next) => {
  try {
    const invites = db.prepare(`
      SELECT i.*, u.username as creator_username, u.full_name as creator_name,
             COUNT(r.id) as rsvp_count
      FROM invites i
      LEFT JOIN users u ON i.created_by = u.id
      LEFT JOIN rsvps r ON i.id = r.invite_id AND r.status = 'going'
      GROUP BY i.id
      ORDER BY i.scheduled_at ASC
    `).all();
    res.json(invites);
  } catch (err) { next(err); }
});

// POST /api/invites
router.post('/', requireAuth, (req, res, next) => {
  try {
    const { title, description, location, scheduled_at, max_players, skill_level } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const token = uuidv4();
    const result = db.prepare(
      'INSERT INTO invites (title, description, location, scheduled_at, max_players, skill_level, share_token, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(title, description || null, location || null, scheduled_at || null, max_players || 12, skill_level || 'all', token, req.user.id);

    res.status(201).json(db.prepare('SELECT * FROM invites WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) { next(err); }
});

// GET /api/invites/join/:token (public share link — must come before /:id)
router.get('/join/:token', (req, res, next) => {
  try {
    const invite = db.prepare(`
      SELECT i.*, u.username as creator_username,
             COUNT(CASE WHEN r.status = 'going' THEN 1 END) as going_count,
             COUNT(CASE WHEN r.status = 'maybe' THEN 1 END) as maybe_count
      FROM invites i
      LEFT JOIN users u ON i.created_by = u.id
      LEFT JOIN rsvps r ON i.id = r.invite_id
      WHERE i.share_token = ?
      GROUP BY i.id
    `).get(req.params.token);
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    res.json(invite);
  } catch (err) { next(err); }
});

// GET /api/invites/:id
router.get('/:id', (req, res, next) => {
  try {
    const invite = db.prepare(`
      SELECT i.*, u.username as creator_username,
             COUNT(CASE WHEN r.status = 'going' THEN 1 END) as going_count,
             COUNT(CASE WHEN r.status = 'maybe' THEN 1 END) as maybe_count
      FROM invites i
      LEFT JOIN users u ON i.created_by = u.id
      LEFT JOIN rsvps r ON i.id = r.invite_id
      WHERE i.id = ?
      GROUP BY i.id
    `).get(req.params.id);
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    res.json(invite);
  } catch (err) { next(err); }
});

// PUT /api/invites/:id
router.put('/:id', requireAuth, (req, res, next) => {
  try {
    const invite = db.prepare('SELECT * FROM invites WHERE id = ?').get(req.params.id);
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    if (invite.created_by !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const { title, description, location, scheduled_at, max_players, skill_level } = req.body;
    db.prepare(`
      UPDATE invites SET title = ?, description = ?, location = ?, scheduled_at = ?,
        max_players = ?, skill_level = ? WHERE id = ?
    `).run(
      title ?? invite.title, description ?? invite.description, location ?? invite.location,
      scheduled_at ?? invite.scheduled_at, max_players ?? invite.max_players,
      skill_level ?? invite.skill_level, req.params.id
    );
    res.json(db.prepare('SELECT * FROM invites WHERE id = ?').get(req.params.id));
  } catch (err) { next(err); }
});

// DELETE /api/invites/:id
router.delete('/:id', requireAuth, (req, res, next) => {
  try {
    const invite = db.prepare('SELECT * FROM invites WHERE id = ?').get(req.params.id);
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    if (invite.created_by !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    db.prepare('DELETE FROM invites WHERE id = ?').run(req.params.id);
    res.json({ message: 'Invite deleted' });
  } catch (err) { next(err); }
});

// POST /api/invites/:id/rsvp (no auth required)
router.post('/:id/rsvp', (req, res, next) => {
  try {
    const invite = db.prepare('SELECT * FROM invites WHERE id = ?').get(req.params.id);
    if (!invite) return res.status(404).json({ error: 'Invite not found' });

    const { name, email, status } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    if (!['going', 'maybe', 'not_going'].includes(status)) {
      return res.status(400).json({ error: 'status must be going, maybe, or not_going' });
    }

    // Extract user_id from optional auth header
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
        userId = payload.userId;
      } catch { /* ignore */ }
    }

    if (userId) {
      // Upsert for logged-in users
      const existing = db.prepare('SELECT id FROM rsvps WHERE invite_id = ? AND user_id = ?').get(invite.id, userId);
      if (existing) {
        db.prepare('UPDATE rsvps SET name = ?, email = ?, status = ? WHERE id = ?').run(name, email || null, status, existing.id);
        return res.json(db.prepare('SELECT * FROM rsvps WHERE id = ?').get(existing.id));
      }
      const result = db.prepare('INSERT INTO rsvps (invite_id, user_id, name, email, status) VALUES (?, ?, ?, ?, ?)').run(invite.id, userId, name, email || null, status);
      return res.status(201).json(db.prepare('SELECT * FROM rsvps WHERE id = ?').get(result.lastInsertRowid));
    }

    // Anonymous RSVP
    const result = db.prepare('INSERT INTO rsvps (invite_id, name, email, status) VALUES (?, ?, ?, ?)').run(invite.id, name, email || null, status);
    res.status(201).json(db.prepare('SELECT * FROM rsvps WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) { next(err); }
});

// GET /api/invites/:id/rsvps
router.get('/:id/rsvps', (req, res, next) => {
  try {
    const rsvps = db.prepare(`
      SELECT r.*, u.username
      FROM rsvps r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.invite_id = ?
      ORDER BY r.created_at ASC
    `).all(req.params.id);

    const counts = {
      going: rsvps.filter(r => r.status === 'going').length,
      maybe: rsvps.filter(r => r.status === 'maybe').length,
      not_going: rsvps.filter(r => r.status === 'not_going').length,
    };

    res.json({ rsvps, counts });
  } catch (err) { next(err); }
});

module.exports = router;
