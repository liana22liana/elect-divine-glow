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

// ── Magic link auth (for club members via bot) ──
router.get('/access/:token', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${USER_FIELDS} FROM users WHERE access_token=$1`,
      [req.params.token]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Invalid access link' });
    const user = formatUser(result.rows[0]);
    res.json({ user, token: generateToken(user.id) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── Password reset via Telegram ──
const crypto = require('crypto');

router.post('/forgot-password', rateLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    
    const result = await pool.query(
      'SELECT id, telegram_id, role FROM users WHERE email=$1',
      [email.toLowerCase().trim()]
    );
    // Always return success to prevent email enumeration
    if (!result.rows.length) return res.json({ ok: true });
    
    const user = result.rows[0];
    // Only admins/superadmins can reset password
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return res.json({ ok: true });
    }
    if (!user.telegram_id) {
      return res.json({ ok: true });
    }
    
    // Generate reset token (valid 15 min)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    await pool.query(
      'UPDATE users SET reset_token=$1, reset_token_expires=$2 WHERE id=$3',
      [resetToken, expires, user.id]
    );
    
    // Send via Telegram
    const PLATFORM_URL = process.env.PLATFORM_URL || 'https://electplatform.dariaavilova.com';
    const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || '';
    const resetUrl = `${PLATFORM_URL}/reset-password/${resetToken}`;
    
    if (TG_BOT_TOKEN) {
      await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: user.telegram_id,
          text: `\u{1F511} Сброс пароля ELECT\n\nСсылка для смены пароля:\n${resetUrl}\n\nДействует 15 минут.`,
          parse_mode: 'HTML',
        }),
      });
    }
    
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    
    const result = await pool.query(
      'SELECT id FROM users WHERE reset_token=$1 AND reset_token_expires > NOW()',
      [token]
    );
    if (!result.rows.length) return res.status(400).json({ error: 'Invalid or expired token' });
    
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'UPDATE users SET password_hash=$1, reset_token=NULL, reset_token_expires=NULL WHERE id=$2',
      [hash, result.rows[0].id]
    );
    
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`SELECT ${USER_FIELDS} FROM users WHERE id=$1`, [req.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(formatUser(result.rows[0]));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
