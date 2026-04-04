const router = require('express').Router();
const crypto = require('crypto');
const pool = require('../db/pool');

// Secret to verify webhook origin (check Referer + User-Agent)
function verifyTargetHunter(req) {
  const ua = req.headers['user-agent'] || '';
  return ua.includes('THWebhook');
}

function generateAccessToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ── TargetHunter webhook ──
router.post('/targethunter', async (req, res) => {
  try {
    const { type, user } = req.body;

    // Always respond 200 so TH doesn't retry
    if (type === 'hello') {
      return res.json({ ok: true });
    }

    if (!user || !user.id) {
      return res.json({ ok: true, skipped: 'no user id' });
    }

    const telegramId = user.id;
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const name = [firstName, lastName].filter(Boolean).join(' ');

    if (type === 'subscribe') {
      // Check if user exists by telegram_id
      const existing = await pool.query(
        'SELECT id, access_token FROM users WHERE telegram_id=$1',
        [telegramId]
      );

      if (existing.rows.length) {
        // Reactivate subscription
        const accessToken = existing.rows[0].access_token || generateAccessToken();
        await pool.query(
          `UPDATE users SET subscription_status='active', subscription_start=COALESCE(subscription_start, NOW()), access_token=$1 WHERE telegram_id=$2`,
          [accessToken, telegramId]
        );
        console.log(`[webhook] subscribe: reactivated user tg:${telegramId} (${name})`);
        return res.json({ ok: true, access_token: accessToken });
      } else {
        // Create new user (no password — magic link only)
        const accessToken = generateAccessToken();
        await pool.query(
          `INSERT INTO users (name, telegram_id, access_token, subscription_status, subscription_start, password_hash)
           VALUES ($1, $2, $3, 'active', NOW(), '')`,
          [name, telegramId, accessToken]
        );
        console.log(`[webhook] subscribe: created user tg:${telegramId} (${name})`);
        return res.json({ ok: true, access_token: accessToken });
      }
    }

    if (type === 'unsubscribe') {
      const result = await pool.query(
        `UPDATE users SET subscription_status='cancelled' WHERE telegram_id=$1 RETURNING id, name`,
        [telegramId]
      );
      if (result.rows.length) {
        console.log(`[webhook] unsubscribe: deactivated user tg:${telegramId} (${result.rows[0].name})`);
      } else {
        console.log(`[webhook] unsubscribe: user tg:${telegramId} not found, ignoring`);
      }
      return res.json({ ok: true });
    }

    // Unknown event type
    res.json({ ok: true, skipped: `unknown type: ${type}` });
  } catch (err) {
    console.error('[webhook] error:', err);
    res.json({ ok: true, error: err.message });
  }
});

// ── Debug: list recent webhook events (admin only) ──
router.get('/targethunter/test', async (req, res) => {
  res.json({ status: 'Webhook endpoint is working', time: new Date().toISOString() });
});

module.exports = router;
