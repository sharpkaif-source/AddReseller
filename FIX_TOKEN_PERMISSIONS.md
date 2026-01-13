# Fix Token Permissions

## Issue: Token Missing Required Permissions

The token needs **"repo"** scope to add secrets. Here's how to fix it:

## Step 1: Generate New Token with Correct Permissions

1. **Go to:** https://github.com/settings/tokens
2. **Click:** "Generate new token (classic)"
3. **Name:** `Add Secrets - Full Access`
4. **Expiration:** Choose your preference (90 days, 1 year, or no expiration)
5. **Select scopes:** Check these boxes:
   - ✅ **`repo`** (Full control of private repositories)
     - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
   - ✅ **`workflow`** (Update GitHub Action workflows) - Optional but recommended
6. **Click:** "Generate token"
7. **Copy the token** immediately (you won't see it again!)

## Step 2: Revoke Old Token (Security)

1. Go to: https://github.com/settings/tokens
2. Find the old token (GitHub tokens start with specific prefixes)
3. Click "Revoke" to delete it (for security)

## Step 3: Run Script Again with New Token

After getting the new token, run:

```bash
$env:GITHUB_TOKEN = "your-new-token-here"
node add-secrets-simple.js
```

## Alternative: Manual Method

If you still can't see the "New repository secret" button, try:

1. **Direct link to secrets:**
   https://github.com/sharpkaif-source/AddReseller/settings/secrets/actions/new

2. **Or go to Settings → Secrets:**
   - https://github.com/sharpkaif-source/AddReseller/settings
   - Click "Secrets and variables" in left sidebar
   - Click "Actions"
   - Look for "New repository secret" button

3. **Check browser:**
   - Try a different browser
   - Clear cache and refresh
   - Make sure you're logged in

## What Permissions Are Needed?

For adding secrets, the token needs:
- **`repo`** scope (for private repos) OR
- **`public_repo`** scope (for public repos) + **`workflow`** scope

Since your repo is public, you could also use:
- `public_repo` + `workflow` scopes

But `repo` scope is the easiest and covers everything.
