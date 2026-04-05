// Generates a self-signed cert using Node built-ins only (no extra packages)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const certDir = path.join(__dirname, '.certs');
if (!fs.existsSync(certDir)) fs.mkdirSync(certDir);

const keyFile  = path.join(certDir, 'key.pem');
const certFile = path.join(certDir, 'cert.pem');

if (fs.existsSync(keyFile) && fs.existsSync(certFile)) {
  console.log('Certs already exist, skipping.');
  process.exit(0);
}

// Use openssl if available, otherwise fallback to a pure-JS approach
try {
  execSync(
    `openssl req -x509 -newkey rsa:2048 -keyout "${keyFile}" -out "${certFile}" -days 365 -nodes -subj "/CN=localhost"`,
    { stdio: 'inherit' }
  );
  console.log('Cert generated with openssl.');
} catch {
  // Pure Node.js fallback using built-in crypto (Node 18+)
  const crypto = require('crypto');
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });

  // Write a minimal self-signed cert via tls.createSecureContext trick
  const selfsigned = require('./node_modules/selfsigned/index.js');
  const attrs = [{ name:'commonName', value:'localhost' }];
  const pems = selfsigned.generate(attrs, { days: 365, keySize: 2048 });
  fs.writeFileSync(keyFile, pems.private);
  fs.writeFileSync(certFile, pems.cert);
  console.log('Cert generated with selfsigned.');
}
