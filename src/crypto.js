// src/crypto.js
// Handles all cryptographic operations:
// - Generating public/private key pairs
// - Signing data with private key
// - Verifying signatures with public key

const crypto = require('crypto');

// Generate a new elliptic curve key pair (P-256 curve)
function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'P-256',
    publicKeyEncoding:  { type: 'spki',  format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  return { publicKey, privateKey };
}

// Sign any string data using a private key
// Returns a base64 string (the signature)
function signData(data, privateKeyPem) {
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  sign.end();
  return sign.sign(privateKeyPem, 'base64');
}

// Verify a signature using a public key
// Returns true if valid, false if tampered or wrong key
function verifySignature(data, signature, publicKeyPem) {
  const verify = crypto.createVerify('SHA256');
  verify.update(data);
  verify.end();
  try {
    return verify.verify(publicKeyPem, signature, 'base64');
  } catch {
    return false;
  }
}

module.exports = { generateKeyPair, signData, verifySignature };
