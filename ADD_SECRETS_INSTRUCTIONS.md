# How to Add GitHub Secrets

Since you can't see the "New repository secret" button, here are two ways to add secrets:

## Method 1: Using PowerShell Script (Windows)

### Step 1: Get GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Name it: `Add Secrets`
4. Check scope: **`repo`** (Full control of private repositories)
5. Click **"Generate token"**
6. **Copy the token** (starts with `ghp_`)

### Step 2: Run the Script

Open PowerShell in this directory and run:

```powershell
$env:GITHUB_TOKEN = "your-token-here"
.\add-github-secrets.ps1 -GitHubToken $env:GITHUB_TOKEN
```

Or in one line:

```powershell
.\add-github-secrets.ps1 -GitHubToken "ghp_your-token-here"
```

## Method 2: Using Node.js Script

### Step 1: Get GitHub Personal Access Token

Same as Method 1 above.

### Step 2: Run the Script

```bash
$env:GITHUB_TOKEN = "your-token-here"
node add-secrets-simple.js
```

Or:

```bash
GITHUB_TOKEN="your-token-here" node add-secrets-simple.js
```

## Method 3: Manual via GitHub Website

If the button is not visible, try:

1. **Check URL:** Make sure you're at:
   https://github.com/sharpkaif-source/AddReseller/settings/secrets/actions

2. **Check Permissions:** You need write access to the repository

3. **Try Different Browser:** Sometimes UI elements don't load properly

4. **Check if Secrets Tab Exists:**
   - Go to: https://github.com/sharpkaif-source/AddReseller/settings
   - Look for "Secrets and variables" in the left sidebar
   - Click "Actions" under it

## What Secrets Will Be Added

The scripts will add these 5 secrets:

1. `SMTP_SERVER` = `smtp.gmail.com`
2. `SMTP_PORT` = `587`
3. `SMTP_USERNAME` = `mohd.kashif@singleinterface.com`
4. `SMTP_PASSWORD` = `pirv tvjr bqlc espa`
5. `NOTIFICATION_EMAIL` = `mohd.kashif@singleinterface.com`

## Verify Secrets Were Added

After running the script, verify at:
https://github.com/sharpkaif-source/AddReseller/settings/secrets/actions

You should see all 5 secrets listed.

## Test Email Notifications

1. Go to: https://github.com/sharpkaif-source/AddReseller/actions
2. Click "Run workflow"
3. Check your email: `mohd.kashif@singleinterface.com`
4. You should receive an email notification!

## Troubleshooting

### Script Fails with "401 Unauthorized"
- Your token doesn't have `repo` scope
- Generate a new token with `repo` scope

### Script Fails with "404 Not Found"
- Check repository name: `sharpkaif-source/AddReseller`
- Verify you have access to the repository

### Secrets Not Showing
- Wait a few seconds and refresh the page
- Check if you have write access to the repository
