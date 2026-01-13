# Testing Reseller Bot with Visible Browser

## Option 1: Run Locally (Best for Testing UI Changes)

To see the browser activity in real-time, run the bot locally:

### Steps:

1. **Make sure you're in the project directory:**
   ```bash
   cd C:\Cursor-Projects\AddReseller
   ```

2. **Set HEADLESS=false in .env file:**
   ```bash
   # Edit .env file or create it
   HEADLESS=false
   ```

   Or set it directly:
   ```bash
   # Windows PowerShell
   $env:HEADLESS="false"
   
   # Windows CMD
   set HEADLESS=false
   ```

3. **Run the bot:**
   ```bash
   npm test
   ```

4. **Watch the browser:**
   - A Chrome/Chromium window will open
   - You'll see all the bot's actions in real-time
   - The browser will stay open so you can see what happened

### What You'll See:

- Browser window opens automatically
- Bot logs in
- Bot fills all 4 forms (Basic Info, Users, Domain, Branding)
- Bot navigates to dashboard
- Bot verifies reseller appears in the list
- Browser stays open for a few seconds so you can verify

## Option 2: Run in GitHub Actions with Video Recording

GitHub Actions can't show a visible browser, but it can record a video:

1. **Go to Actions tab:**
   https://github.com/sharpkaif-source/AddReseller/actions

2. **Click "Create Reseller Bot" workflow**

3. **Click "Run workflow"**

4. **Set "Run in headless mode?" to `false`** (this enables video recording)

5. **Click "Run workflow"**

6. **After completion:**
   - Go to the workflow run
   - Download the "browser-videos" artifact
   - Open the video file to see what happened

## Option 3: Check Screenshots

The bot automatically takes screenshots:
- `reseller-created-success.png` - If reseller was found
- `reseller-created-failed.png` - If reseller was not found
- `error-screenshot.png` - If there was an error

These are uploaded as artifacts in GitHub Actions.

## Troubleshooting

### Browser doesn't open locally:
- Make sure `HEADLESS=false` is set
- Check if Chrome/Chromium is installed
- Try: `npx playwright install chromium`

### Video not recorded in GitHub Actions:
- Make sure "Run in headless mode?" is set to `false`
- Check the workflow logs for video recording messages
- Videos are in the "browser-videos" artifact

### Want to slow down the bot to see better:
- Edit `config.js`:
  ```javascript
  slowMo: 500, // Slower (500ms delay between actions)
  ```

## Quick Test Command

```bash
# Windows PowerShell
$env:HEADLESS="false"; npm test

# Windows CMD  
set HEADLESS=false && npm test

# Linux/Mac
HEADLESS=false npm test
```

This will run the bot with a visible browser so you can watch everything happen!
