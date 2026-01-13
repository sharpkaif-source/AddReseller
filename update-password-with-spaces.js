/**
 * Update password WITH spaces (as Gmail displays it)
 * This matches what worked in the test email
 */

const https = require('https');
const nacl = require('tweetnacl');
const util = require('tweetnacl-util');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN environment variable is required');
  process.exit(1);
}
const GITHUB_USERNAME = 'sharpkaif-source';
const REPO_NAME = 'AddReseller';

// Password WITH spaces (as Gmail displays it - this worked in test)
const PASSWORD = 'xgmy mahf uthw pnll';

const baseUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}`;

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Update-Secret',
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

async function updatePassword() {
  try {
    console.log('🔐 Updating SMTP_PASSWORD secret WITH spaces...\n');
    console.log('📝 Password: "xgmy mahf uthw pnll" (with spaces)');
    console.log('   This matches what worked in the test email\n');

    const publicKeyData = await makeRequest('GET', `${baseUrl}/actions/secrets/public-key`);
    const publicKey = publicKeyData.key;
    const keyId = publicKeyData.key_id;

    // Encrypt using libsodium
    const publicKeyBytes = util.decodeBase64(publicKey);
    const message = util.decodeUTF8(PASSWORD);
    const encrypted = nacl.box(message, new Uint8Array(24), publicKeyBytes, new Uint8Array(32));
    const encryptedValue = util.encodeBase64(encrypted);

    await makeRequest('PUT', `${baseUrl}/actions/secrets/SMTP_PASSWORD`, {
      encrypted_value: encryptedValue,
      key_id: keyId
    });
    
    console.log('✅ SMTP_PASSWORD secret updated with spaces!');
    console.log('   Format: "xgmy mahf uthw pnll" (with spaces)');
    console.log('\n🧪 Test by running the main workflow again');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updatePassword();
