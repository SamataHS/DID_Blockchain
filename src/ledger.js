// src/ledger.js
// Simulates a blockchain ledger using a local JSON file.
// In a real system, this would be replaced by Ethereum or Hyperledger.

const fs   = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(__dirname, '../data/ledger.json');

// Load ledger from disk (creates it if it doesn't exist)
function loadLedger() {
  if (!fs.existsSync(LEDGER_PATH)) {
    const empty = { identities: [], totalBlocks: 0 };
    fs.writeFileSync(LEDGER_PATH, JSON.stringify(empty, null, 2));
  }
  return JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf-8'));
}

// Save ledger back to disk
function saveLedger(ledger) {
  fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2));
}

// Add a new identity/DID document to the ledger
// Returns false if DID already exists (no duplicates allowed)
function addIdentity(didDocument) {
  const ledger = loadLedger();
  const existing = ledger.identities.find(i => i.id === didDocument.id);
  if (existing) return false;

  didDocument.blockNumber = ledger.totalBlocks + 1;
  ledger.identities.push(didDocument);
  ledger.totalBlocks += 1;
  saveLedger(ledger);
  return true;
}

// Find one identity by DID string
function findIdentity(did) {
  const ledger = loadLedger();
  return ledger.identities.find(i => i.id === did) || null;
}

// Return all identities on the ledger
function getAllIdentities() {
  return loadLedger().identities;
}

// Return ledger stats
function getLedgerStats() {
  const ledger = loadLedger();
  return {
    totalIdentities: ledger.identities.length,
    totalBlocks:     ledger.totalBlocks
  };
}

module.exports = { addIdentity, findIdentity, getAllIdentities, getLedgerStats };
