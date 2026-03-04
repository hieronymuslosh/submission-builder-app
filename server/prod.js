import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { mountNarrativeApi } from './narrative.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '200kb' }));

// ---- Basic auth (prototype) ----
const APP_PASSWORD = process.env.APP_PASSWORD || '';

const unauthorized = (res) => {
  res.set('WWW-Authenticate', 'Basic realm="Submission Builder"');
  return res.status(401).send('Authentication required');
};

app.use((req, res, next) => {
  if (!APP_PASSWORD) {
    return res.status(500).send('APP_PASSWORD is not set');
  }

  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) return unauthorized(res);

  const b64 = header.slice('Basic '.length).trim();
  let decoded = '';
  try {
    decoded = Buffer.from(b64, 'base64').toString('utf8');
  } catch {
    return unauthorized(res);
  }

  const idx = decoded.indexOf(':');
  if (idx < 0) return unauthorized(res);

  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);

  if (!user || pass !== APP_PASSWORD) return unauthorized(res);

  next();
});

// ---- API ----
mountNarrativeApi(app);

// ---- Static frontend ----
const distDir = path.resolve(__dirname, '../dist');
app.use(express.static(distDir));

// SPA fallback (Express v5 compatible)
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const PORT = 8080;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Prod server listening on http://127.0.0.1:${PORT}`);
});
