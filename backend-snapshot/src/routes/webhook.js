const router = require('express').Router();
const crypto = require('crypto');
const pool = require('../db/pool');

const PLATFORM_URL = process.env.PLATFORM_URL || 'http://83.147.247.183:3000';
const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || '';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'elect-webhook-2024';

function generateAccessToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Send Telegram message directly via Bot API
async function sendTelegramMessage(chatId, text, parseMode = 'HTML') {
  if (!TG_BOT_TOKEN) {
    console.log('[webhook] TG_BOT_TOKEN not set, skipping telegram message');
    return;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
    });
    const data = await res.json();
    if (!data.ok) console.error('[webhook] TG send error:', data.description);
  } catch (err) {
    console.error('[webhook] TG send error:', err.message);
  }
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
      let accessToken;

      // Check if user exists by telegram_id
      const existing = await pool.query(
        'SELECT id, access_token FROM users WHERE telegram_id=$1',
        [telegramId]
      );

      if (existing.rows.length) {
        // Reactivate subscription
        accessToken = existing.rows[0].access_token || generateAccessToken();
        await pool.query(
          `UPDATE users SET subscription_status='active', subscription_start=COALESCE(subscription_start, NOW()), access_token=$1 WHERE telegram_id=$2`,
          [accessToken, telegramId]
        );
        console.log(`[webhook] subscribe: reactivated user tg:${telegramId} (${name})`);
      } else {
        // Create new user (no password — magic link only)
        accessToken = generateAccessToken();
        await pool.query(
          `INSERT INTO users (name, telegram_id, access_token, subscription_status, subscription_start, password_hash)
           VALUES ($1, $2, $3, 'active', NOW(), '')`,
          [name, telegramId, accessToken]
        );
        console.log(`[webhook] subscribe: created user tg:${telegramId} (${name})`);
      }

      // Send platform link via Telegram (Variant A)
      const accessUrl = `${PLATFORM_URL}/access/${accessToken}`;
      await sendTelegramMessage(
        telegramId,
        `\u2728 <b>Добро пожаловать в ELECT!</b>\n\n` +
        `Твоя персональная ссылка на платформу:\n${accessUrl}\n\n` +
        `Сохрани её — по ней ты всегда сможешь войти. ` +
        `Добавь на экран «Домой» для быстрого доступа \u2764\uFE0F`
      );

      return res.json({ ok: true, access_token: accessToken });
    }

    if (type === 'unsubscribe') {
      const result = await pool.query(
        `UPDATE users SET subscription_status='cancelled' WHERE telegram_id=$1 RETURNING id, name`,
        [telegramId]
      );
      if (result.rows.length) {
        console.log(`[webhook] unsubscribe: deactivated user tg:${telegramId} (${result.rows[0].name})`);
        // Notify user
        await sendTelegramMessage(
          telegramId,
          `\u{1F512} Доступ к платформе ELECT приостановлен.\n\n` +
          `Оплати подписку, и доступ откроется автоматически.`
        );
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

// ── Variant B: Bot requests access link for a user ──
router.get('/access-link', async (req, res) => {
  try {
    const { tg_id, secret } = req.query;
    if (secret !== WEBHOOK_SECRET) return res.status(403).json({ error: 'Forbidden' });
    if (!tg_id) return res.status(400).json({ error: 'tg_id required' });

    const result = await pool.query(
      'SELECT access_token, subscription_status FROM users WHERE telegram_id=$1',
      [tg_id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });

    const { access_token, subscription_status } = result.rows[0];
    if (subscription_status !== 'active') {
      return res.json({ ok: false, error: 'Subscription not active' });
    }

    res.json({
      ok: true,
      url: `${PLATFORM_URL}/access/${access_token}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Health check ──
router.get('/targethunter/test', async (req, res) => {
  res.json({ status: 'Webhook endpoint is working', time: new Date().toISOString() });
});

module.exports = router;
