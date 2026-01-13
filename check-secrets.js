/**
 * Check if secrets exist in GitHub repository
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
        'User-Agent': 'GitHub-Secrets-Check'
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

async function checkSecrets() {
  try {
    console.log('🔍 Checking GitHub Secrets...\n');
    
    const secrets = await makeRequest('GET', `${baseUrl}/actions/secrets`);
    
    console.log(`Total secrets: ${secrets.total_count || 0}\n`);
    
    if (secrets.secrets && secrets.secrets.length > 0) {
      console.log('📋 Found secrets:');
      secrets.secrets.forEach(secret => {
        console.log(`   ✅ ${secret.name}`);
      });
    } else {
      console.log('❌ No secrets found!');
      console.log('\nLet me try adding them again...\n');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSecrets();
