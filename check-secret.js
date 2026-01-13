/**
 * Check if SMTP_PASSWORD secret exists in GitHub repository
 */

const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "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";
const GITHUB_USERNAME = 'sharpkaif-source';
const REPO_NAME = 'AddReseller';

const baseUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}`;

function makeRequest(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Check-Secret'
      }
    };

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
    req.end();
  });
}

async function checkSecret() {
  try {
    console.log('🔍 Checking if SMTP_PASSWORD secret exists...\n');
    
    const secrets = await makeRequest('GET', `${baseUrl}/actions/secrets`);
    
    console.log('📋 Available secrets:');
    if (secrets.secrets && secrets.secrets.length > 0) {
      secrets.secrets.forEach(secret => {
        const isSMTP = secret.name === 'SMTP_PASSWORD';
        console.log(`   ${isSMTP ? '✅' : '  '} ${secret.name}${isSMTP ? ' ← FOUND!' : ''}`);
      });
      
      const smtpSecret = secrets.secrets.find(s => s.name === 'SMTP_PASSWORD');
      if (smtpSecret) {
        console.log('\n✅ SMTP_PASSWORD secret EXISTS in repository!');
        console.log(`   Updated: ${smtpSecret.updated_at}`);
      } else {
        console.log('\n❌ SMTP_PASSWORD secret NOT FOUND in repository!');
        console.log('   You need to add it via:');
        console.log('   - GitHub UI: Settings → Secrets and variables → Actions → New repository secret');
        console.log('   - Or use: node add-secrets-simple.js');
      }
    } else {
      console.log('   No secrets found in repository');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('404')) {
      console.error('   Repository not found or token lacks permissions');
    }
    process.exit(1);
  }
}

checkSecret();
