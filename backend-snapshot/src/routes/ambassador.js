const router = require('express').Router();
const pool = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');
router.get('/gifts', authMiddleware, async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM ambassador_gifts WHERE user_id=$1 ORDER BY milestone_months', [req.userId])).rows); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});
router.post('/gifts/:id/claim', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('UPDATE ambassador_gifts SET claimed=true WHERE id=$1 AND user_id=$2 RETURNING *', [req.params.id, req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});
module.exports = router;
