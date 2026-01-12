# Email Notification Setup Guide

## 📧 How Email Notifications Work

The workflow will automatically send emails:
- ✅ **Success Email**: When reseller is created successfully
- ❌ **Failure Email**: When reseller creation fails

## 🔧 Setup Steps

### Step 1: Get SMTP Credentials

You need SMTP server details to send emails. Here are common options:

#### Option A: Gmail SMTP (Recommended for Testing)
- **Server:** `smtp.gmail.com`
- **Port:** `587` (TLS) or `465` (SSL)
- **Username:** Your Gmail address
- **Password:** Gmail App Password (not your regular password)

**How to get Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "GitHub Actions" as name
4. Click "Generate"
5. Copy the 16-character password

#### Option B: Outlook/Hotmail SMTP
- **Server:** `smtp-mail.outlook.com`
- **Port:** `587`
- **Username:** Your Outlook email
- **Password:** Your Outlook password

#### Option C: Custom SMTP Server
- **Server:** Your SMTP server address
- **Port:** Usually `587` (TLS) or `465` (SSL)
- **Username:** SMTP username
- **Password:** SMTP password

### Step 2: Add GitHub Secrets

Go to your repository: https://github.com/sharpkaif-source/AddReseller/settings/secrets/actions

Click **"New repository secret"** and add these secrets:

#### Required Secrets:

1. **`SMTP_SERVER`**
   - Value: Your SMTP server (e.g., `smtp.gmail.com`)
   - Example: `smtp.gmail.com`

2. **`SMTP_USERNAME`**
   - Value: Your email address or SMTP username
   - Example: `your-email@gmail.com`

3. **`SMTP_PASSWORD`**
   - Value: Your email password or App Password
   - Example: `your-app-password` (for Gmail, use App Password)

4. **`NOTIFICATION_EMAIL`**
   - Value: Email address to receive notifications
   - Example: `notifications@yourcompany.com` or `your-email@gmail.com`

#### Optional Secrets:

5. **`SMTP_PORT`** (Optional)
   - Value: SMTP port number
   - Default: `587` (if not set)
   - Example: `587` or `465`

6. **`SMTP_FROM`** (Optional)
   - Value: "From" email address
   - Default: Uses `SMTP_USERNAME` if not set
   - Example: `Reseller Bot <bot@yourcompany.com>`

### Step 3: Test the Setup

1. **Manually trigger the workflow:**
   - Go to: https://github.com/sharpkaif-source/AddReseller/actions
   - Click "Run workflow"

2. **Check your email:**
   - Success: You'll receive a success email
   - Failure: You'll receive a failure email with error details

## 📋 Example: Gmail Setup

### Secrets to Add:

```
SMTP_SERVER = smtp.gmail.com
SMTP_PORT = 587
SMTP_USERNAME = your-email@gmail.com
SMTP_PASSWORD = xxxx xxxx xxxx xxxx (16-char App Password)
NOTIFICATION_EMAIL = your-email@gmail.com
SMTP_FROM = Reseller Bot <your-email@gmail.com>
```

## 🔍 Troubleshooting

### Email Not Sending?

1. **Check Secrets:**
   - Verify all secrets are set correctly
   - Check for typos in secret names

2. **Check SMTP Credentials:**
   - Verify SMTP server address is correct
   - For Gmail, make sure you're using App Password, not regular password
   - Check if 2FA is enabled (required for App Passwords)

3. **Check Workflow Logs:**
   - Go to Actions tab → Click on workflow run
   - Expand "Send Success Email" or "Send Failure Email" step
   - Check for error messages

4. **Test SMTP Connection:**
   - Try sending a test email manually using the same credentials
   - Verify SMTP server allows connections from GitHub Actions IPs

### Common Errors:

- **"Authentication failed"**: Wrong password or username
- **"Connection timeout"**: Wrong SMTP server or port
- **"535 Authentication failed"**: Gmail requires App Password, not regular password

## 📧 Email Content

### Success Email Includes:
- ✅ Success status
- Link to workflow run
- Repository and branch info
- Execution details

### Failure Email Includes:
- ❌ Failure status
- Link to workflow run
- Error troubleshooting steps
- Repository and commit info

## 🔐 Security Notes

- **Never commit SMTP credentials** to the repository
- **Use GitHub Secrets** for all sensitive information
- **Use App Passwords** for Gmail (more secure)
- **Rotate passwords** regularly

## ✅ Verification

After setup, you should receive:
- ✅ Success email when bot completes successfully
- ❌ Failure email when bot encounters errors

Both emails include links to view the workflow run details.
