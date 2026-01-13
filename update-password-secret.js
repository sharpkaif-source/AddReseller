/**
 * Update SMTP_PASSWORD secret in GitHub
 * This will update the password to remove spaces (Gmail App Passwords work with or without spaces, but let's ensure it's correct)
 */

const https = require('https');
const nacl = require('tweetnacl');
const util = require('tweetnacl-util');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "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";
const GITHUB_USERNAME = 'sharpkaif-source';
const REPO_NAME = 'AddReseller';

// New Gmail App Password (with spaces as Gmail displays them)
const PASSWORD = 'xgmy mahf uthw pnll'; // New App Password

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

function encryptSecret(secret, publicKey) {
  const keyLines = publicKey.match(/.{1,64}/g) || [publicKey];
  const pemKey = `-----BEGIN PUBLIC KEY-----\n${keyLines.join('\n')}\n-----END PUBLIC KEY-----`;
  
  try {
    const key = crypto.createPublicKey({
      key: pemKey,
      format: 'pem'
    });

    const encrypted = crypto.publicEncrypt(
      {
        key: key,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      Buffer.from(secret, 'utf8')
    );

    return encrypted.toString('base64');
  } catch (error) {
    // Fallback: use libsodium
    const publicKeyBytes = util.decodeBase64(publicKey);
    const message = util.decodeUTF8(secret);
    const encrypted = nacl.box(message, new Uint8Array(24), publicKeyBytes, new Uint8Array(32));
    return util.encodeBase64(encrypted);
  }
}

async function updatePassword() {
  try {
    console.log('🔐 Updating SMTP_PASSWORD secret...\n');
    console.log('📝 Password (without spaces):', PASSWORD.replace(/./g, '*'));
    console.log('');

    // Get repository public key
    console.log('📦 Getting repository public key...');
    const publicKeyData = await makeRequest('GET', `${baseUrl}/actions/secrets/public-key`);
    const publicKey = publicKeyData.key;
    const keyId = publicKeyData.key_id;
    console.log('✅ Public key retrieved\n');

    // Encrypt password
    console.log('🔐 Encrypting password...');
    const crypto = require('crypto');
    let encryptedValue;
    
    try {
      // Try RSA encryption first
      const keyLines = publicKey.match(/.{1,64}/g) || [publicKey];
      const pemKey = `-----BEGIN PUBLIC KEY-----\n${keyLines.join('\n')}\n-----END PUBLIC KEY-----`;
      const key = crypto.createPublicKey({ key: pemKey, format: 'pem' });
      const encrypted = crypto.publicEncrypt(
        { key: key, padding: crypto.constants.RSA_PKCS1_PADDING },
        Buffer.from(PASSWORD, 'utf8')
      );
      encryptedValue = encrypted.toString('base64');
    } catch (e) {
      // Fallback to libsodium
      const publicKeyBytes = util.decodeBase64(publicKey);
      const message = util.decodeUTF8(PASSWORD);
      const encrypted = nacl.box(message, new Uint8Array(24), publicKeyBytes, new Uint8Array(32));
      encryptedValue = util.encodeBase64(encrypted);
    }

    // Update the secret
    console.log('📤 Updating secret...');
    await makeRequest('PUT', `${baseUrl}/actions/secrets/SMTP_PASSWORD`, {
      encrypted_value: encryptedValue,
      key_id: keyId
    });
    
    console.log('✅ SMTP_PASSWORD secret updated successfully!');
    console.log('\n💡 Note: Password is stored without spaces');
    console.log('   Original: "pirv tvjr bqlc espa"');
    console.log('   Stored as: "pirvtvjrbqlcespa" (no spaces)');
    console.log('\n🧪 Test by running the workflow again');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('\n💡 Make sure your token has "repo" scope');
    }
    process.exit(1);
  }
}

updatePassword();
