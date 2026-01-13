# Gmail Authentication Troubleshooting

## Issue: `530-5.7.0 Authentication Required` in GitHub Actions

### Symptoms
- ✅ Email works locally (using `node test-smtp.js`)
- ❌ Email fails in GitHub Actions with authentication error
- Error: `530-5.7.0 Authentication Required`

### Root Causes

1. **Gmail Security Settings**
   - Gmail may block automated connections from CI/CD IP addresses
   - Security alerts may be triggered by new login locations

2. **App Password Issues**
   - App password may have been revoked
   - App password format (with/without spaces) may be incorrect
   - App password may have expired

3. **Account Security**
   - 2-Step Verification may need to be re-enabled
   - Security alerts may need to be cleared

### Solutions

#### Solution 1: Verify App Password

1. Go to https://myaccount.google.com/apppasswords
2. Check if the app password still exists
3. If it was deleted, generate a new one:
   - Select "Mail" as the app
   - Select "Other" as the device
   - Name it "GitHub Actions"
   - Copy the 16-character password (may include spaces)

4. Update the GitHub secret:
   ```bash
   # Update the password in update-password-with-spaces.js
   # Then run:
   node update-password-with-spaces.js
   ```

#### Solution 2: Check Gmail Security Alerts

1. Go to https://myaccount.google.com/security
2. Check "Recent security activity"
3. Look for any blocked login attempts from GitHub Actions
4. If found, click "Yes, it was me" to allow the connection

#### Solution 3: Try Different SMTP Settings

The workflow now tries both:
- **Port 587** (TLS) - Standard for most SMTP
- **Port 465** (SSL) - Alternative that sometimes works better with Gmail

Check which one succeeds in the workflow logs.

#### Solution 4: Regenerate App Password

If nothing works, generate a completely new app password:

1. Go to https://myaccount.google.com/apppasswords
2. Delete the old "GitHub Actions" app password (if it exists)
3. Generate a new one:
   - App: Mail
   - Device: Other (Custom name: "GitHub Actions")
4. Copy the new password
5. Update the script and run:
   ```bash
   # Edit update-password-with-spaces.js with new password
   node update-password-with-spaces.js
   ```

#### Solution 5: Use Alternative Email Service

If Gmail continues to block, consider:
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 5,000 emails/month)
- **AWS SES** (very cheap, pay-as-you-go)
- **SMTP2GO** (free tier: 1,000 emails/month)

### Testing

1. **Test locally:**
   ```bash
   node test-smtp.js
   ```
   If this works, the password is correct.

2. **Test in GitHub Actions:**
   - Go to Actions → "Test Email Only" workflow
   - Click "Run workflow"
   - Check which port (587 or 465) succeeds

3. **Check logs:**
   - Look for "Debug Password Format" step output
   - Check if secret is accessible
   - Review error messages from email steps

### Current Configuration

- **Username:** `mohd.kashif@singleinterface.com`
- **Server:** `smtp.gmail.com`
- **Ports:** 587 (TLS) and 465 (SSL) - both tested
- **Password Format:** With spaces (as Gmail displays: `xgmy mahf uthw pnll`)

### Next Steps

1. Run the "Test Email Only" workflow
2. Check which port succeeds (587 or 465)
3. Update the main workflow to use the working port
4. If both fail, try Solution 4 (regenerate app password)
