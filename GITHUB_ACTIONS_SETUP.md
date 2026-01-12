# GitHub Actions Setup Guide

This guide explains how to deploy and run the reseller creation bot using GitHub Actions.

## 🎯 Why GitHub Actions?

- ✅ **No timeout issues**: 6-hour limit (vs 10s/60s on Vercel)
- ✅ **Free for public repos**: Unlimited minutes
- ✅ **Easy browser setup**: Playwright works out of the box
- ✅ **Flexible triggers**: Manual, scheduled, or API/webhook
- ✅ **Better for automation**: Designed for CI/CD workflows

## 📋 Prerequisites

1. **GitHub Repository**: Push your code to GitHub (public or private)
2. **GitHub Personal Access Token**: For triggering via API (optional)

## 🚀 Setup Steps

### Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Add reseller creation bot"
git remote add origin https://github.com/YOUR_USERNAME/AddReseller.git
git push -u origin main
```

### Step 2: Configure Secrets (Optional but Recommended)

Go to your repository → **Settings** → **Secrets and variables** → **Actions**

Add these secrets (if different from defaults):

- `BASE_URL`: Your admin URL (default: `https://test-reseller.singleinterface.com/admin`)
- `ADMIN_EMAIL`: Admin email (default: `admin@reseller.com`)
- `ADMIN_PASSWORD`: Admin password (default: `Admin@2025`)

**Note**: If you don't set secrets, the workflow will use defaults from `config.js`.

### Step 3: Run the Workflow

#### Option A: Manual Trigger (GitHub UI)

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select **Create Reseller Bot** workflow
4. Click **Run workflow** → **Run workflow**
5. Watch it execute in real-time!

#### Option B: API Trigger (Like Vercel URL)

Use the provided script to trigger via API:

```bash
# Set environment variables
export GITHUB_TOKEN="your_personal_access_token"
export GITHUB_REPO="your_username/AddReseller"

# Trigger the workflow
node trigger-github-action.js
```

**Get a Personal Access Token:**
1. Go to: https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Select scopes: `repo` (private) or `public_repo` (public)
4. Copy the token and use it as `GITHUB_TOKEN`

#### Option C: Webhook Trigger

You can also trigger via webhook using GitHub's `repository_dispatch` API:

```bash
curl -X POST \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/YOUR_USERNAME/AddReseller/dispatches \
  -d '{"event_type":"create-reseller"}'
```

## 📊 Viewing Results

1. Go to **Actions** tab in your repository
2. Click on the latest workflow run
3. Expand **Run reseller creation bot** step to see logs
4. If it fails, check **Upload screenshots on failure** for error screenshots

## 🔧 Customization

### Change Reseller Name

When triggering manually, you can provide a custom name in the GitHub UI.

When triggering via API:

```bash
RESELLER_NAME="My Custom Reseller" node trigger-github-action.js
```

### Schedule Automatic Runs

Edit `.github/workflows/reseller-bot.yml` and uncomment the schedule section:

```yaml
schedule:
  - cron: '0 0 * * *'  # Daily at midnight UTC
```

### Adjust Timeout

The workflow has a 10-minute timeout. To change it, edit:

```yaml
timeout-minutes: 10  # Change to your desired timeout
```

## 🌐 Creating a Public API Endpoint

If you want a public URL (like Vercel), you can:

1. **Use a service like Zapier/Make.com** to create a webhook that triggers GitHub Actions
2. **Use GitHub's webhook** with a simple proxy server
3. **Use a serverless function** (Railway/Render) that just triggers the GitHub Action

Example proxy server (deploy on Railway/Render):

```javascript
// Simple proxy to trigger GitHub Action
const https = require('https');

module.exports = async (req, res) => {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  
  // Trigger GitHub Action
  // ... (similar to trigger-github-action.js)
  
  res.json({ success: true, message: 'Workflow triggered' });
};
```

## 📝 Notes

- **Headless Mode**: The bot will run in headless mode on GitHub Actions (no visible browser)
- **Execution Time**: ~52-53 seconds per run
- **Free Tier**: 2,000 minutes/month for private repos, unlimited for public repos
- **Logs**: All console output is visible in the Actions tab

## 🆚 Comparison: GitHub Actions vs Vercel

| Feature | GitHub Actions | Vercel |
|---------|---------------|--------|
| Timeout | 6 hours | 10s (free) / 60s (pro) |
| Cost | Free (public) | Free tier limited |
| Browser Support | ✅ Excellent | ⚠️ Requires setup |
| Trigger Method | Manual/API/Schedule | HTTP URL |
| Best For | Automation/CI/CD | Quick HTTP endpoints |

## 🎉 You're All Set!

Your bot is now ready to run on GitHub Actions. It will create resellers just like it does locally, but in the cloud!
