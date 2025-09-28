// src/app.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

/* -------------------- Core middleware -------------------- */
app.use(express.json());
app.use((req, res, next) => {
  console.log('Incoming:', req.method, req.url);
  res.setHeader('Access-Control-Allow-Origin', '*'); // dev only
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

/* -------------------- .well-known resolver -------------------- */
/** Since you placed the folder at repo/src/.well-known, resolve from __dirname */
const WK_DIRS = [
  path.join(__dirname, '.well-known'),        // ← your case
  path.join(process.cwd(), 'src', '.well-known'),
  path.join(process.cwd(), '.well-known'),
  path.join(process.cwd(), 'public', '.well-known'),
];

function pickExistingDir(candidates) {
  for (const p of candidates) {
    try { if (fs.existsSync(p) && fs.statSync(p).isDirectory()) return p; } catch {}
  }
  return null;
}

const WELL_KNOWN_DIR = pickExistingDir(WK_DIRS);
const AASA_NAME = 'apple-app-site-association'; // no extension
const ASSETLINKS_NAME = 'assetlinks.json';

console.log('[BOOT] __dirname =', __dirname);
console.log('[BOOT] process.cwd() =', process.cwd());
console.log('[BOOT] .well-known =', WELL_KNOWN_DIR || '(NOT FOUND)');

function resolveWK(name) {
  if (!WELL_KNOWN_DIR) return null;
  const p = path.join(WELL_KNOWN_DIR, name);
  return fs.existsSync(p) ? p : null;
}

function sendJsonFile(absPath, res, next) {
  if (!absPath) return res.status(404).json({ error: 'Not Found' });
  res.set('Content-Type', 'application/json');       // required for AASA/assetlinks
  res.set('Cache-Control', 'public, max-age=600');   // optional
  res.sendFile(absPath, (err) => err && next(err));  // no redirects
}

/* -------------------- AASA (serve at both Apple paths) -------------------- */
function sendAASA(req, res, next) {
  return sendJsonFile(resolveWK(AASA_NAME), res, next);
}
app.get('/.well-known/apple-app-site-association', sendAASA);
app.get('/apple-app-site-association', sendAASA); // some iOS versions try the root URL

/* -------------------- Android assetlinks.json -------------------- */
app.get('/.well-known/assetlinks.json', (req, res, next) => {
  return sendJsonFile(resolveWK(ASSETLINKS_NAME), res, next);
});

/* -------------------- Optional static fallback -------------------- */
if (WELL_KNOWN_DIR) {
  app.use(
    '/.well-known',
    express.static(WELL_KNOWN_DIR, {
      setHeaders(res, filePath) {
        if (path.basename(filePath) === AASA_NAME) {
          res.setHeader('Content-Type', 'application/json');
        }
      },
    })
  );
}

/* -------------------- Debug helpers (remove later) -------------------- */
app.get('/_debug/wk', (req, res) => {
  let files = [];
  try { if (WELL_KNOWN_DIR) files = fs.readdirSync(WELL_KNOWN_DIR); } catch {}
  res.json({
    wellKnownDir: WELL_KNOWN_DIR || '(not found)',
    files,
    aasaFound: !!resolveWK(AASA_NAME),
    assetlinksFound: !!resolveWK(ASSETLINKS_NAME),
  });
});

// View raw contents quickly in the browser
app.get('/.well-known/_cat/:name', (req, res, next) => {
  const p = resolveWK(req.params.name);
  if (!p) return res.status(404).json({ error: 'Not Found' });
  // If it's the AASA or a .json, force JSON type
  if (req.params.name === AASA_NAME || req.params.name.endsWith('.json')) {
    res.set('Content-Type', 'application/json');
  }
  res.sendFile(p, (err) => err && next(err));
});

/* -------------------- Your existing routes -------------------- */
app.use('/api/login', require('./routes/loginRoutes'));
app.use('/api/registerUser', require('./routes/registerUserRoutes'));
app.use('/api/sendotp', require('./routes/otpRoutes'));
app.use('/api/verifyOTP', require('./routes/otpVerifyRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));
app.use('/api/group', require('./routes/groupRoutes'));
app.use('/api/task', require('./routes/taskRoutes'));
app.use('/api/subscriptionupdate', require('./routes/subscription'));
app.use('/api/link-data', require('./routes/linkDataUpdateRoutes'));

/* -------------------- Health check -------------------- */
app.get('/_health', (req, res) => res.json({ ok: true }));

/* -------------------- Error handling -------------------- */
app.use(require('./middlewares/errorHandler'));

module.exports = app;
