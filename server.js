// server.js
// Express web server exposing REST API endpoints.
// Serves the frontend from /public folder.

const express = require('express');
const path    = require('path');

const { createDID, resolveDID }          = require('./src/did');
const { login }                          = require('./src/auth');
const { getAllIdentities, getLedgerStats } = require('./src/ledger');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── ROUTES ────────────────────────────────────────────────────────────────

// POST /api/register  →  Create a new DID identity
app.post('/api/register', (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }
  const result = createDID(name.trim());
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result);
});

// POST /api/login  →  Authenticate using DID + private key
app.post('/api/login', (req, res) => {
  const { did, privateKey } = req.body;
  if (!did || !privateKey) {
    return res.status(400).json({ error: 'DID and private key are required' });
  }
  const result = login(did.trim(), privateKey.trim());
  res.json(result);
});

// GET /api/resolve/:did  →  Fetch a DID Document from the ledger
app.get('/api/resolve/:did', (req, res) => {
  const did = decodeURIComponent(req.params.did);
  const doc = resolveDID(did);
  if (!doc) return res.status(404).json({ error: 'DID not found on ledger' });
  res.json(doc);
});

// GET /api/identities  →  List all registered identities (public info only)
app.get('/api/identities', (req, res) => {
  const all = getAllIdentities().map(i => ({
    id:          i.id,
    name:        i.name,
    created:     i.created,
    blockNumber: i.blockNumber
  }));
  res.json(all);
});

// GET /api/stats  →  Ledger statistics
app.get('/api/stats', (req, res) => {
  res.json(getLedgerStats());
});

// ─── START ─────────────────────────────────────────────────────────────────

const PORT = 3000;
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   DID Identity System — Server Started   ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`\n  Open in browser: http://localhost:${PORT}\n`);
});
