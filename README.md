# Reseller Creation Bot

Automated bot to test reseller creation through all 4 forms (Basic Info, Users, Domain, Branding).

## Features

- ✅ Automated login as Admin
- ✅ Navigates through Reseller Dashboard
- ✅ Fills all 4 forms sequentially
- ✅ Generates random user email: `mohd.kashif+{random}@singleinterface.com`
- ✅ Creates reseller and verifies success
- ✅ Error handling with screenshots

## Prerequisites

- Node.js 16+ installed
- Access to the reseller dashboard application

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npm run install-browsers
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your actual values (or use defaults in config.js):
   ```
   BASE_URL=https://test-reseller.singleinterface.com/admin
   ADMIN_EMAIL=admin@reseller.com
   ADMIN_PASSWORD=Admin@2025
   HEADLESS=true
   ```
   
   **Note:** The config.js file already has these credentials set as defaults, so you can skip this step if using the default test environment.

4. **Update config.js** with your specific form field selectors and options if needed.

## Usage

### Local Testing

Run the bot:
```bash
npm test
```

Or directly:
```bash
node bot.js
```

### With visible browser (for debugging):
Set `HEADLESS=false` in `.env` file.

## Configuration

Edit `config.js` to customize:
- Reseller test data
- Form field values
- Timeout settings
- Browser options

## Deployment to Vercel

### Important Notes for Vercel

⚠️ **Playwright on Vercel**: Playwright requires browsers which can be large. For Vercel serverless functions, you may need to:
- Use Playwright's bundled Chromium
- Set `PLAYWRIGHT_BROWSERS_PATH=0` in environment variables
- Consider using a Vercel Edge Function or external service for browser automation

### Option 1: Serverless Function (Recommended)

The `api/reseller-bot.js` file is already created. Follow these steps:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Set environment variables in Vercel dashboard**:
   - Go to your Vercel project → Settings → Environment Variables
   - Add:
     - `BASE_URL` - Your application URL
     - `ADMIN_EMAIL` - Admin email
     - `ADMIN_PASSWORD` - Admin password
     - `HEADLESS=true`
     - `PLAYWRIGHT_BROWSERS_PATH=0` (for Playwright)

3. **Deploy to Vercel**:
   ```bash
   vercel deploy
   ```

4. **Test the endpoint**:
   ```bash
   curl https://your-project.vercel.app/api/reseller-bot
   ```

### Option 2: Vercel Cron Job

To run the bot automatically on a schedule, update `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/reseller-bot",
    "schedule": "0 */6 * * *"
  }]
}
```

This runs every 6 hours. Adjust the schedule as needed.

### Alternative: Use External Browser Service

If Playwright doesn't work well on Vercel, consider:
- Using Puppeteer with `@sparticuz/chromium` package
- Using a service like Browserless.io
- Running the bot on a different platform (Railway, Render, etc.)

## Troubleshooting

- **Form fields not found**: Update selectors in `bot.js` to match your actual HTML structure
- **Login fails**: Check admin credentials in `.env`
- **Timeout errors**: Increase timeout in `config.js`
- **Screenshots**: Check `error-screenshot.png` when errors occur

## Notes

- The bot generates a unique reseller name using timestamp
- User email format: `mohd.kashif+{random}@singleinterface.com`
- Logo upload is skipped by default (can be added if needed)
- All form fields are filled with test data from `config.js`
