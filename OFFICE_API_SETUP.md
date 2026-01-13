# Office API Email Setup

## Overview

This project now uses Office API to send emails instead of SMTP. This is more reliable and doesn't require Gmail authentication.

## Required GitHub Secrets

Add these secrets in your GitHub repository:

1. **OFFICE_API_URL** - Your Office API endpoint URL
   - Example: `https://api.office.com/send-email`
   - Or: `https://your-domain.com/api/email`

2. **OFFICE_API_KEY** - Your Office API authentication key
   - This could be:
     - Bearer token
     - API key
     - OAuth token
     - (Depends on your Office API)

## Setup Steps

### 1. Get Your Office API Details

You need:
- **API Endpoint URL** - Where to send the request
- **HTTP Method** - Usually `POST`
- **Authentication Method** - How to authenticate (API key, Bearer token, etc.)
- **Request Format** - JSON structure your API expects

### 2. Add GitHub Secrets

Go to: **Settings → Secrets and variables → Actions → New repository secret**

Add:
- `OFFICE_API_URL` = Your API endpoint
- `OFFICE_API_KEY` = Your API key/token

### 3. Test the API Locally

```bash
# Update test-office-api.js with your API details
node test-office-api.js
```

### 4. Test in GitHub Actions

1. Go to **Actions** tab
2. Select **"Test Email Only"** workflow
3. Click **"Run workflow"**
4. Check if email is received

## Current API Request Format

The workflows currently send requests in this format:

```json
{
  "to": "mohd.kashif@singleinterface.com",
  "subject": "Email Subject",
  "body": "<h2>HTML Email Body</h2>"
}
```

**If your Office API uses a different format**, you'll need to update the workflows.

## Customizing the API Request

### If Your API Uses Different Field Names

Edit `.github/workflows/reseller-bot.yml` and `.github/workflows/test-email.yml`:

```yaml
# Change from:
{to: $to, subject: $subject, body: $body}

# To your format, e.g.:
{recipient: $to, email_subject: $subject, email_body: $body}
```

### If Your API Uses Different Authentication

Update the `curl` command headers:

```yaml
# Current (Bearer token):
-H "Authorization: Bearer $API_KEY"

# Alternative options:
-H "X-API-Key: $API_KEY"
-H "API-Key: $API_KEY"
-H "apikey: $API_KEY"
```

### If Your API Uses GET Instead of POST

Change:
```yaml
curl -X POST "$API_URL"
```

To:
```yaml
curl -X GET "$API_URL?to=$TO&subject=$SUBJECT&body=$BODY"
```

### If Your API Requires Different Content-Type

Change:
```yaml
-H "Content-Type: application/json"
```

To:
```yaml
-H "Content-Type: application/xml"  # or application/x-www-form-urlencoded
```

## Testing

1. **Local Test:**
   ```bash
   node test-office-api.js
   ```

2. **GitHub Actions Test:**
   - Run "Test Email Only" workflow
   - Check logs for success/failure

3. **Main Workflow:**
   - Run "Create Reseller Bot" workflow
   - Check if success/failure emails are sent

## Troubleshooting

### Error: "OFFICE_API_URL secret is not set"
- Add the secret in GitHub repository settings

### Error: "HTTP 401 Unauthorized"
- Check if API key is correct
- Verify authentication method (Bearer token vs API key)

### Error: "HTTP 400 Bad Request"
- Check request format matches your API
- Verify field names are correct
- Check if API expects different content-type

### Email Not Received
- Check API response in workflow logs
- Verify API endpoint is working
- Check spam folder
- Verify recipient email address

## Need Help?

If your Office API has specific requirements, share:
1. API endpoint URL
2. Authentication method
3. Request format (JSON/XML/Form data)
4. Example request/response

And I'll update the workflows accordingly!
