# Quick Office API Setup Guide

## ✅ What's Done

I've updated the workflows to use Office API instead of SMTP. The changes are ready, but we need to:

1. **Fix the GitHub push** (tokens in old commit)
2. **Add your Office API secrets**

## 🔧 Step 1: Fix GitHub Push

GitHub is blocking the push because of tokens in an old commit. You have two options:

### Option A: Allow via GitHub (Easiest)
1. Click this link: https://github.com/sharpkaif-source/AddReseller/security/secret-scanning/unblock-secret/38BvYIert4GQasEXkZWw4TfrxMR
2. Click "Allow secret" 
3. Then run: `git push origin main`

### Option B: Rewrite History (Advanced)
```bash
git rebase -i HEAD~2
# Mark the commit with tokens as "edit"
# Remove tokens, then:
git commit --amend
git rebase --continue
git push origin main --force
```

## 🔑 Step 2: Add Office API Secrets

Go to: **Settings → Secrets and variables → Actions → New repository secret**

Add these two secrets:

1. **OFFICE_API_URL**
   - Your Office API endpoint
   - Example: `https://api.office.com/send-email`
   - Or: `https://your-domain.com/api/email`

2. **OFFICE_API_KEY**
   - Your API authentication key
   - Could be Bearer token, API key, etc.

## 📋 What I Need From You

To customize the API request format, please share:

1. **API Endpoint URL** - Where to send the request
2. **HTTP Method** - POST or GET?
3. **Authentication** - How to authenticate?
   - Bearer token in Authorization header?
   - API key in X-API-Key header?
   - Something else?
4. **Request Format** - What JSON structure does your API expect?
   - Current format: `{to, subject, body}`
   - Does it need different field names?

## 🧪 Testing

Once secrets are added:

1. **Test locally:**
   ```bash
   # Update test-office-api.js with your API details
   export OFFICE_API_URL="your-api-url"
   export OFFICE_API_KEY="your-api-key"
   node test-office-api.js
   ```

2. **Test in GitHub Actions:**
   - Go to Actions → "Test Email Only"
   - Click "Run workflow"
   - Check if email is received

## 📝 Current Request Format

The workflows currently send:

```json
POST /your-api-endpoint
Headers:
  Content-Type: application/json
  Authorization: Bearer {API_KEY}

Body:
{
  "to": "mohd.kashif@singleinterface.com",
  "subject": "Email Subject",
  "body": "<h2>HTML Email Body</h2>"
}
```

**If your API is different, share the details and I'll update it!**
