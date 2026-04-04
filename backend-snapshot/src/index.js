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

// Assets with hash in filename — cache aggressively
app.use('/assets', express.static(path.join(frontendPath, 'assets'), {
  maxAge: '1y',
  immutable: true,
}));

// Other static files (icons, manifest) — short cache
app.use(express.static(frontendPath, {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    // Never cache index.html even if served as static
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  },
}));

// SPA fallback — all non-API routes serve index.html with no-cache
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/') && !req.path.startsWith('/health')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => console.log(`ELECT API running on port ${PORT}`));
