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
// Your repo has ".well-known" at the repo root (one level above /src)
const CWD = process.cwd();
const CANDIDATES = [
  path.join(CWD, '.well-known'),        // repo/.well-known  ← expected
  path.join(CWD, 'src', '.well-known'), // repo/src/.well-known
  path.join(CWD, 'public', '.well-known')
];

function firstExistingDir(paths) {
  for (const p of paths) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isDirectory()) return p;
    } catch {}
  }
  return null;
}

const WELL_KNOWN_DIR = firstExistingDir(CANDIDATES);
const AASA_FILE = 'apple-app-site-association';
const ASSETLINKS_FILE = 'assetlinks.json';

function resolveFile(name) {
  if (!WELL_KNOWN_DIR) return null;
  const p = path.join(WELL_KNOWN_DIR, name);
  return fs.existsSync(p) ? p : null;
}

function sendJsonFile(absPath, res, next) {
  if (!absPath) return res.status(404).json({ error: 'File not found on server' });
  res.set('Content-Type', 'application/json');
  res.set('Cache-Control', 'public, max-age=600'); // optional
  res.sendFile(absPath, err => err && next(err));  // no redirects
}

/* -------------------- AASA (serve at both Apple paths) -------------------- */
function sendAASA(req, res, next) {
  return sendJsonFile(resolveFile(AASA_FILE), res, next);
}
app.get('/.well-known/apple-app-site-association', sendAASA);
app.get('/apple-app-site-association', sendAASA); // some iOS versions try the root URL

/* -------------------- Android assetlinks.json -------------------- */
app.get('/.well-known/assetlinks.json', (req, res, next) => {
  return sendJsonFile(resolveFile(ASSETLINKS_FILE), res, next);
});

/* -------------------- Optional static fallback -------------------- */
if (WELL_KNOWN_DIR) {
  app.use(
    '/.well-known',
    express.static(WELL_KNOWN_DIR, {
      setHeaders(res, filePath) {
        // ensure extensionless AASA is always served as JSON
        if (path.basename(filePath) === AASA_FILE) {
          res.setHeader('Content-Type', 'application/json');
        }
      },
    })
  );
}

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
