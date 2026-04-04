require('dotenv').config();
const pool = require('./pool');

async function migrate() {
  // Add missing columns to users table
  const migrations = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS tg_invite_link TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS gift_content_id INT`,
  ];

  for (const sql of migrations) {
    try {
      await pool.query(sql);
      console.log('OK:', sql.substring(0, 60));
    } catch (err) {
      console.error('SKIP:', err.message);
    }
  }

  console.log('Migration complete');
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });
