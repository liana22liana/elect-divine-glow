// Task #6 — Автопроверка истечения подписки
// Раз в сутки помечает просроченные подписки как inactive.
// Вызов: require('./jobs/subscription-expiry').start()

const pool = require('../db/pool');

const DAY_MS = 24 * 60 * 60 * 1000;

async function runExpiryCheck() {
  try {
    const r = await pool.query(
      `UPDATE users
          SET subscription_status='inactive'
        WHERE subscription_status='active'
          AND subscription_end IS NOT NULL
          AND subscription_end < NOW()
      RETURNING id, telegram_id, name`
    );
    if (r.rows.length) {
      console.log(
        `[expiry] deactivated ${r.rows.length} users:`,
        r.rows.map((u) => `${u.id}(${u.name})`).join(', ')
      );
    } else {
      console.log('[expiry] nothing to deactivate');
    }
  } catch (err) {
    console.error('[expiry] error:', err.message);
  }
}

function msUntilNext3amMsk() {
  // МСК = UTC+3. В UTC 03:00 МСК = 00:00 UTC.
  const now = new Date();
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
  );
  if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
  return next.getTime() - now.getTime();
}

function start() {
  // Первый запуск — сразу при старте (синхронизация после рестарта)
  runExpiryCheck();
  // Затем каждый день в 03:00 МСК
  const delay = msUntilNext3amMsk();
  console.log(`[expiry] next run in ${Math.round(delay / 1000 / 60)} min`);
  setTimeout(function scheduleNext() {
    runExpiryCheck();
    setTimeout(scheduleNext, DAY_MS);
  }, delay);
}

module.exports = { start, runExpiryCheck };
