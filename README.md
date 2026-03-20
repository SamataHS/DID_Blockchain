# Decentralized Identity Management System
### Blockchain-Based DID Project | College Submission

---

## What is This Project?

This project implements a **Decentralized Identity Management System** based on the **W3C DID (Decentralized Identifiers) specification**. Instead of relying on a central authority like Google, Facebook, or a bank to verify who you are, users **own their identity** through cryptographic key pairs stored on a blockchain ledger.

> **Core Idea:** You prove who you are using a private key (like a digital signature) — no username, no password, no middleman.

---

## Problem Statement

Traditional identity systems have major problems:

| Problem | Traditional System | Decentralized Identity |
|---|---|---|
| Who controls your identity? | Company (Google, Facebook) | You |
| What if the company shuts down? | You lose access | Your identity still exists |
| Password leaks / hacks | Very common | Not possible (no passwords) |
| Privacy | Company owns your data | You control your data |
| Single point of failure | Yes | No |

---

## Key Concepts

### DID (Decentralized Identifier)
A unique identifier that looks like this:
```
did:local:550e8400-e29b-41d4-a716-446655440000
```
It belongs only to you and is stored on the blockchain ledger.

### DID Document
A JSON record stored on the ledger containing:
- Your DID (unique ID)
- Your name
- Your **public key** (used to verify your identity)
- Timestamp of creation

### Key Pair
- **Public Key** → stored on the ledger, visible to everyone
- **Private Key** → kept only by YOU, never stored anywhere

### How Authentication Works (Without a Password)
1. You send your DID to the server
2. Server creates a random **challenge** (e.g. `login-challenge-1710000000`)
3. You **sign** the challenge with your private key
4. Server **verifies** the signature using your public key from the ledger
5. If it matches → you are authenticated!

This is called **cryptographic proof of identity**.

---

## Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | Backend runtime |
| Express.js | Web server / REST API |
| Node crypto (built-in) | Key generation, signing, verification |
| Elliptic Curve P-256 | Cryptographic algorithm |
| JSON file (ledger.json) | Simulated blockchain ledger |
| HTML / CSS / JavaScript | Frontend web interface |
| UUID | Generating unique DIDs |

---

## Project Folder Structure

```
did-identity-project/
│
├── src/
│   ├── crypto.js        → Key generation, signing, verification
│   ├── did.js           → Create and resolve DIDs
│   ├── ledger.js        → Read/write to blockchain ledger
│   └── auth.js          → Passwordless login logic
│
├── public/
│   ├── index.html       → Web interface
│   └── style.css        → Styling
│
├── data/
│   └── ledger.json      → Stores all registered identities (auto-created)
│
├── server.js            → Express web server + REST API
├── index.js             → Terminal-based interface
├── package.json         → Project dependencies
└── README.md            → This file
```

---

## How to Run the Project

### Prerequisites
- Node.js installed (version 14 or above)
- VS Code or any terminal

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Run the web app
```bash
node server.js
```

### Step 3 — Open in browser
```
http://localhost:3000
```

### Alternative — Run terminal version
```bash
node index.js
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Register a new DID identity |
| POST | `/api/login` | Authenticate using DID + private key |
| GET | `/api/resolve/:did` | Fetch a DID document from the ledger |
| GET | `/api/identities` | List all registered identities |

### Example: Register
**Request:**
```json
POST /api/register
{
  "name": "Arjun Sharma"
}
```
**Response:**
```json
{
  "did": "did:local:550e8400-e29b-41d4-a716-446655440000",
  "didDocument": {
    "id": "did:local:550e8400-...",
    "name": "Arjun Sharma",
    "publicKey": "-----BEGIN PUBLIC KEY-----\n...",
    "created": "2024-03-20T10:00:00.000Z"
  },
  "privateKey": "-----BEGIN PRIVATE KEY-----\n..."
}
```

### Example: Login
**Request:**
```json
POST /api/login
{
  "did": "did:local:550e8400-...",
  "privateKey": "-----BEGIN PRIVATE KEY-----\n..."
}
```
**Response:**
```json
{
  "success": true,
  "message": "Welcome back, Arjun Sharma!"
}
```

---

## How the Cryptography Works

This project uses **Elliptic Curve Digital Signature Algorithm (ECDSA)** with the **P-256 curve** (also called secp256r1), which is the same algorithm used in real-world DID systems and HTTPS.

```
Key Generation:
  generateKeyPairSync('ec', { namedCurve: 'P-256' })
  → produces a public key + private key

Signing:
  createSign('SHA256') → sign(challenge) → base64 signature

Verification:
  createVerify('SHA256') → verify(challenge, signature, publicKey) → true/false
```

The private key is **never stored** on the server or ledger at any point. Only the public key is stored. This means even if the ledger is hacked, nobody can impersonate you.

---

## Demo Walkthrough

### 1. Register a new identity
- Go to the **Register Identity** tab
- Enter your name
- Click **Generate My DID**
- You receive a unique DID and a private key — **copy and save both**

### 2. Login without a password
- Go to the **Login** tab
- Paste your DID
- Paste your private key
- Click **Authenticate**
- You are verified using cryptographic signature — no password needed

### 3. Resolve a DID
- Go to the **Resolve DID** tab
- Paste any registered DID
- View the full DID Document stored on the ledger

### 4. View all identities
- Go to the **All Identities** tab
- See every registered identity (name, DID, timestamp)

---

## Real-World Connection

This project is inspired by real W3C and industry standards:

| Standard / Project | Connection to This Project |
|---|---|
| W3C DID Specification | DID format (`did:method:id`) |
| Microsoft ION | DID on Bitcoin blockchain |
| Ethereum DID | DID on Ethereum |
| Hyperledger Indy | Enterprise DID system |
| FIDO2 / Passkeys | Same concept — no passwords |

In production systems, the `ledger.json` file would be replaced by an actual blockchain (Ethereum, Hyperledger, etc.), and the DID method would be registered globally.

---

## Limitations (for future work)

- The ledger is a local JSON file — in production this would be a real blockchain
- Private keys are managed manually — a real system would use a secure wallet
- No revocation mechanism (cannot deactivate a DID yet)
- No Verifiable Credentials (VCs) support — next extension of this project

---

## What I Learned

- How decentralized identity works and why it matters
- Elliptic curve cryptography — key generation, signing, verification
- How digital signatures replace passwords
- REST API development with Express.js
- The W3C DID specification and real-world DID systems

---

## References

- W3C DID Core Specification: https://www.w3.org/TR/did-core/
- Node.js Crypto Documentation: https://nodejs.org/api/crypto.html
- Decentralized Identity Foundation: https://identity.foundation/
- Microsoft ION DID: https://identity.foundation/ion/

---

*Project developed as part of Blockchain Technology coursework.*
