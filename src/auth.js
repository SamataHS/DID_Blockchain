// src/auth.js
// Passwordless authentication using digital signatures.
//
// Flow:
//  1. User provides their DID + private key
//  2. Server creates a random challenge string
//  3. User signs the challenge with their private key
//  4. Server verifies the signature using the public key stored on the ledger
//  5. If valid → authenticated!  No password ever needed.

const { signData, verifySignature } = require('./crypto');
const { findIdentity }              = require('./ledger');

function login(did, privateKeyPem) {
  // Step 1: Look up the DID on the ledger
  const identity = findIdentity(did);
  if (!identity) {
    return { success: false, message: 'DID not found on ledger' };
  }

  // Step 2: Create a random challenge (prevents replay attacks)
  const challenge = `did-auth-challenge::${did}::${Date.now()}::${Math.random()}`;

  // Step 3: Sign the challenge with the provided private key
  let signature;
  try {
    signature = signData(challenge, privateKeyPem);
  } catch (e) {
    return { success: false, message: 'Invalid private key format' };
  }

  // Step 4: Verify the signature using the public key from the ledger
  const isValid = verifySignature(challenge, signature, identity.publicKey);

  if (isValid) {
    return {
      success:     true,
      message:     `Welcome back, ${identity.name}!`,
      did:         identity.id,
      name:        identity.name,
      blockNumber: identity.blockNumber,
      created:     identity.created
    };
  } else {
    return { success: false, message: 'Signature verification failed. Wrong private key?' };
  }
}

module.exports = { login };
