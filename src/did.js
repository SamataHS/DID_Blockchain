// src/did.js
// Creates and resolves DIDs (Decentralized Identifiers).
// DID format: did:local:<uuid>
// Each DID has a DID Document stored on the ledger.

const { v4: uuidv4 }            = require('uuid');
const { generateKeyPair }       = require('./crypto');
const { addIdentity, findIdentity } = require('./ledger');

// Create a brand new DID for a user
function createDID(name) {
  const did = `did:local:${uuidv4()}`;
  const { publicKey, privateKey } = generateKeyPair();

  // The DID Document — this is what gets stored on the ledger (public info only)
  const didDocument = {
    id:         did,
    name:       name,
    publicKey:  publicKey,
    created:    new Date().toISOString(),
    authentication: [{
      type:       'EcdsaSecp256r1VerificationKey2019',
      controller: did
    }],
    service: [{
      type:            'DIDManagement',
      serviceEndpoint: 'http://localhost:3000'
    }]
  };

  const success = addIdentity(didDocument);
  if (!success) {
    return { error: 'DID already exists on ledger' };
  }

  // Private key is returned ONCE and never stored — user must save it
  return { did, didDocument, privateKey };
}

// Resolve a DID — fetch its document from the ledger
function resolveDID(did) {
  return findIdentity(did);
}

// Update the name on an existing DID document
function updateDID(did, newName, privateKey) {
  const identity = findIdentity(did);
  if (!identity) return { error: 'DID not found' };
  identity.name    = newName;
  identity.updated = new Date().toISOString();
  return { success: true, didDocument: identity };
}

module.exports = { createDID, resolveDID, updateDID };
