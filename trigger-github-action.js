/**
 * Script to trigger GitHub Actions workflow via API
 * 
 * Usage:
 *   node trigger-github-action.js
 * 
 * Or with custom reseller name:
 *   RESELLER_NAME="My Custom Reseller" node trigger-github-action.js
 * 
 * Requires:
 *   - GITHUB_TOKEN environment variable (Personal Access Token with repo permissions)
 *   - GITHUB_REPO environment variable (format: "owner/repo", e.g., "username/AddReseller")
 */

const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || process.env.GITHUB_REPOSITORY;
const RESELLER_NAME = process.env.RESELLER_NAME;

if (!GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN environment variable is required');
  console.error('   Create a Personal Access Token at: https://github.com/settings/tokens');
  console.error('   Required scopes: repo (for private repos) or public_repo (for public repos)');
  process.exit(1);
}

if (!GITHUB_REPO) {
  console.error('❌ Error: GITHUB_REPO environment variable is required');
  console.error('   Format: "owner/repo" (e.g., "username/AddReseller")');
  process.exit(1);
}

const [owner, repo] = GITHUB_REPO.split('/');
if (!owner || !repo) {
  console.error('❌ Error: Invalid GITHUB_REPO format. Expected: "owner/repo"');
  process.exit(1);
}

// Trigger via repository_dispatch (more flexible)
const dispatchData = JSON.stringify({
  event_type: 'create-reseller',
  client_payload: {
    reseller_name: RESELLER_NAME || undefined,
    triggered_at: new Date().toISOString()
  }
});

const options = {
  hostname: 'api.github.com',
  path: `/repos/${owner}/${repo}/dispatches`,
  method: 'POST',
  headers: {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Reseller-Bot-Trigger',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(dispatchData)
  }
};

console.log('🚀 Triggering GitHub Actions workflow...');
console.log(`📦 Repository: ${owner}/${repo}`);
if (RESELLER_NAME) {
  console.log(`📝 Custom reseller name: ${RESELLER_NAME}`);
}

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 204) {
      console.log('✅ Workflow triggered successfully!');
      console.log(`🔗 View run: https://github.com/${owner}/${repo}/actions`);
      console.log('\n⏳ The bot will start running in a few seconds...');
      console.log('   Check the Actions tab for progress and results.');
    } else {
      console.error(`❌ Error: HTTP ${res.statusCode}`);
      console.error('Response:', data);
      try {
        const error = JSON.parse(data);
        console.error('Message:', error.message);
      } catch (e) {
        console.error('Raw response:', data);
      }
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  process.exit(1);
});

req.write(dispatchData);
req.end();
