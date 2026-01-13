/**
 * Update password WITHOUT spaces (Gmail accepts both formats, but no spaces is more reliable)
 */

const https = require('https');
const crypto = require('crypto');
const nacl = require('tweetnacl');
const util = require('tweetnacl-util');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN environment variable is required');
  process.exit(1);
}
const GITHUB_USERNAME = 'sharpkaif-source';
const REPO_NAME = 'AddReseller';

// Password WITHOUT spaces (Gmail accepts both, but this is more reliable)
const PASSWORD = 'xgmymahfuthwpnll'; // Remove spaces from 'xgmy mahf uthw pnll'

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
    console.log('🔐 Updating SMTP_PASSWORD secret WITHOUT spaces...\n');
    console.log('📝 Password format:');
    console.log('   Original (with spaces): "xgmy mahf uthw pnll"');
    console.log('   Storing (no spaces): "xgmymahfuthwpnll"');
    console.log('   Gmail accepts both formats, but no spaces is more reliable\n');

    // Get repository public key
    console.log('📦 Getting repository public key...');
    const publicKeyData = await makeRequest('GET', `${baseUrl}/actions/secrets/public-key`);
    const publicKey = publicKeyData.key;
    const keyId = publicKeyData.key_id;
    console.log('✅ Public key retrieved\n');

    // Encrypt using libsodium (more reliable)
    console.log('🔐 Encrypting password...');
    try {
      // Try RSA first
      const keyLines = publicKey.match(/.{1,64}/g) || [publicKey];
      const pemKey = `-----BEGIN PUBLIC KEY-----\n${keyLines.join('\n')}\n-----END PUBLIC KEY-----`;
      const key = crypto.createPublicKey({ key: pemKey, format: 'pem' });
      const encrypted = crypto.publicEncrypt(
        { key: key, padding: crypto.constants.RSA_PKCS1_PADDING },
        Buffer.from(PASSWORD, 'utf8')
      );
      var encryptedValue = encrypted.toString('base64');
    } catch (e) {
      // Fallback to libsodium
      const publicKeyBytes = util.decodeBase64(publicKey);
      const message = util.decodeUTF8(PASSWORD);
      const encrypted = nacl.box(message, new Uint8Array(24), publicKeyBytes, new Uint8Array(32));
      var encryptedValue = util.encodeBase64(encrypted);
    }
    console.log('✅ Password encrypted\n');

    // Update the secret
    console.log('📤 Updating secret...');
    await makeRequest('PUT', `${baseUrl}/actions/secrets/SMTP_PASSWORD`, {
      encrypted_value: encryptedValue,
      key_id: keyId
    });
    
    console.log('✅ SMTP_PASSWORD secret updated successfully!');
    console.log('   Format: Without spaces (xgmymahfuthwpnll)');
    console.log('\n🧪 Test by running the "Test Email Only" workflow');
    console.log('   If it works, then run the main workflow');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('\n💡 Make sure your token has "repo" scope');
    }
    process.exit(1);
  }
}

updatePassword();
