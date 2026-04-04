const router = require('express').Router();
const pool = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');
router.get('/templates', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM habit_templates ORDER BY adopted_count DESC')).rows); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});
router.get('/', authMiddleware, async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM habits WHERE user_id=$1 ORDER BY created_at', [req.userId])).rows); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, template_id, frequency_type, frequency_count, deadline, total_target, category, source_content_id } = req.body;
    const result = await pool.query(
      `INSERT INTO habits (user_id, title, template_id, frequency_type, frequency_count, deadline, total_target, category, source_content_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.userId, title, template_id, frequency_type||'daily', frequency_count||1, deadline, total_target, category, source_content_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, frequency_type, frequency_count, deadline, total_target } = req.body;
    const result = await pool.query(
      `UPDATE habits SET title=COALESCE($1,title), frequency_type=COALESCE($2,frequency_type), frequency_count=COALESCE($3,frequency_count), deadline=COALESCE($4,deadline), total_target=COALESCE($5,total_target) WHERE id=$6 AND user_id=$7 RETURNING *`,
      [title, frequency_type, frequency_count, deadline, total_target, req.params.id, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});
router.delete('/:id', authMiddleware, async (req, res) => {
  try { await pool.query('DELETE FROM habits WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]); res.json({ ok: true }); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});
router.get('/:id/logs', authMiddleware, async (req, res) => {
  try {
    // Verify habit belongs to user
    const habit = await pool.query('SELECT id FROM habits WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
    if (!habit.rows.length) return res.status(404).json({ error: 'Not found' });

    const { from, to } = req.query;
    let sql = 'SELECT * FROM habit_logs WHERE habit_id=$1'; const params = [req.params.id]; let idx = 2;
    if (from) { sql += ` AND date >= $${idx++}`; params.push(from); }
    if (to) { sql += ` AND date <= $${idx++}`; params.push(to); }
    res.json((await pool.query(sql + ' ORDER BY date', params)).rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});
router.post('/:id/logs', authMiddleware, async (req, res) => {
  try {
    // Verify habit belongs to user
    const habit = await pool.query('SELECT id FROM habits WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
    if (!habit.rows.length) return res.status(404).json({ error: 'Not found' });

    const { date, completed } = req.body;
    const result = await pool.query(
      `INSERT INTO habit_logs (habit_id, date, completed) VALUES ($1,$2,$3) ON CONFLICT (habit_id, date) DO UPDATE SET completed=$3 RETURNING *`,
      [req.params.id, date, completed !== false]
    );
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});
module.exports = router;
