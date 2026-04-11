const router = require('express').Router();
const crypto = require('crypto');
const pool = require('../db/pool');

const PLATFORM_URL = process.env.PLATFORM_URL || 'https://electplatform.dariaavilova.com';
const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'elect-webhook-2024';
const PRODAMUS_SECRET = process.env.PRODAMUS_SECRET_KEY || '';

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function generateAccessToken() {
  return crypto.randomBytes(32).toString('hex');
}

function generateMagicToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Send Telegram message directly via Bot API
async function sendTelegramMessage(chatId, text, parseMode = 'HTML') {
  if (!TG_BOT_TOKEN) {
    console.log('[webhook] TG_BOT_TOKEN not set, skipping telegram message');
    return false;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
    });
    const data = await res.json();
    if (!data.ok) {
      console.error('[webhook] TG send error:', data.description);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[webhook] TG send error:', err.message);
    return false;
  }
}

// settings.platform_active → boolean
async function isPlatformActive() {
  try {
    const r = await pool.query(`SELECT value FROM settings WHERE key='platform_active'`);
    return r.rows.length > 0 && r.rows[0].value === 'true';
  } catch (err) {
    console.error('[webhook] settings read error:', err.message);
    return false;
  }
}

// Create a one-time magic link for the user and return full URL
async function createMagicLink(userId) {
  const token = generateMagicToken();
  await pool.query(
    `INSERT INTO magic_links (user_id, token) VALUES ($1, $2)`,
    [userId, token]
  );
  return `${PLATFORM_URL}/access/${token}`;
}

async function sendMagicLinkToUser(user) {
  if (!user.telegram_id) {
    console.log(`[webhook] user id:${user.id} has no telegram_id, cannot send magic link`);
    return false;
  }
  const url = await createMagicLink(user.id);
  const text =
    `\u2728 <b>Добро пожаловать в ELECT!</b>\n\n` +
    `Твоя персональная ссылка для входа на платформу:\n${url}\n\n` +
    `\u26A0\uFE0F Ссылка одноразовая — при первом переходе она привяжется к твоему Telegram.\n` +
    `Если вдруг слетит сессия — напиши боту /access и получишь новую.`;
  return sendTelegramMessage(user.telegram_id, text);
}

// Экспорт для admin роута (ручное добавление / toggle platform_active)
module.exports.sendMagicLinkToUser = sendMagicLinkToUser;
module.exports.createMagicLink = createMagicLink;
module.exports.isPlatformActive = isPlatformActive;

// ──────────────────────────────────────────────────────────────
// Prodamus signature verification
// HMAC-SHA256 поверх отсортированных полей формы.
// Парадамус подписывает тело запроса (application/x-www-form-urlencoded)
// ключом платёжной страницы. Подпись приходит в заголовке Sign.
// ──────────────────────────────────────────────────────────────

function flattenForSign(obj, prefix = '') {
  // Сортировка по ключам + рекурсивная развёртка массивов/объектов — так
  // Парадамус собирает строку для подписи.
  const result = {};
  const keys = Object.keys(obj).sort();
  for (const k of keys) {
    const v = obj[k];
    const path = prefix ? `${prefix}[${k}]` : k;
    if (v !== null && typeof v === 'object') {
      Object.assign(result, flattenForSign(v, path));
    } else {
      result[path] = v == null ? '' : String(v);
    }
  }
  return result;
}

function verifyProdamusSignature(body, providedSign) {
  if (!PRODAMUS_SECRET) {
    console.warn('[prodamus] PRODAMUS_SECRET_KEY not set — signature NOT verified');
    return true; // dev-режим, чтобы не блокировать первый запуск
  }
  if (!providedSign) return false;

  const copy = { ...body };
  delete copy.signature;
  delete copy.sign;
  delete copy.Sign;

  const flat = flattenForSign(copy);
  const stringToSign = Object.keys(flat)
    .sort()
    .map((k) => `${k}=${flat[k]}`)
    .join('&');

  const expected = crypto
    .createHmac('sha256', PRODAMUS_SECRET)
    .update(stringToSign)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(String(providedSign), 'hex')
    );
  } catch {
    return false;
  }
}

// ──────────────────────────────────────────────────────────────
// Upsert user from Prodamus payload
// ──────────────────────────────────────────────────────────────

async function upsertProdamusUser({ tgId, email, phone, name, subscriptionId, subscriptionName }) {
  if (!tgId) throw new Error('tg_user_id is required');

  const existing = await pool.query(
    'SELECT id, telegram_id, email, name FROM users WHERE telegram_id=$1',
    [tgId]
  );

  if (existing.rows.length) {
    await pool.query(
      `UPDATE users
         SET subscription_status='active',
             subscription_start=COALESCE(subscription_start, NOW()),
             subscription_end=NOW() + INTERVAL '30 days',
             email=COALESCE($1, email),
             phone=COALESCE($2, phone),
             name=CASE WHEN (name='' OR name IS NULL) AND $3<>'' THEN $3 ELSE name END,
             tariff=COALESCE($4, tariff),
             source='prodamus',
             prodamus_subscription_id=COALESCE($5, prodamus_subscription_id)
       WHERE telegram_id=$6`,
      [email || null, phone || null, name || '', subscriptionName || null, subscriptionId || null, tgId]
    );
    const r = await pool.query('SELECT * FROM users WHERE telegram_id=$1', [tgId]);
    return { user: r.rows[0], created: false };
  }

  // Новая участница: email может быть null, password_hash — пустой
  const accessToken = generateAccessToken();
  const r = await pool.query(
    `INSERT INTO users
       (email, password_hash, name, telegram_id, phone, access_token,
        subscription_status, subscription_start, subscription_end,
        tariff, source, prodamus_subscription_id)
     VALUES ($1, '', $2, $3, $4, $5,
             'active', NOW(), NOW() + INTERVAL '30 days',
             $6, 'prodamus', $7)
     RETURNING *`,
    [email || null, name || '', tgId, phone || null, accessToken, subscriptionName || null, subscriptionId || null]
  );
  return { user: r.rows[0], created: true };
}

// ──────────────────────────────────────────────────────────────
// ── Prodamus webhook ──
// POST /api/webhook/prodamus
// ──────────────────────────────────────────────────────────────
router.post('/prodamus', async (req, res) => {
  // Всегда отвечаем 200 — иначе Парадамус сделает до 11 повторов
  const ack = (extra = {}) => res.status(200).json({ ok: true, ...extra });

  try {
    const body = req.body || {};
    const sign = req.get('Sign') || req.get('sign') || body.signature || body.sign;

    if (!verifyProdamusSignature(body, sign)) {
      console.warn('[prodamus] invalid signature, rejecting');
      return res.status(200).json({ ok: false, error: 'invalid_signature' });
    }

    const paymentStatus = body.payment_status || '';
    const sub = body.subscription || {};
    const subType = sub.type || '';
    const actionCode = sub.action_code || '';
    const subId = sub.id || body.subscription_id || null;
    const subName = sub.name || body.subscription_name || null;

    const extra = body.customer_extra || {};
    const tgId =
      extra.tg_user_id ||
      extra['tg_user_id'] ||
      body.tg_user_id ||
      null;
    const email = extra['E-mail'] || extra.email || body.customer_email || null;
    const phone = body.customer_phone || null;
    const nm = body.customer_name || body.name || '';

    console.log('[prodamus] incoming', {
      payment_status: paymentStatus,
      subType,
      actionCode,
      tgId,
      subId,
    });

    if (!tgId) {
      console.warn('[prodamus] no tg_user_id in payload — cannot link user');
      return ack({ skipped: 'no_tg_user_id' });
    }

    // Успешная оплата / автопродление
    const isSuccess =
      actionCode === 'auto_payment' ||
      (paymentStatus === 'success' && subType !== 'notification');

    if (isSuccess) {
      const { user, created } = await upsertProdamusUser({
        tgId: String(tgId),
        email,
        phone,
        name: nm,
        subscriptionId: subId,
        subscriptionName: subName,
      });
      console.log(
        `[prodamus] ${created ? 'created' : 'renewed'} user id:${user.id} tg:${tgId}`
      );

      // Magic link — только если платформа активна (task #4)
      if (await isPlatformActive()) {
        await sendMagicLinkToUser(user);
      } else {
        console.log('[prodamus] platform_active=false → magic link NOT sent');
      }
      return ack({ action: 'activated', user_id: user.id });
    }

    // Деактивация / окончательное завершение
    if (actionCode === 'deactivation' || actionCode === 'finish') {
      const r = await pool.query(
        `UPDATE users
            SET subscription_status='inactive'
          WHERE telegram_id=$1
        RETURNING id, name`,
        [String(tgId)]
      );
      if (r.rows.length) {
        console.log(`[prodamus] deactivated user tg:${tgId} (${r.rows[0].name})`);
      } else {
        console.log(`[prodamus] deactivate: user tg:${tgId} not found`);
      }
      return ack({ action: 'deactivated' });
    }

    // Notification / другие типы — просто логируем
    return ack({ skipped: `type=${subType} action=${actionCode}` });
  } catch (err) {
    console.error('[prodamus] handler error:', err);
    // Возвращаем 200 чтобы не триггерить 11 повторов, но фиксируем ошибку
    return res.status(200).json({ ok: false, error: err.message });
  }
});

// Health-check specifically for Prodamus
router.get('/prodamus/test', (req, res) => {
  res.json({ status: 'prodamus webhook alive', time: new Date().toISOString() });
});

// ──────────────────────────────────────────────────────────────
// ── TargetHunter webhook (unchanged, existing traffic) ──
// ──────────────────────────────────────────────────────────────
router.post('/targethunter', async (req, res) => {
  try {
    const { type, user } = req.body;

    if (type === 'hello') return res.json({ ok: true });
    if (!user || !user.id) return res.json({ ok: true, skipped: 'no user id' });

    const telegramId = user.id;
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const name = [firstName, lastName].filter(Boolean).join(' ');

    if (type === 'subscribe') {
      let accessToken;
      const existing = await pool.query(
        'SELECT id, access_token FROM users WHERE telegram_id=$1',
        [telegramId]
      );
      if (existing.rows.length) {
        accessToken = existing.rows[0].access_token || generateAccessToken();
        await pool.query(
          `UPDATE users SET subscription_status='active',
             subscription_start=COALESCE(subscription_start, NOW()),
             access_token=$1
           WHERE telegram_id=$2`,
          [accessToken, telegramId]
        );
        console.log(`[webhook] TH subscribe: reactivated tg:${telegramId} (${name})`);
      } else {
        accessToken = generateAccessToken();
        await pool.query(
          `INSERT INTO users (name, telegram_id, access_token, subscription_status, subscription_start, password_hash)
           VALUES ($1, $2, $3, 'active', NOW(), '')`,
          [name, telegramId, accessToken]
        );
        console.log(`[webhook] TH subscribe: created tg:${telegramId} (${name})`);
      }

      const accessUrl = `${PLATFORM_URL}/access/${accessToken}`;
      await sendTelegramMessage(
        telegramId,
        `\u2728 <b>Добро пожаловать в ELECT!</b>\n\n` +
          `Твоя персональная ссылка на платформу:\n${accessUrl}\n\n` +
          `Сохрани её \u2764\uFE0F`
      );
      return res.json({ ok: true, access_token: accessToken });
    }

    if (type === 'unsubscribe') {
      const result = await pool.query(
        `UPDATE users SET subscription_status='cancelled' WHERE telegram_id=$1 RETURNING id, name`,
        [telegramId]
      );
      if (result.rows.length) {
        await sendTelegramMessage(
          telegramId,
          `\u{1F512} Доступ к платформе ELECT приостановлен.\n\n` +
            `Оплати подписку, и доступ откроется автоматически.`
        );
      }
      return res.json({ ok: true });
    }

    res.json({ ok: true, skipped: `unknown type: ${type}` });
  } catch (err) {
    console.error('[webhook] TH error:', err);
    res.json({ ok: true, error: err.message });
  }
});

// ── Variant B: Bot requests access link ──
router.get('/access-link', async (req, res) => {
  try {
    const { tg_id, secret } = req.query;
    if (secret !== WEBHOOK_SECRET) return res.status(403).json({ error: 'Forbidden' });
    if (!tg_id) return res.status(400).json({ error: 'tg_id required' });

    const result = await pool.query(
      'SELECT id, access_token, subscription_status FROM users WHERE telegram_id=$1',
      [tg_id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });

    const { id, access_token, subscription_status } = result.rows[0];
    if (subscription_status !== 'active') {
      return res.json({ ok: false, error: 'Subscription not active' });
    }

    // Одноразовая ссылка из magic_links
    const url = await createMagicLink(id);
    res.json({ ok: true, url, legacy_url: `${PLATFORM_URL}/access/${access_token}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/targethunter/test', (req, res) => {
  res.json({ status: 'Webhook endpoint is working', time: new Date().toISOString() });
});

module.exports.router = router;
// Экспорт по-умолчанию — сам router, чтобы index.js работал без изменений
module.exports = Object.assign(router, module.exports);
