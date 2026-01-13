/**
 * Trigger GitHub Actions workflow via API
 */

const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "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";
const GITHUB_USERNAME = 'sharpkaif-source';
const REPO_NAME = 'AddReseller';

function triggerWorkflow() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      ref: 'main',
      inputs: {}
    });

    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_USERNAME}/${REPO_NAME}/actions/workflows/reseller-bot.yml/dispatches`,
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Trigger-Workflow',
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

async function run() {
  try {
    console.log('🚀 Triggering workflow via API...\n');
    
    await triggerWorkflow();
    
    console.log('✅ Workflow triggered successfully!');
    console.log('\n📧 Check your email: mohd.kashif@singleinterface.com');
    console.log('   You will receive an email notification when it completes.');
    console.log('\n🔗 View workflow run:');
    console.log(`   https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/actions`);
    console.log('\n⏳ The workflow will start running in a few seconds...');
    console.log('   Execution time: ~2-3 minutes');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('422')) {
      console.error('\n💡 The workflow might need workflow_dispatch trigger enabled.');
    }
  }
}

run();
