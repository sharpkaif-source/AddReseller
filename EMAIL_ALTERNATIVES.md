# Email Notification Alternatives

## Issue: Gmail App Passwords Not Available

If you see "The setting you are looking for is not available for your account", it means:
- 2-Step Verification is not enabled, OR
- Your account doesn't have access to App Passwords

## Solution Options

### Option 1: Enable 2-Step Verification (Recommended for Gmail)

1. **Enable 2-Step Verification:**
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup process
   - After enabling, App Passwords will become available

2. **Then get App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Generate App Password for "Mail"
   - Use this password in GitHub Secrets

### Option 2: Use Outlook/Hotmail (Easier Setup)

Outlook doesn't require App Passwords for SMTP.

**Setup:**
1. Go to GitHub Secrets: https://github.com/sharpkaif-source/AddReseller/settings/secrets/actions
2. Add these secrets:

```
SMTP_SERVER = smtp-mail.outlook.com
SMTP_PORT = 587
SMTP_USERNAME = your-email@outlook.com (or @hotmail.com)
SMTP_PASSWORD = your-outlook-password
NOTIFICATION_EMAIL = your-email@outlook.com
```

### Option 3: Use SendGrid (Free Email Service)

SendGrid offers free tier (100 emails/day).

**Setup:**
1. Sign up: https://sendgrid.com
2. Create API Key
3. Add to GitHub Secrets:

```
SMTP_SERVER = smtp.sendgrid.net
SMTP_PORT = 587
SMTP_USERNAME = apikey
SMTP_PASSWORD = your-sendgrid-api-key
NOTIFICATION_EMAIL = your-email@example.com
SMTP_FROM = Reseller Bot <noreply@yourdomain.com>
```

### Option 4: Use Mailgun (Free Email Service)

**Setup:**
1. Sign up: https://www.mailgun.com
2. Get SMTP credentials from dashboard
3. Add to GitHub Secrets:

```
SMTP_SERVER = smtp.mailgun.org
SMTP_PORT = 587
SMTP_USERNAME = your-mailgun-username
SMTP_PASSWORD = your-mailgun-password
NOTIFICATION_EMAIL = your-email@example.com
```

### Option 5: Use GitHub's Built-in Notifications (No Setup)

If you don't want to set up SMTP, you can use GitHub's notification system:

1. Go to: https://github.com/settings/notifications
2. Enable email notifications for:
   - "Actions workflows"
   - "Workflow runs"
3. You'll receive GitHub notifications via email automatically

**Note:** This sends GitHub-style notifications, not custom emails.

### Option 6: Use Discord/Slack Webhooks (Alternative)

If you prefer Discord or Slack notifications instead of email, I can help set that up.

## Quick Recommendation

**Easiest:** Use Outlook/Hotmail (Option 2) - No App Password needed!

**Best for Production:** Use SendGrid (Option 3) - More reliable, free tier available.

**Simplest:** Enable GitHub notifications (Option 5) - No setup required.

## Which option do you prefer?

Let me know and I can help you set it up!
