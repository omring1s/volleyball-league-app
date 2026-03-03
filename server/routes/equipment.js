const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /api/equipment
router.get('/', (req, res, next) => {
  try {
    const { type, location_type, available } = req.query;
    const conditions = [];
    const params = [];

    if (type) { conditions.push('e.type = ?'); params.push(type); }
    if (location_type) { conditions.push('e.location_type = ?'); params.push(location_type); }
    if (available !== undefined) { conditions.push('e.is_available = ?'); params.push(available === 'true' ? 1 : 0); }

    let sql = `
      SELECT e.*, u.username as owner_username
      FROM equipment e
      LEFT JOIN users u ON e.owner_id = u.id
    `;
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY e.created_at DESC';

    res.json(db.prepare(sql).all(...params));
  } catch (err) { next(err); }
});

// GET /api/equipment/:id
router.get('/:id', (req, res, next) => {
  try {
    const item = db.prepare(`
      SELECT e.*, u.username as owner_username
      FROM equipment e
      LEFT JOIN users u ON e.owner_id = u.id
      WHERE e.id = ?
    `).get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Equipment not found' });

    const reservations = db.prepare(`
      SELECT er.*, u.username
      FROM equipment_reservations er
      JOIN users u ON er.user_id = u.id
      WHERE er.equipment_id = ? AND er.ends_at > datetime('now')
      ORDER BY er.reserved_at ASC
    `).all(req.params.id);

    res.json({ ...item, reservations });
  } catch (err) { next(err); }
});

// POST /api/equipment
router.post('/', requireAuth, (req, res, next) => {
  try {
    const { name, type, location_type, location_name, condition } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const result = db.prepare(
      'INSERT INTO equipment (name, type, location_type, location_name, condition, owner_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, type || 'other', location_type || 'park', location_name || null, condition || 'good', req.user.id);

    res.status(201).json(db.prepare('SELECT * FROM equipment WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) { next(err); }
});

// PUT /api/equipment/:id
router.put('/:id', requireAuth, (req, res, next) => {
  try {
    const item = db.prepare('SELECT * FROM equipment WHERE id = ?').get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Equipment not found' });
    if (item.owner_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const { name, type, location_type, location_name, condition, is_available } = req.body;
    db.prepare(`
      UPDATE equipment SET name = ?, type = ?, location_type = ?, location_name = ?,
        condition = ?, is_available = ? WHERE id = ?
    `).run(
      name ?? item.name, type ?? item.type, location_type ?? item.location_type,
      location_name ?? item.location_name, condition ?? item.condition,
      is_available !== undefined ? (is_available ? 1 : 0) : item.is_available,
      req.params.id
    );

    res.json(db.prepare('SELECT * FROM equipment WHERE id = ?').get(req.params.id));
  } catch (err) { next(err); }
});

// DELETE /api/equipment/:id
router.delete('/:id', requireAuth, (req, res, next) => {
  try {
    const item = db.prepare('SELECT * FROM equipment WHERE id = ?').get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Equipment not found' });
    if (item.owner_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    db.prepare('DELETE FROM equipment WHERE id = ?').run(req.params.id);
    res.json({ message: 'Equipment deleted' });
  } catch (err) { next(err); }
});

// POST /api/equipment/:id/reserve
router.post('/:id/reserve', requireAuth, (req, res, next) => {
  try {
    const item = db.prepare('SELECT * FROM equipment WHERE id = ?').get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Equipment not found' });
    if (!item.is_available) return res.status(400).json({ error: 'Equipment is not available' });

    const { reserved_at, ends_at } = req.body;
    if (!reserved_at || !ends_at) return res.status(400).json({ error: 'reserved_at and ends_at are required' });
    if (new Date(reserved_at) >= new Date(ends_at)) return res.status(400).json({ error: 'ends_at must be after reserved_at' });

    // Check for time overlap conflicts
    const conflict = db.prepare(`
      SELECT id FROM equipment_reservations
      WHERE equipment_id = ?
        AND NOT (ends_at <= ? OR reserved_at >= ?)
    `).get(req.params.id, reserved_at, ends_at);

    if (conflict) return res.status(409).json({ error: 'Time slot conflicts with an existing reservation' });

    const result = db.prepare(
      'INSERT INTO equipment_reservations (equipment_id, user_id, reserved_at, ends_at) VALUES (?, ?, ?, ?)'
    ).run(req.params.id, req.user.id, reserved_at, ends_at);

    res.status(201).json(db.prepare('SELECT * FROM equipment_reservations WHERE id = ?').get(result.lastInsertRowid));
  } catch (err) { next(err); }
});

// DELETE /api/equipment/:id/reserve/:reservationId
router.delete('/:id/reserve/:reservationId', requireAuth, (req, res, next) => {
  try {
    const reservation = db.prepare('SELECT * FROM equipment_reservations WHERE id = ? AND equipment_id = ?').get(req.params.reservationId, req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    if (reservation.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    db.prepare('DELETE FROM equipment_reservations WHERE id = ?').run(req.params.reservationId);
    res.json({ message: 'Reservation cancelled' });
  } catch (err) { next(err); }
});

module.exports = router;
