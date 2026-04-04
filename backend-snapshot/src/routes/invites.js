const router = require('express').Router();
const crypto = require('crypto');
const pool = require('../db/pool');
const { authMiddleware, superadminOnly } = require('../middleware/auth');

// ── List invites (superadmin) ──
router.get('/', authMiddleware, superadminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, u.name as created_by_name, uu.name as used_by_name, uu.email as used_by_email
      FROM admin_invites i
      LEFT JOIN users u ON i.created_by = u.id
      LEFT JOIN users uu ON i.used_by = uu.id
      ORDER BY i.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── Create invite (superadmin) ──
router.post('/', authMiddleware, superadminOnly, async (req, res) => {
  try {
    const { role, admin_permissions, expires_hours } = req.body;
    const token = crypto.randomBytes(32).toString('hex');
    const hours = expires_hours || 72;
    const result = await pool.query(
      `INSERT INTO admin_invites (token, role, admin_permissions, created_by, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + interval '${parseInt(hours)} hours')
       RETURNING *`,
      [token, role || 'admin', admin_permissions || [], req.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── Delete invite (superadmin) ──
router.delete('/:id', authMiddleware, superadminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM admin_invites WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── Check invite (public) ──
router.get('/check/:token', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, role, admin_permissions, expires_at FROM admin_invites WHERE token=$1 AND used_by IS NULL AND expires_at > NOW()',
      [req.params.token]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Invite not found or expired' });
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── Accept invite (authenticated user) ──
router.post('/accept/:token', authMiddleware, async (req, res) => {
  try {
    const invite = await pool.query(
      'SELECT * FROM admin_invites WHERE token=$1 AND used_by IS NULL AND expires_at > NOW()',
      [req.params.token]
    );
    if (!invite.rows.length) return res.status(404).json({ error: 'Invite not found or expired' });
    const inv = invite.rows[0];

    // Update user role
    await pool.query(
      'UPDATE users SET role=$1, admin_permissions=$2 WHERE id=$3',
      [inv.role, inv.admin_permissions, req.userId]
    );

    // Mark invite as used
    await pool.query(
      'UPDATE admin_invites SET used_by=$1, used_at=NOW() WHERE id=$2',
      [req.userId, inv.id]
    );

    res.json({ ok: true, role: inv.role, admin_permissions: inv.admin_permissions });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
