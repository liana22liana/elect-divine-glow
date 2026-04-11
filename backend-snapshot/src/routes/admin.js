const router = require('express').Router();
const pool = require('../db/pool');
const { authMiddleware, adminOnly, superadminOnly } = require('../middleware/auth');
const webhookModule = require('./webhook');
const { sendMagicLinkToUser, createMagicLink, isPlatformActive } = webhookModule;

const USER_FIELDS = 'id, email, name, avatar_url, subscription_status, subscription_start AS subscription_start_date, subscription_end AS subscription_end_date, ambassador_status, ambassador_status_override, delivery_form_submitted, role, admin_permissions, created_at';

// ── Stats ──
router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        (SELECT count(*) FROM users) as total_users,
        (SELECT count(*) FROM users WHERE subscription_status='active') as active_users,
        (SELECT count(*) FROM materials WHERE is_published=true) as published_materials,
        (SELECT count(*) FROM materials WHERE is_published=false OR is_published IS NULL) as draft_materials,
        (SELECT count(*) FROM habits) as total_habits,
        (SELECT count(*) FROM habit_templates) as total_templates
    `);
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── CSV Export (MUST be before /users/:id) ──
router.get('/users/export', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, subscription_status, ambassador_status, created_at FROM users ORDER BY created_at DESC`
    );
    const header = 'ID,Имя,Email,Подписка,Амбассадор,Дата регистрации\n';
    const rows = result.rows.map(u => 
      `${u.id},"${u.name}",${u.email},${u.subscription_status},${u.ambassador_status || ''},${u.created_at}`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send('\uFEFF' + header + rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── Delivery forms ──
router.get('/delivery-forms', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT df.*, u.name as user_name, u.email as user_email 
      FROM delivery_forms df JOIN users u ON df.user_id = u.id 
      ORDER BY df.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── Users ──
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${USER_FIELDS} FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows.map(u => ({ ...u, subscription_active: u.subscription_status === 'active' })));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.put('/users/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { subscription_status, ambassador_status, ambassador_status_override, role, admin_permissions, delivery_status, subscription_start, subscription_end } = req.body;
    
    const sets = [];
    const params = [];
    let idx = 1;

    if (subscription_status !== undefined) { sets.push(`subscription_status=$${idx++}`); params.push(subscription_status); }
    if (ambassador_status !== undefined) { sets.push(`ambassador_status=$${idx++}`); params.push(ambassador_status); }
    if (ambassador_status_override !== undefined) { sets.push(`ambassador_status_override=$${idx++}`); params.push(ambassador_status_override); }
    if (role !== undefined) { sets.push(`role=$${idx++}`); params.push(role); }
    if (admin_permissions !== undefined) { sets.push(`admin_permissions=$${idx++}`); params.push(admin_permissions); }
    if (subscription_start !== undefined) { sets.push(`subscription_start=$${idx++}`); params.push(subscription_start || null); }
    if (subscription_end !== undefined) { sets.push(`subscription_end=$${idx++}`); params.push(subscription_end || null); }
    if (delivery_status === 'submitted') { sets.push(`delivery_form_submitted=true`); }
    if (delivery_status === 'not_submitted') { sets.push(`delivery_form_submitted=false`); }
    if (req.body.tg_invite_link !== undefined) { sets.push(`tg_invite_link=$${idx++}`); params.push(req.body.tg_invite_link || null); }
    if (req.body.gift_content_id !== undefined) { sets.push(`gift_content_id=$${idx++}`); params.push(req.body.gift_content_id || null); }

    if (sets.length === 0) return res.status(400).json({ error: 'Nothing to update' });

    params.push(req.params.id);
    const result = await pool.query(
      `UPDATE users SET ${sets.join(', ')} WHERE id=$${idx} RETURNING ${USER_FIELDS}`,
      params
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    const user = result.rows[0];
    user.subscription_active = user.subscription_status === 'active';
    res.json(user);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── Materials CRUD ──
router.get('/materials', authMiddleware, adminOnly, async (req, res) => {
  try {
    const mats = (await pool.query('SELECT * FROM materials ORDER BY created_at DESC')).rows;
    const addl = (await pool.query('SELECT * FROM additional_materials ORDER BY order_index')).rows;
    const result = mats.map(m => ({
      ...m,
      additional_materials: addl.filter(a => String(a.content_id) === String(m.id))
    }));
    res.json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.post('/materials', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { title, description, section_id, subsection_id, type, video_url, thumbnail_url, is_published, required_ambassador_status } = req.body;
    const result = await pool.query(
      `INSERT INTO materials (title, description, section_id, subsection_id, type, video_url, thumbnail_url, is_published, required_ambassador_status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [title, description, section_id, subsection_id, type || 'video', video_url, thumbnail_url, is_published !== false, required_ambassador_status || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.put('/materials/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { title, description, section_id, subsection_id, type, video_url, thumbnail_url, is_published, required_ambassador_status } = req.body;
    const result = await pool.query(
      `UPDATE materials SET title=COALESCE($1,title), description=COALESCE($2,description), section_id=COALESCE($3,section_id), subsection_id=$4, type=COALESCE($5,type), video_url=COALESCE($6,video_url), thumbnail_url=$7, is_published=COALESCE($8,is_published), required_ambassador_status=$9 WHERE id=$10 RETURNING *`,
      [title, description, section_id, subsection_id, type, video_url, thumbnail_url, is_published, required_ambassador_status || null, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.delete('/materials/:id', authMiddleware, adminOnly, async (req, res) => {
  try { await pool.query('DELETE FROM materials WHERE id=$1', [req.params.id]); res.status(204).end(); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── Additional materials ──
router.post('/materials/:id/additional', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { title, url, type, description } = req.body;
    const maxOrder = await pool.query('SELECT COALESCE(MAX(order_index),0)+1 AS next FROM additional_materials WHERE content_id=$1', [req.params.id]);
    const result = await pool.query(
      'INSERT INTO additional_materials (content_id, title, url, type, description, order_index) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.params.id, title, url, type || 'video', description || null, maxOrder.rows[0].next]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.delete('/additional/:id', authMiddleware, adminOnly, async (req, res) => {
  try { await pool.query('DELETE FROM additional_materials WHERE id=$1', [req.params.id]); res.status(204).end(); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── Sections CRUD ──
router.post('/sections', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, icon } = req.body;
    const maxOrder = await pool.query('SELECT COALESCE(MAX(order_index),0)+1 AS next FROM library_sections');
    const result = await pool.query(
      'INSERT INTO library_sections (name, icon, order_index) VALUES ($1,$2,$3) RETURNING *',
      [name, icon || 'Gem', maxOrder.rows[0].next]
    );
    res.status(201).json({ ...result.rows[0], subsections: [] });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.put('/sections/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, icon } = req.body;
    const result = await pool.query(
      'UPDATE library_sections SET name=COALESCE($1,name), icon=COALESCE($2,icon) WHERE id=$3 RETURNING *',
      [name, icon, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.delete('/sections/:id', authMiddleware, adminOnly, async (req, res) => {
  try { await pool.query('DELETE FROM library_sections WHERE id=$1', [req.params.id]); res.status(204).end(); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── Subsections CRUD ──
router.post('/subsections', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, section_id } = req.body;
    const maxOrder = await pool.query('SELECT COALESCE(MAX(order_index),0)+1 AS next FROM library_subsections WHERE section_id=$1', [section_id]);
    const result = await pool.query(
      'INSERT INTO library_subsections (section_id, name, order_index) VALUES ($1,$2,$3) RETURNING *',
      [section_id, name, maxOrder.rows[0].next]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.put('/subsections/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      'UPDATE library_subsections SET name=COALESCE($1,name) WHERE id=$2 RETURNING *',
      [name, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.delete('/subsections/:id', authMiddleware, adminOnly, async (req, res) => {
  try { await pool.query('DELETE FROM library_subsections WHERE id=$1', [req.params.id]); res.status(204).end(); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── Templates ──
router.get('/templates', authMiddleware, adminOnly, async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM habit_templates ORDER BY created_at DESC')).rows); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.post('/templates', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { title, description, category, source_content_id } = req.body;
    const result = await pool.query(
      `INSERT INTO habit_templates (title, description, category, source_content_id, created_by_admin) VALUES ($1,$2,$3,$4,true) RETURNING *`,
      [title, description, category, source_content_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.delete('/templates/:id', authMiddleware, adminOnly, async (req, res) => {
  try { await pool.query('DELETE FROM habit_templates WHERE id=$1', [req.params.id]); res.status(204).end(); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── Send platform access link ──
router.post('/users/:id/send-access', authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await pool.query('SELECT id, name, telegram_id, access_token, subscription_status FROM users WHERE id=$1', [req.params.id]);
    if (!user.rows.length) return res.status(404).json({ error: 'User not found' });
    const u = user.rows[0];

    // Generate access token if missing
    let accessToken = u.access_token;
    if (!accessToken) {
      const crypto = require('crypto');
      accessToken = crypto.randomBytes(32).toString('hex');
      await pool.query('UPDATE users SET access_token=$1 WHERE id=$2', [accessToken, u.id]);
    }

    const PLATFORM_URL = process.env.PLATFORM_URL || 'https://electplatform.dariaavilova.com';
    const accessUrl = `${PLATFORM_URL}/access/${accessToken}`;

    // Try to send via Telegram
    const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || '';
    let sent = false;
    if (u.telegram_id && TG_BOT_TOKEN) {
      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: u.telegram_id,
            text: `\u2728 <b>ELECT Платформа</b>\n\nТвоя персональная ссылка:\n${accessUrl}\n\nСохрани её и добавь на экран «Домой» ❤\uFE0F`,
            parse_mode: 'HTML',
          }),
        });
        const tgData = await tgRes.json();
        sent = tgData.ok;
      } catch (err) { console.error('[send-access] TG error:', err.message); }
    }

    res.json({ ok: true, url: accessUrl, telegram_sent: sent });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── Reset user password (superadmin only) ──
const bcryptAdmin = require('bcrypt');

router.post('/users/:id/reset-password', authMiddleware, superadminOnly, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const hash = await bcryptAdmin.hash(password, 10);
    const result = await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2 RETURNING id, email, name', [hash, req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true, user: result.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── Delete user (superadmin only) ──
router.delete('/users/:id', authMiddleware, superadminOnly, async (req, res) => {
  try {
    const userId = req.params.id;
    if (String(userId) === String(req.userId)) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    // Delete related data first
    await pool.query('DELETE FROM habit_logs WHERE habit_id IN (SELECT id FROM habits WHERE user_id=$1)', [userId]);
    await pool.query('DELETE FROM habits WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM ambassador_gifts WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM delivery_forms WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM admin_invites WHERE used_by=$1', [userId]);
    await pool.query('DELETE FROM users WHERE id=$1', [userId]);
    res.status(204).end();
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ══════════════════════════════════════════════════════════════
// Task #4 — Переключатель «Платформа активна»  (superadmin only)
// ══════════════════════════════════════════════════════════════
router.get('/settings', authMiddleware, adminOnly, async (req, res) => {
  try {
    const r = await pool.query('SELECT key, value FROM settings');
    const obj = {};
    for (const row of r.rows) obj[row.key] = row.value;
    // Удобное булево представление
    obj.platform_active = obj.platform_active === 'true';
    res.json(obj);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.put('/settings/platform-active', authMiddleware, superadminOnly, async (req, res) => {
  try {
    const { active } = req.body;
    if (typeof active !== 'boolean') {
      return res.status(400).json({ error: 'active must be boolean' });
    }
    await pool.query(
      `INSERT INTO settings (key, value, updated_at)
       VALUES ('platform_active', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
      [active ? 'true' : 'false']
    );

    let broadcast = 0;
    // При переключении в ON — разово шлём magic link всем активным
    if (active) {
      const activeUsers = await pool.query(
        `SELECT id, telegram_id, name
           FROM users
          WHERE subscription_status='active' AND telegram_id IS NOT NULL`
      );
      for (const u of activeUsers.rows) {
        try {
          const ok = await sendMagicLinkToUser(u);
          if (ok) broadcast++;
        } catch (e) {
          console.error('[settings] broadcast error for user', u.id, e.message);
        }
      }
      console.log(`[settings] platform_active=true → broadcast sent to ${broadcast}/${activeUsers.rows.length}`);
    }

    res.json({ ok: true, platform_active: active, broadcast_sent: broadcast });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ══════════════════════════════════════════════════════════════
// Task #5 — Ручное добавление участницы (GetCourse / PayPal)
// ══════════════════════════════════════════════════════════════
router.post('/users/manual', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { tg_id, name, email, tariff, subscription_end } = req.body;
    if (!tg_id) return res.status(400).json({ error: 'tg_id required' });
    if (!subscription_end) return res.status(400).json({ error: 'subscription_end required' });

    const tgIdNum = String(tg_id).trim();
    const endDate = new Date(subscription_end);
    if (isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'invalid subscription_end date' });
    }

    const existing = await pool.query(
      'SELECT id FROM users WHERE telegram_id=$1',
      [tgIdNum]
    );

    let userId;
    if (existing.rows.length) {
      userId = existing.rows[0].id;
      await pool.query(
        `UPDATE users
            SET subscription_status='active',
                subscription_start=COALESCE(subscription_start, NOW()),
                subscription_end=$1,
                name=CASE WHEN (name='' OR name IS NULL) AND $2<>'' THEN $2 ELSE name END,
                email=COALESCE($3, email),
                tariff=COALESCE($4, tariff),
                source='manual'
          WHERE id=$5`,
        [endDate, name || '', email || null, tariff || null, userId]
      );
    } else {
      const crypto = require('crypto');
      const accessToken = crypto.randomBytes(32).toString('hex');
      const r = await pool.query(
        `INSERT INTO users
           (email, password_hash, name, telegram_id, access_token,
            subscription_status, subscription_start, subscription_end,
            tariff, source)
         VALUES ($1, '', $2, $3, $4,
                 'active', NOW(), $5, $6, 'manual')
         RETURNING id`,
        [email || null, name || '', tgIdNum, accessToken, endDate, tariff || null]
      );
      userId = r.rows[0].id;
    }

    // Отправляем magic link, если платформа активна
    let magicSent = false;
    if (await isPlatformActive()) {
      const u = await pool.query('SELECT id, telegram_id FROM users WHERE id=$1', [userId]);
      magicSent = await sendMagicLinkToUser(u.rows[0]);
    }

    const full = await pool.query(
      `SELECT ${USER_FIELDS} FROM users WHERE id=$1`, [userId]
    );
    res.json({
      ok: true,
      user: { ...full.rows[0], subscription_active: true },
      magic_link_sent: magicSent,
      platform_active: await isPlatformActive(),
    });
  } catch (err) {
    console.error('[admin/users/manual]', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
});

// Ресенд magic link на существующую участницу
router.post('/users/:id/resend-magic', authMiddleware, adminOnly, async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT id, telegram_id, subscription_status FROM users WHERE id=$1',
      [req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    const user = r.rows[0];
    if (!user.telegram_id) return res.status(400).json({ error: 'no telegram_id' });
    const sent = await sendMagicLinkToUser(user);
    res.json({ ok: true, sent });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
