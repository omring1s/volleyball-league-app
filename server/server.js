require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leagues', require('./routes/leagues'));
app.use('/api/leagues/:leagueId/games', require('./routes/games'));
app.use('/api/invites', require('./routes/invites'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/users', require('./routes/users'));

// Upcoming games (auth optional) — placed after league routes to avoid conflict
const { requireAuth } = require('./middleware/auth');
const db = require('./db');
app.get('/api/games/upcoming', requireAuth, (req, res, next) => {
  try {
    const games = db.prepare(`
      SELECT g.*, l.name as league_name
      FROM games g
      JOIN leagues l ON g.league_id = l.id
      JOIN league_members lm ON g.league_id = lm.league_id
      WHERE lm.user_id = ? AND g.status = 'scheduled' AND g.scheduled_at > datetime('now')
      ORDER BY g.scheduled_at ASC
    `).all(req.user.id);
    res.json(games);
  } catch (err) { next(err); }
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
