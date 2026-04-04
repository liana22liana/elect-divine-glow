require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.get('/health', async (req, res) => {
  const pool = require('./db/pool');
  try { await pool.query('SELECT 1'); res.json({ status: 'ok', db: 'connected' }); }
  catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
});
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/sections', require('./routes/sections'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/ambassador', require('./routes/ambassador'));
app.use('/api/delivery-form', require('./routes/delivery'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/invites', require('./routes/invites'));
app.use('/api/webhook', require('./routes/webhook'));
const path = require('path');

// Serve frontend static files
const frontendPath = path.join(__dirname, '../../elect-frontend/dist');
app.use(express.static(frontendPath));

// SPA fallback — all non-API routes serve index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/') && !req.path.startsWith('/health')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => console.log(`ELECT API running on port ${PORT}`));
