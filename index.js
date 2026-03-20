// index.js
// Terminal-based interface for the DID Identity System.
// Run with: node index.js

const readline = require('readline');
const { createDID, resolveDID }  = require('./src/did');
const { login }                  = require('./src/auth');
const { getAllIdentities, getLedgerStats } = require('./src/ledger');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(q) {
  return new Promise(resolve => rl.question(q, resolve));
}

function sep() { console.log('\n' + '─'.repeat(52) + '\n'); }

async function mainMenu() {
  console.clear();
  sep();
  console.log('   DECENTRALIZED IDENTITY MANAGEMENT SYSTEM');
  console.log('   Blockchain DID Project — Node.js Terminal');
  sep();

  const stats = getLedgerStats();
  console.log(`   Ledger: ${stats.totalIdentities} identities | ${stats.totalBlocks} blocks\n`);

  console.log('  1.  Register new identity (create DID)');
  console.log('  2.  Login with DID (passwordless)');
  console.log('  3.  Resolve / view a DID document');
  console.log('  4.  List all registered identities');
  console.log('  5.  Exit\n');

  const choice = await ask('  Enter choice (1-5): ');
  switch (choice.trim()) {
    case '1': await registerIdentity(); break;
    case '2': await loginWithDID();     break;
    case '3': await resolveIdentity();  break;
    case '4': await listIdentities();   break;
    case '5':
      console.log('\n  Goodbye!\n');
      rl.close();
      return;
    default:
      console.log('\n  Invalid choice.');
      await back();
  }
}

async function registerIdentity() {
  sep();
  console.log('  REGISTER NEW IDENTITY\n');
  const name = await ask('  Enter your name: ');
  console.log('\n  Generating DID and cryptographic keys...');
  const result = createDID(name.trim());

  if (result.error) {
    console.log('\n  Error:', result.error);
  } else {
    console.log('\n  ✓ Identity created!\n');
    console.log('  Your DID:');
    console.log(' ', result.did);
    console.log('\n  Your PRIVATE KEY (save this now!):');
    console.log('  ' + '─'.repeat(44));
    console.log(result.privateKey);
    console.log('  ' + '─'.repeat(44));
    console.log('\n  WARNING: Never share your private key.');
    console.log('  You need it every time you log in.');
  }
  await back();
}

async function loginWithDID() {
  sep();
  console.log('  PASSWORDLESS LOGIN\n');
  const did = await ask('  Enter your DID: ');
  console.log('\n  Paste your private key. Type END on a new line when done:');

  let privateKey = '';
  while (true) {
    const line = await ask('');
    if (line.trim() === 'END') break;
    privateKey += line + '\n';
  }

  console.log('\n  Verifying cryptographic signature...');
  const result = login(did.trim(), privateKey.trim());

  if (result.success) {
    console.log('\n  ✓', result.message);
    console.log('  Block Number:', result.blockNumber);
    console.log('  Registered  :', result.created);
    console.log('\n  Authenticated WITHOUT a password!');
  } else {
    console.log('\n  ✗ Login failed:', result.message);
  }
  await back();
}

async function resolveIdentity() {
  sep();
  console.log('  RESOLVE DID DOCUMENT\n');
  const did = await ask('  Enter DID to resolve: ');
  const doc = resolveDID(did.trim());
  if (doc) {
    console.log('\n  DID Document found:\n');
    console.log(JSON.stringify(doc, null, 2));
  } else {
    console.log('\n  No identity found for this DID.');
  }
  await back();
}

async function listIdentities() {
  sep();
  console.log('  ALL REGISTERED IDENTITIES\n');
  const all = getAllIdentities();
  if (all.length === 0) {
    console.log('  No identities registered yet.');
  } else {
    all.forEach((i, idx) => {
      console.log(`  ${idx + 1}. ${i.name}`);
      console.log(`     DID   : ${i.id}`);
      console.log(`     Block : #${i.blockNumber}`);
      console.log(`     Date  : ${i.created}\n`);
    });
  }
  await back();
}

async function back() {
  sep();
  await ask('  Press Enter to return to menu...');
  await mainMenu();
}

mainMenu().catch(console.error);
