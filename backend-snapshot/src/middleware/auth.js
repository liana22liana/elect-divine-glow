const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  const queryToken = req.query.token;
  if (!header && !queryToken) return res.status(401).json({ error: 'No token' });
  const token = header ? header.replace('Bearer ', '') : queryToken;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    // Fetch role from DB every time for accuracy
    const result = await pool.query('SELECT role, admin_permissions FROM users WHERE id=$1', [decoded.userId]);
    if (!result.rows.length) return res.status(401).json({ error: 'User not found' });
    req.userRole = result.rows[0].role;
    req.adminPermissions = result.rows[0].admin_permissions || [];
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

function adminOnly(req, res, next) {
  if (req.userRole !== 'admin' && req.userRole !== 'superadmin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

function superadminOnly(req, res, next) {
  if (req.userRole !== 'superadmin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

module.exports = { authMiddleware, adminOnly, superadminOnly };
