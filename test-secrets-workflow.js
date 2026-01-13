/**
 * Test if secrets work by triggering the workflow
 */

const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "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";
const GITHUB_USERNAME = 'sharpkaif-source';
const REPO_NAME = 'AddReseller';

function triggerWorkflow() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      ref: 'main'
    });

    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_USERNAME}/${REPO_NAME}/actions/workflows/reseller-bot.yml/dispatches`,
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Test-Workflow',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 204) {
          resolve(true);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function test() {
  try {
    console.log('🧪 Testing workflow with secrets...\n');
    console.log('🚀 Triggering workflow...');
    
    await triggerWorkflow();
    
    console.log('✅ Workflow triggered successfully!');
    console.log('\n📧 Check your email: mohd.kashif@singleinterface.com');
    console.log('   You should receive an email notification when the workflow completes.');
    console.log('\n🔗 View workflow run:');
    console.log(`   https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/actions`);
    console.log('\n💡 If you receive the email, the secrets are working correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
