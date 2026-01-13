/**
 * Script to add GitHub Secrets using proper encryption
 * Uses tweetnacl for encryption (GitHub's preferred method)
 * 
 * Usage:
 *   GITHUB_TOKEN="your-token" node add-secrets-fixed.js
 */

const https = require('https');
const nacl = require('tweetnacl');
const util = require('tweetnacl-util');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = 'sharpkaif-source';
const REPO_NAME = 'AddReseller';

if (!GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

// Secrets to add
const secrets = {
  'SMTP_SERVER': 'smtp.gmail.com',
  'SMTP_PORT': '587',
  'SMTP_USERNAME': 'mohd.kashif@singleinterface.com',
  'SMTP_PASSWORD': 'pirv tvjr bqlc espa',
  'NOTIFICATION_EMAIL': 'mohd.kashif@singleinterface.com'
};

const baseUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}`;

// Helper function to make API requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Secrets-Setup',
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData || '{}'));
          } catch (e) {
            resolve({});
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Encrypt secret using GitHub's public key (using libsodium/NaCl)
function encryptSecret(secret, publicKeyBase64) {
  const publicKey = util.decodeBase64(publicKeyBase64);
  const message = util.decodeUTF8(secret);
  const encrypted = nacl.box(message, new Uint8Array(24), publicKey, new Uint8Array(32));
  return util.encodeBase64(encrypted);
}

async function addSecrets() {
  try {
    console.log('🔐 Adding GitHub Secrets...\n');

    // Get repository public key
    console.log('📦 Getting repository public key...');
    const publicKeyData = await makeRequest('GET', `${baseUrl}/actions/secrets/public-key`);
    const publicKey = publicKeyData.key;
    const keyId = publicKeyData.key_id;
    console.log('✅ Public key retrieved\n');

    // Add each secret
    for (const [secretName, secretValue] of Object.entries(secrets)) {
      console.log(`🔐 Adding secret: ${secretName}`);
      
      try {
        // GitHub uses libsodium box encryption
        const encryptedValue = encryptSecret(secretValue, publicKey);
        
        await makeRequest('PUT', `${baseUrl}/actions/secrets/${secretName}`, {
          encrypted_value: encryptedValue,
          key_id: keyId
        });
        
        console.log(`   ✅ ${secretName} added successfully\n`);
      } catch (error) {
        if (error.message.includes('404')) {
          console.log(`   ⚠️  ${secretName} might already exist\n`);
        } else {
          console.error(`   ❌ Error adding ${secretName}: ${error.message}\n`);
        }
      }
    }

    console.log('✅ Secrets setup complete!');
    console.log('\n📋 Added secrets:');
    Object.keys(secrets).forEach(name => console.log(`   - ${name}`));
    console.log(`\n🔗 Verify at: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/settings/secrets/actions`);
    console.log('\n🧪 Test by running the workflow manually');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addSecrets();
