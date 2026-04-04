const router = require('express').Router();
const pool = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, phone, email, city, street, postal_code } = req.body;
    const result = await pool.query(
      `INSERT INTO delivery_forms (user_id, name, phone, email, city, street, postal_code) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.userId, name, phone, email, city, street, postal_code]
    );
    await pool.query('UPDATE users SET delivery_form_submitted=true WHERE id=$1', [req.userId]);
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});
module.exports = router;
