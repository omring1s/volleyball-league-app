const router = require('express').Router();
const db = require('../db');

// GET /api/users/:id
router.get('/:id', (req, res, next) => {
  try {
    const user = db.prepare(`
      SELECT u.id, u.username, u.full_name, u.skill_level, u.position, u.created_at,
             COUNT(lm.id) as league_count
      FROM users u
      LEFT JOIN league_members lm ON u.id = lm.user_id
      WHERE u.id = ?
      GROUP BY u.id
    `).get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
});

// GET /api/users/:id/leagues
router.get('/:id/leagues', (req, res, next) => {
  try {
    const leagues = db.prepare(`
      SELECT l.*, lm.role, lm.team_name
      FROM leagues l
      JOIN league_members lm ON l.id = lm.league_id
      WHERE lm.user_id = ?
      ORDER BY l.created_at DESC
    `).all(req.params.id);
    res.json(leagues);
  } catch (err) { next(err); }
});

// GET /api/users/:id/games
router.get('/:id/games', (req, res, next) => {
  try {
    const games = db.prepare(`
      SELECT g.*
      FROM games g
      JOIN league_members lm ON g.league_id = lm.league_id
      WHERE lm.user_id = ? AND g.status = 'scheduled' AND g.scheduled_at > datetime('now')
      ORDER BY g.scheduled_at ASC
    `).all(req.params.id);
    res.json(games);
  } catch (err) { next(err); }
});

module.exports = router;
