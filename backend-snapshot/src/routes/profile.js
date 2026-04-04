const router = require('express').Router();
const pool = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

const USER_FIELDS = 'id, email, name, avatar_url, subscription_status, subscription_start AS subscription_start_date, subscription_end AS subscription_end_date, ambassador_status, ambassador_status_override, delivery_form_submitted, role, admin_permissions, created_at';

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`SELECT ${USER_FIELDS} FROM users WHERE id=$1`, [req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    const user = result.rows[0];
    user.subscription_active = user.subscription_status === 'active';
    res.json(user);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.put('/', authMiddleware, async (req, res) => {
  try {
    const { name, avatar_url } = req.body;
    const result = await pool.query(
      `UPDATE users SET name=COALESCE($1,name), avatar_url=COALESCE($2,avatar_url) WHERE id=$3 RETURNING ${USER_FIELDS}`,
      [name, avatar_url, req.userId]
    );
    const user = result.rows[0];
    user.subscription_active = user.subscription_status === 'active';
    res.json(user);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
