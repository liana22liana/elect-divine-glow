// Task #3 — Telegram бот @ElectPortal_bot
// Минимальный long-polling клиент без библиотек.
// Обрабатывает:
//   /start  — приветствие
//   /access — выдать одноразовую magic link (если подписка active)

const pool = require('../db/pool');
const webhookModule = require('../routes/webhook');
const { createMagicLink } = webhookModule;

const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '';
const API = TG_BOT_TOKEN ? `https://api.telegram.org/bot${TG_BOT_TOKEN}` : null;

let offset = 0;
let stopped = false;

async function tgApi(method, body) {
  if (!API) return null;
  try {
    const res = await fetch(`${API}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  } catch (err) {
    console.error('[bot] tgApi error:', method, err.message);
    return null;
  }
}

async function sendMessage(chatId, text) {
  return tgApi('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML' });
}

async function handleAccessCommand(tgId) {
  const r = await pool.query(
    'SELECT id, subscription_status FROM users WHERE telegram_id=$1',
    [String(tgId)]
  );
  if (!r.rows.length) {
    return sendMessage(
      tgId,
      `Не нашла тебя в базе ELECT \u{1F937}\u200D\u2640\uFE0F\n\n` +
        `Если ты оплатила подписку — напиши Лиане, она проверит.`
    );
  }
  const user = r.rows[0];
  if (user.subscription_status !== 'active') {
    return sendMessage(
      tgId,
      `Твоя подписка сейчас не активна. Оплати подписку — доступ откроется автоматически.`
    );
  }
  const url = await createMagicLink(user.id);
  return sendMessage(
    tgId,
    `\u2728 Твоя новая одноразовая ссылка на платформу:\n${url}\n\n` +
      `Ссылка сгорает после первого перехода. Если слетит сессия — жми /access снова.`
  );
}

async function handleUpdate(update) {
  const msg = update.message;
  if (!msg || !msg.text) return;
  const tgId = msg.from.id;
  const text = msg.text.trim();

  if (text === '/start') {
    await sendMessage(
      tgId,
      `Привет! Я бот клуба <b>ELECT</b> \u{1F495}\n\n` +
        `Напиши /access — и я пришлю одноразовую ссылку на платформу.`
    );
    return;
  }

  if (text === '/access') {
    await handleAccessCommand(tgId);
    return;
  }

  // Любой другой текст — короткая подсказка
  await sendMessage(
    tgId,
    `Я понимаю только /access \u{1F90D}\n` +
      `Напиши /access чтобы получить ссылку на платформу.`
  );
}

async function poll() {
  if (!API) {
    console.warn('[bot] TG_BOT_TOKEN not set — bot disabled');
    return;
  }
  // Убираем возможный webhook, чтобы long-polling работал
  await tgApi('deleteWebhook', { drop_pending_updates: false });

  console.log('[bot] ElectPortal bot started (long polling)');
  while (!stopped) {
    try {
      const res = await fetch(
        `${API}/getUpdates?timeout=25&offset=${offset}`,
        { method: 'GET' }
      );
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          handleUpdate(update).catch((e) =>
            console.error('[bot] handler error:', e.message)
          );
        }
      }
    } catch (err) {
      console.error('[bot] poll error:', err.message);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

function start() {
  // Запускаем в фоне, не блокируя старт Express
  poll().catch((e) => console.error('[bot] fatal:', e.message));
}

function stop() {
  stopped = true;
}

module.exports = { start, stop };
