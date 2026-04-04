const router = require('express').Router();
const pool = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

// ── Progress tracking (MUST be before /:id) ──
router.get('/progress', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT material_id, watched_at FROM material_progress WHERE user_id=$1', [req.userId]);
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.get('/', async (req, res) => {
  try {
    const { section_id, subsection_id, limit = 50, offset = 0 } = req.query;
    let sql = 'SELECT * FROM materials WHERE is_published=true';
    const params = []; let idx = 1;
    if (section_id) { sql += ` AND section_id=$${idx++}`; params.push(section_id); }
    if (subsection_id) { sql += ` AND subsection_id=$${idx++}`; params.push(subsection_id); }
    sql += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(parseInt(limit), parseInt(offset));
    res.json((await pool.query(sql, params)).rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});
router.get('/:id', async (req, res) => {
  try {
    const mat = await pool.query('SELECT * FROM materials WHERE id=$1', [req.params.id]);
    if (!mat.rows.length) return res.status(404).json({ error: 'Not found' });
    const additional = await pool.query('SELECT * FROM additional_materials WHERE content_id=$1 ORDER BY order_index', [req.params.id]);
    res.json({ ...mat.rows[0], additional_materials: additional.rows });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});
router.post('/:id/watched', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `INSERT INTO material_progress (user_id, material_id) VALUES ($1,$2)
       ON CONFLICT (user_id, material_id) DO UPDATE SET watched_at=NOW()
       RETURNING *`,
      [req.userId, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.delete('/:id/watched', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM material_progress WHERE user_id=$1 AND material_id=$2', [req.userId, req.params.id]);
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
