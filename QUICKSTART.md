# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment (Optional)
```bash
# The bot is pre-configured with test credentials:
# - BASE_URL: https://test-reseller.singleinterface.com/admin
# - ADMIN_EMAIL: admin@reseller.com
# - ADMIN_PASSWORD: Admin@2025

# If you want to override, create .env file:
cp .env.example .env
# Then edit .env with your custom credentials
```

### Step 3: Run the Bot
```bash
npm test
```

## 📝 Configuration

Edit `config.js` to customize:
- Reseller test data (name, phone, location, etc.)
- Form field values
- Timeout settings

## 🐛 Troubleshooting

**Form fields not found?**
- Open browser with `HEADLESS=false` in `.env`
- Check the selectors in `bot.js` match your HTML structure
- Update selectors if needed

**Login fails?**
- Verify credentials in `.env`
- Check if login form structure matches expected selectors

**Timeout errors?**
- Increase timeout in `config.js` → `playwright.timeout`

## 📧 Email Format

The bot generates user emails in format:
```
mohd.kashif+{random_number}@singleinterface.com
```

Example: `mohd.kashif+123456@singleinterface.com`

## 🎯 What the Bot Does

1. ✅ Logs in as Admin
2. ✅ Navigates to Reseller Dashboard
3. ✅ Clicks "Add Reseller"
4. ✅ Fills Basic Info form
5. ✅ Fills Users form (with random email)
6. ✅ Fills Domain form
7. ✅ Fills Branding form
8. ✅ Submits reseller
9. ✅ Verifies success

## 📸 Screenshots

- On error: `error-screenshot.png`
- On success: `reseller-created.png`
