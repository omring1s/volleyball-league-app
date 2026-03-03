const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /api/leagues
router.get('/', (req, res, next) => {
  try {
    const { skill, location, q } = req.query;
    const conditions = [];
    const params = [];

    if (skill) { conditions.push('l.skill_level = ?'); params.push(skill); }
    if (location) { conditions.push('l.location LIKE ?'); params.push(`%${location}%`); }
    if (q) { conditions.push('(l.name LIKE ? OR l.description LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }

    let sql = `
      SELECT l.*, COUNT(lm.id) as member_count
      FROM leagues l
      LEFT JOIN league_members lm ON l.id = lm.league_id
    `;
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' GROUP BY l.id ORDER BY l.created_at DESC';

    res.json(db.prepare(sql).all(...params));
  } catch (err) { next(err); }
});

// GET /api/leagues/:id
router.get('/:id', (req, res, next) => {
  try {
    const league = db.prepare(`
      SELECT l.*, COUNT(lm.id) as member_count
      FROM leagues l
      LEFT JOIN league_members lm ON l.id = lm.league_id
      WHERE l.id = ?
      GROUP BY l.id
    `).get(req.params.id);
    if (!league) return res.status(404).json({ error: 'League not found' });
    res.json(league);
  } catch (err) { next(err); }
});

// POST /api/leagues
router.post('/', requireAuth, (req, res, next) => {
  try {
    const { name, description, location, skill_level, season_start, season_end, max_teams } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const result = db.prepare(
      'INSERT INTO leagues (name, description, location, skill_level, season_start, season_end, max_teams, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(name, description || null, location || null, skill_level || 'all', season_start || null, season_end || null, max_teams || 8, req.user.id);

    // Auto-join creator as admin
    db.prepare('INSERT INTO league_members (league_id, user_id, role) VALUES (?, ?, ?)').run(result.lastInsertRowid, req.user.id, 'admin');

    const league = db.prepare('SELECT * FROM leagues WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(league);
  } catch (err) { next(err); }
});

// PUT /api/leagues/:id
router.put('/:id', requireAuth, (req, res, next) => {
  try {
    const member = db.prepare('SELECT role FROM league_members WHERE league_id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!member || member.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

    const { name, description, location, skill_level, season_start, season_end, max_teams } = req.body;
    const league = db.prepare('SELECT * FROM leagues WHERE id = ?').get(req.params.id);
    if (!league) return res.status(404).json({ error: 'League not found' });

    db.prepare(`
      UPDATE leagues SET name = ?, description = ?, location = ?, skill_level = ?,
        season_start = ?, season_end = ?, max_teams = ? WHERE id = ?
    `).run(
      name ?? league.name, description ?? league.description, location ?? league.location,
      skill_level ?? league.skill_level, season_start ?? league.season_start,
      season_end ?? league.season_end, max_teams ?? league.max_teams, req.params.id
    );

    res.json(db.prepare('SELECT * FROM leagues WHERE id = ?').get(req.params.id));
  } catch (err) { next(err); }
});

// DELETE /api/leagues/:id
router.delete('/:id', requireAuth, (req, res, next) => {
  try {
    const member = db.prepare('SELECT role FROM league_members WHERE league_id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!member || member.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

    db.prepare('DELETE FROM leagues WHERE id = ?').run(req.params.id);
    res.json({ message: 'League deleted' });
  } catch (err) { next(err); }
});

// POST /api/leagues/:id/join
router.post('/:id/join', requireAuth, (req, res, next) => {
  try {
    const league = db.prepare('SELECT * FROM leagues WHERE id = ?').get(req.params.id);
    if (!league) return res.status(404).json({ error: 'League not found' });

    const { team_name } = req.body;
    try {
      db.prepare('INSERT INTO league_members (league_id, user_id, team_name, role) VALUES (?, ?, ?, ?)').run(req.params.id, req.user.id, team_name || null, 'player');
    } catch (e) {
      if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Already a member' });
      throw e;
    }
    res.json({ message: 'Joined league' });
  } catch (err) { next(err); }
});

// DELETE /api/leagues/:id/leave
router.delete('/:id/leave', requireAuth, (req, res, next) => {
  try {
    const member = db.prepare('SELECT role FROM league_members WHERE league_id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!member) return res.status(404).json({ error: 'Not a member' });
    if (member.role === 'admin') return res.status(400).json({ error: 'Admins cannot leave — delete the league or transfer ownership first' });

    db.prepare('DELETE FROM league_members WHERE league_id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Left league' });
  } catch (err) { next(err); }
});

// GET /api/leagues/:id/members
router.get('/:id/members', (req, res, next) => {
  try {
    const members = db.prepare(`
      SELECT lm.id, lm.team_name, lm.role, lm.joined_at,
             u.id as user_id, u.username, u.full_name, u.skill_level, u.position
      FROM league_members lm
      JOIN users u ON lm.user_id = u.id
      WHERE lm.league_id = ?
      ORDER BY lm.role DESC, lm.joined_at ASC
    `).all(req.params.id);
    res.json(members);
  } catch (err) { next(err); }
});

module.exports = router;
