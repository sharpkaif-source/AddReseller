/**
 * Simple script to add GitHub Secrets using GitHub API
 * 
 * Usage:
 *   GITHUB_TOKEN="your-token" node add-secrets-simple.js
 * 
 * Requires:
 *   - GITHUB_TOKEN: GitHub Personal Access Token with 'repo' scope
 */

const https = require('https');
const crypto = require('crypto');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = 'sharpkaif-source';
const REPO_NAME = 'AddReseller';

if (!GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN environment variable is required');
  console.error('   Get a token from: https://github.com/settings/tokens');
  console.error('   Required scope: repo');
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

// Encrypt secret using public key (GitHub's format)
function encryptSecret(secret, publicKey) {
  // GitHub provides the key in base64 format, convert to PEM
  // Split the key into 64-character lines for proper PEM format
  const keyLines = publicKey.match(/.{1,64}/g) || [publicKey];
  const pemKey = `-----BEGIN PUBLIC KEY-----\n${keyLines.join('\n')}\n-----END PUBLIC KEY-----`;
  
  try {
    const key = crypto.createPublicKey({
      key: pemKey,
      format: 'pem'
    });

    // GitHub uses PKCS1 padding (not OAEP)
    const encrypted = crypto.publicEncrypt(
      {
        key: key,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      Buffer.from(secret, 'utf8')
    );

    return encrypted.toString('base64');
  } catch (error) {
    // Fallback: try with the key as-is if PEM format fails
    try {
      const keyBuffer = Buffer.from(publicKey, 'base64');
      const key = crypto.createPublicKey({
        key: keyBuffer,
        format: 'der',
        type: 'spki'
      });
      
      const encrypted = crypto.publicEncrypt(
        {
          key: key,
          padding: crypto.constants.RSA_PKCS1_PADDING
        },
        Buffer.from(secret, 'utf8')
      );

      return encrypted.toString('base64');
    } catch (e) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }
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
    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('\n💡 Make sure your token has "repo" scope');
      console.error('   Get a token: https://github.com/settings/tokens');
    }
    process.exit(1);
  }
}

addSecrets();
