-- Migration for Prodamus webhook + magic link + platform toggle
-- Task #1, #2, #4, #6 from CLAUDE.md
-- Safe to run multiple times.

-- 1. Magic link (one-time tokens bound to telegram_id)
CREATE TABLE IF NOT EXISTS magic_links (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token        VARCHAR(255) UNIQUE NOT NULL,
  used         BOOLEAN DEFAULT false,
  used_at      TIMESTAMP,
  bound_tg_id  BIGINT,           -- TG ID закрепляется на сессию при первом входе
  created_at   TIMESTAMP DEFAULT NOW(),
  expires_at   TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);
CREATE INDEX IF NOT EXISTS idx_magic_links_user  ON magic_links(user_id);

-- 2. Настройки платформы (ключ/значение)
CREATE TABLE IF NOT EXISTS settings (
  key        VARCHAR(64) PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Платформа по умолчанию выключена — Даша/Лиана наполняют контент
INSERT INTO settings (key, value)
VALUES ('platform_active', 'false')
ON CONFLICT (key) DO NOTHING;

-- 3. Дополнительные поля в users для prodamus + tariff + source
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone                  VARCHAR(32);
ALTER TABLE users ADD COLUMN IF NOT EXISTS tariff                 VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS source                 VARCHAR(32); -- prodamus | getcourse | paypal | manual
ALTER TABLE users ADD COLUMN IF NOT EXISTS prodamus_subscription_id VARCHAR(64);

-- users.email / password_hash: prodamus может не прислать email — снимаем NOT NULL
ALTER TABLE users ALTER COLUMN email         DROP NOT NULL;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
