// app.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// -------------------- Core middleware --------------------
app.use(express.json());

// Simple request logger + permissive CORS (tweak for prod)
app.use((req, res, next) => {
  console.log('Incoming:', req.method, req.url);
  res.setHeader('Access-Control-Allow-Origin', '*'); // only for dev
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// -------------------- AASA / Asset Links --------------------
// Use repo root so paths work on Render (avoids __dirname -> dist issues)
const WELL_KNOWN_DIR = path.resolve(process.cwd(), '.well-known');
const AASA_PATH = path.join(WELL_KNOWN_DIR, 'apple-app-site-association');
const ASSETLINKS_PATH = path.join(WELL_KNOWN_DIR, 'assetlinks.json');

// Boot-time visibility
console.log('[BOOT] .well-known dir:', WELL_KNOWN_DIR);
console.log('[BOOT] AASA exists:', fs.existsSync(AASA_PATH), '->', AASA_PATH);
console.log('[BOOT] AssetLinks exists:', fs.existsSync(ASSETLINKS_PATH), '->', ASSETLINKS_PATH);

// Serve AASA (no extension) with correct headers — at BOTH locations iOS may hit
function sendAASA(req, res, next) {
  try {
    if (!fs.existsSync(AASA_PATH)) {
      console.error('[AASA] File not found at', AASA_PATH);
      return res.status(404).json({ error: 'AASA missing' });
    }
    res.set('Content-Type', 'application/json');        // required
    res.set('Cache-Control', 'public, max-age=600');    // optional
    res.sendFile(AASA_PATH, (err) => err && next(err)); // no redirects
  } catch (e) {
    next(e);
  }
}
app.get('/.well-known/apple-app-site-association', sendAASA);
app.get('/apple-app-site-association', sendAASA); // some iOS versions request this root path

// Serve assetlinks.json explicitly (Android)
app.get('/.well-known/assetlinks.json', (req, res, next) => {
  try {
    if (!fs.existsSync(ASSETLINKS_PATH)) {
      console.error('[AssetLinks] File not found at', ASSETLINKS_PATH);
      return res.status(404).json({ error: 'assetlinks missing' });
    }
    res.set('Content-Type', 'application/json');
    res.sendFile(ASSETLINKS_PATH, (err) => err && next(err));
  } catch (e) {
    next(e);
  }
});

// Optional: static fallback for any other files inside .well-known
app.use(
  '/.well-known',
  express.static(WELL_KNOWN_DIR, {
    setHeaders(res, filePath) {
      // Ensure the extensionless AASA is always served as JSON even via static
      if (path.basename(filePath) === 'apple-app-site-association') {
        res.setHeader('Content-Type', 'application/json');
      }
    },
  })
);

// -------------------- App routes --------------------
const loginRoutes = require('./routes/loginRoutes');
app.use('/api/login', loginRoutes);

const registerUserRoutes = require('./routes/registerUserRoutes');
app.use('/api/registerUser', registerUserRoutes);

const otpRoutes = require('./routes/otpRoutes');
app.use('/api/sendotp', otpRoutes);

const otpVerifyRoutes = require('./routes/otpVerifyRoutes');
app.use('/api/verifyOTP', otpVerifyRoutes);

const activityRoutes = require('./routes/activityRoutes');
app.use('/api/activity', activityRoutes);

const groupRoutes = require('./routes/groupRoutes');
app.use('/api/group', groupRoutes);

const taskRoutes = require('./routes/taskRoutes');
app.use('/api/task', taskRoutes);

const subscriptionRoutes = require('./routes/subscription');
app.use('/api/subscriptionupdate', subscriptionRoutes);

const linkDataUpdateRoutes = require('./routes/linkDataUpdateRoutes');
app.use('/api/link-data', linkDataUpdateRoutes);

// Health check (useful on Render)
app.get('/_health', (req, res) => res.json({ ok: true }));

// -------------------- Error handling --------------------
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

module.exports = app;
