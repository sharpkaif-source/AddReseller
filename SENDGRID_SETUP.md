# SendGrid Email Setup

## Overview

This project uses SendGrid API to send email notifications. SendGrid is a reliable email service that doesn't require SMTP authentication.

## Required GitHub Secret

Add this secret in your GitHub repository:

1. **SENDGRID_API_KEY** - Your SendGrid API key
   - Get it from: https://app.sendgrid.com/settings/api_keys
   - Click "Create API Key"
   - Name it: "GitHub Actions"
   - Permissions: "Full Access" or at least "Mail Send"
   - Copy the API key (you'll only see it once!)

## Setup Steps

### 1. Get SendGrid API Key

1. Go to https://app.sendgrid.com/
2. Navigate to **Settings → API Keys**
3. Click **"Create API Key"**
4. Name it: `GitHub Actions`
5. Select permissions: **"Full Access"** (or at least "Mail Send")
6. Click **"Create & View"**
7. **Copy the API key immediately** (starts with `SG.`)
8. Store it securely

### 2. Add GitHub Secret

1. Go to your repository: https://github.com/sharpkaif-source/AddReseller
2. Navigate to: **Settings → Secrets and variables → Actions**
3. Click **"New repository secret"**
4. Name: `SENDGRID_API_KEY`
5. Value: Paste your SendGrid API key
6. Click **"Add secret"**

### 3. Test Locally (Optional)

```bash
# Set your API key
export SENDGRID_API_KEY=SG.your-api-key-here

# Test
node test-office-api.js
```

### 4. Test in GitHub Actions

1. Go to **Actions** tab
2. Select **"Test Email Only"** workflow
3. Click **"Run workflow"**
4. Check if email is received

## Email Configuration

The workflows send emails with:

- **From:** `mohd.kashif@singleinterface.com` (SingleInterface)
- **Reply-To:** `mohd.kashif@singleinterface.com` (SingleInterface)
- **To:** `mohd.kashif@singleinterface.com`
- **Tracking:** Enabled (click, open, subscription)
- **Categories:** `reseller_bot`, `success`/`failure`/`test`

## Current SendGrid Request Format

```json
POST https://api.sendgrid.com/v3/mail/send
Headers:
  Authorization: Bearer {SENDGRID_API_KEY}
  Content-Type: application/json

Body:
{
  "personalizations": [
    {
      "to": [{"email": "mohd.kashif@singleinterface.com"}]
    }
  ],
  "from": {
    "email": "mohd.kashif@singleinterface.com",
    "name": "SingleInterface"
  },
  "reply_to": {
    "email": "mohd.kashif@singleinterface.com",
    "name": "SingleInterface"
  },
  "subject": "Email Subject",
  "content": [
    {
      "type": "text/html",
      "value": "<h2>HTML Email Body</h2>"
    }
  ],
  "tracking_settings": {
    "click_tracking": {"enable": true, "enable_text": false},
    "open_tracking": {"enable": true, "substitution_tag": "%open-track%"},
    "subscription_tracking": {"enable": true}
  },
  "categories": ["reseller_bot", "success"]
}
```

## Troubleshooting

### Error: "SENDGRID_API_KEY secret is not set"
- Add the secret in GitHub repository settings
- Make sure the name is exactly `SENDGRID_API_KEY`

### Error: "HTTP 401 Unauthorized"
- Check if API key is correct
- Verify API key has "Mail Send" permissions
- Make sure you copied the full API key (starts with `SG.`)

### Error: "HTTP 403 Forbidden"
- API key doesn't have required permissions
- Go to SendGrid → Settings → API Keys
- Edit the key and ensure "Mail Send" permission is enabled

### Email Not Received
- Check spam folder
- Verify recipient email address
- Check SendGrid activity logs: https://app.sendgrid.com/activity
- Verify sender email is verified in SendGrid

### Sender Verification

If emails aren't being delivered, you may need to verify the sender email in SendGrid:

1. Go to **Settings → Sender Authentication**
2. Verify your domain or single sender
3. Follow SendGrid's verification process

## SendGrid Free Tier

SendGrid offers a free tier:
- **100 emails/day** - Perfect for testing and small projects
- No credit card required
- Full API access

For production use, consider upgrading if you need more emails.

## Links

- **SendGrid Dashboard:** https://app.sendgrid.com/
- **API Keys:** https://app.sendgrid.com/settings/api_keys
- **Activity Logs:** https://app.sendgrid.com/activity
- **Documentation:** https://docs.sendgrid.com/
