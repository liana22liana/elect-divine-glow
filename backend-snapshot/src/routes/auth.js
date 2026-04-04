const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

// Simple in-memory rate limiter for auth endpoints
const attempts = new Map(); // ip -> { count, resetAt }
const RATE_LIMIT = 10; // max attempts
const RATE_WINDOW = 15 * 60 * 1000; // 15 minutes

function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && entry.resetAt > now) {
    if (entry.count >= RATE_LIMIT) {
      return res.status(429).json({ error: 'Too many attempts, try again later' });
    }
    entry.count++;
  } else {
    attempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
  }
  next();
}

// Cleanup stale entries every 30 min
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of attempts) {
    if (entry.resetAt <= now) attempts.delete(ip);
  }
}, 30 * 60 * 1000);

const USER_FIELDS = 'id, email, name, avatar_url, subscription_status, subscription_start AS subscription_start_date, subscription_end AS subscription_end_date, ambassador_status, ambassador_status_override, delivery_form_submitted, role, admin_permissions, created_at';

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

function formatUser(row) {
  return {
    ...row,
    subscription_active: row.subscription_status === 'active',
  };
}

router.post('/register', rateLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase().trim()]);
    if (exists.rows.length) return res.status(409).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, subscription_status) VALUES ($1,$2,$3,'inactive') RETURNING ${USER_FIELDS}`,
      [email.toLowerCase().trim(), hash, name || '']
    );
    const user = formatUser(result.rows[0]);
    res.status(201).json({ user, token: generateToken(user.id) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.post('/login', rateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const result = await pool.query(`SELECT password_hash, ${USER_FIELDS} FROM users WHERE email=$1`, [email.toLowerCase().trim()]);
    if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const row = result.rows[0];
    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const { password_hash, ...user } = row;
    res.json({ user: formatUser(user), token: generateToken(user.id) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.post('/logout', (req, res) => res.json({ ok: true }));

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`SELECT ${USER_FIELDS} FROM users WHERE id=$1`, [req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(formatUser(result.rows[0]));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
