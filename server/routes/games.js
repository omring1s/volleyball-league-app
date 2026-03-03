const router = require('express').Router({ mergeParams: true });
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /api/leagues/:leagueId/games
router.get('/', (req, res, next) => {
  try {
    const games = db.prepare('SELECT * FROM games WHERE league_id = ? ORDER BY scheduled_at ASC').all(req.params.leagueId);
    res.json(games);
  } catch (err) { next(err); }
});

// POST /api/leagues/:leagueId/games
router.post('/', requireAuth, (req, res, next) => {
  try {
    const member = db.prepare('SELECT role FROM league_members WHERE league_id = ? AND user_id = ?').get(req.params.leagueId, req.user.id);
    if (!member || member.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

    const { home_team, away_team, scheduled_at, location } = req.body;
    if (!home_team || !away_team || !scheduled_at) {
      return res.status(400).json({ error: 'home_team, away_team, and scheduled_at are required' });
    }

    const result = db.prepare(
      'INSERT INTO games (league_id, home_team, away_team, scheduled_at, location) VALUES (?, ?, ?, ?, ?)'
    ).run(req.params.leagueId, home_team, away_team, scheduled_at, location || null);

    res.status(201).json(db.prepare('SELECT * FROM games WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) { next(err); }
});

// PUT /api/leagues/:leagueId/games/:gameId
router.put('/:gameId', requireAuth, (req, res, next) => {
  try {
    const member = db.prepare('SELECT role FROM league_members WHERE league_id = ? AND user_id = ?').get(req.params.leagueId, req.user.id);
    if (!member || member.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

    const game = db.prepare('SELECT * FROM games WHERE id = ? AND league_id = ?').get(req.params.gameId, req.params.leagueId);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const { home_team, away_team, scheduled_at, location, home_score, away_score, status } = req.body;
    db.prepare(`
      UPDATE games SET home_team = ?, away_team = ?, scheduled_at = ?, location = ?,
        home_score = ?, away_score = ?, status = ? WHERE id = ?
    `).run(
      home_team ?? game.home_team, away_team ?? game.away_team,
      scheduled_at ?? game.scheduled_at, location ?? game.location,
      home_score ?? game.home_score, away_score ?? game.away_score,
      status ?? game.status, req.params.gameId
    );

    res.json(db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.gameId));
  } catch (err) { next(err); }
});

// DELETE /api/leagues/:leagueId/games/:gameId
router.delete('/:gameId', requireAuth, (req, res, next) => {
  try {
    const member = db.prepare('SELECT role FROM league_members WHERE league_id = ? AND user_id = ?').get(req.params.leagueId, req.user.id);
    if (!member || member.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

    db.prepare('DELETE FROM games WHERE id = ? AND league_id = ?').run(req.params.gameId, req.params.leagueId);
    res.json({ message: 'Game deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
