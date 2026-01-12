# How GitHub Actions Works - Detailed Explanation

## 🔄 Complete Execution Flow

### **Phase 1: Trigger** (How You Start It)

#### Option A: Manual Trigger (GitHub UI)
1. Go to your GitHub repository
2. Click **Actions** tab
3. Select **"Create Reseller Bot"** workflow
4. Click **"Run workflow"** → **"Run workflow"**
5. Workflow starts immediately

#### Option B: API Trigger (Like Vercel URL)
```bash
# Run this script
node trigger-github-action.js

# It sends a POST request to GitHub API:
POST https://api.github.com/repos/YOUR_USERNAME/AddReseller/dispatches
Body: { "event_type": "create-reseller" }
```

#### Option C: Scheduled (Automatic)
- Runs automatically at specified times (if enabled)
- Example: Daily at midnight UTC

---

### **Phase 2: GitHub Actions Runner Setup**

When the workflow starts, GitHub:

1. **Spins up a fresh Ubuntu Linux virtual machine**
   - Clean environment (no previous state)
   - 2-core CPU, 7GB RAM
   - Fresh Ubuntu 22.04

2. **Automatically sets environment variables:**
   ```bash
   CI=true                    # Indicates CI environment
   GITHUB_ACTIONS=true        # Indicates GitHub Actions
   GITHUB_RUN_ID=123456      # Unique run ID
   ```

3. **Downloads your code:**
   - All files from your repository
   - `bot.js`, `config.js`, `package.json`, etc.

---

### **Phase 3: Setup Steps (Workflow File)**

The workflow file (`.github/workflows/reseller-bot.yml`) runs these steps:

#### Step 1: Checkout Code
```yaml
- uses: actions/checkout@v4
```
- Downloads all your code to the runner

#### Step 2: Setup Node.js
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '18'
```
- Installs Node.js 18
- Sets up npm

#### Step 3: Install Dependencies
```bash
npm ci
```
- Installs `playwright`, `dotenv` from `package.json`
- Uses `npm ci` (clean install, faster)

#### Step 4: Install Playwright Browsers
```bash
npx playwright install chromium --with-deps
```
- Downloads Chromium browser binary (~170MB)
- Installs system dependencies (fonts, libraries)
- **This is why it works!** GitHub Actions has the resources

#### Step 5: Setup Environment Variables
```bash
BASE_URL=${{ secrets.BASE_URL || 'https://test-reseller.singleinterface.com/admin' }}
ADMIN_EMAIL=${{ secrets.ADMIN_EMAIL || 'admin@reseller.com' }}
ADMIN_PASSWORD=${{ secrets.ADMIN_PASSWORD || 'Admin@2025' }}
```
- Uses GitHub Secrets (if set) or defaults from `config.js`

#### Step 6: Copy Logo File
```bash
cp Logo.png logo.png
```
- Ensures logo file exists for branding form

---

### **Phase 4: Bot Auto-Detection**

When `bot.js` runs, it loads `config.js`:

```javascript
// config.js automatically detects CI
headless: process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
```

**On GitHub Actions:**
- `process.env.CI` = `"true"` ✅
- `process.env.GITHUB_ACTIONS` = `"true"` ✅
- **Result:** `headless = true`

**On Your Local Machine:**
- `process.env.CI` = `undefined`
- `process.env.GITHUB_ACTIONS` = `undefined`
- **Result:** `headless = false` (visible browser)

---

### **Phase 5: Bot Execution (Headless Mode)**

The bot runs **exactly the same** as locally, but:

#### **What's Different:**
- ✅ Browser runs in **headless mode** (no visible window)
- ✅ All console.log() output goes to GitHub Actions logs
- ✅ Screenshots still work (saved to files)
- ✅ Everything else is **identical**

#### **What's the Same:**
- ✅ Same form filling logic
- ✅ Same field selectors
- ✅ Same verification steps
- ✅ Same error handling
- ✅ Same execution time (~52-53 seconds)

#### **Execution Steps:**
```
1. Launch Chromium (headless)
   └─> browser = await chromium.launch({ headless: true })

2. Navigate to admin URL
   └─> page.goto('https://test-reseller.singleinterface.com/admin')

3. Login
   └─> Fill email/password, click login

4. Fill Basic Info Form
   └─> Reseller Name, Phone, Location, Geo Covered (China), 
       Onboarding Fee, Monthly Share, Description

5. Click "Next Step"

6. Fill Users Form
   └─> Email (mohd.kashif+random@singleinterface.com)

7. Click "Next Step"

8. Fill Domain Form
   └─> Business Name

9. Click "Next Step"

10. Fill Branding Form
    └─> Upload logo.png, Select "English", Check "default language"

11. Click "Create Reseller"

12. Wait for navigation to dashboard

13. Verify reseller name appears in list

14. Close browser
```

---

### **Phase 6: Results & Artifacts**

#### **On Success:**
- ✅ Workflow shows green checkmark
- ✅ Console logs show all steps
- ✅ Reseller is created in your system
- ✅ Summary shows execution time

#### **On Failure:**
- ❌ Workflow shows red X
- ❌ Error screenshots uploaded as artifacts
- ❌ Can download screenshots to debug
- ❌ Full error stack trace in logs

#### **Viewing Results:**
1. Go to **Actions** tab
2. Click on the workflow run
3. Expand **"Run reseller creation bot"** step
4. See all console output in real-time
5. Download artifacts if failed

---

## 🔍 Key Technical Details

### **Why Headless Mode Works:**
- GitHub Actions runners have **no display server** (no GUI)
- Playwright's headless mode doesn't need a display
- Browser runs "invisibly" but fully functional
- All DOM interactions work normally

### **Environment Detection:**
```javascript
// config.js
headless: process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'

// When running on GitHub Actions:
process.env.CI === 'true'           // ✅ True
process.env.GITHUB_ACTIONS === 'true'  // ✅ True
// Result: headless = true

// When running locally:
process.env.CI === undefined        // ❌ False
process.env.GITHUB_ACTIONS === undefined  // ❌ False
// Result: headless = false (visible browser)
```

### **Browser Installation:**
```bash
npx playwright install chromium --with-deps
```
- Downloads Chromium to `~/.cache/ms-playwright/`
- Installs system libraries (libnss3, libatk, etc.)
- Takes ~30-60 seconds (cached on subsequent runs)

### **Timeout Safety:**
```yaml
timeout-minutes: 10  # Safety timeout
```
- Bot takes ~52-53 seconds
- 10-minute timeout provides safety margin
- Prevents infinite hangs

---

## 📊 Comparison: Local vs GitHub Actions

| Aspect | Local Execution | GitHub Actions |
|--------|----------------|----------------|
| **Browser** | Visible window | Headless (invisible) |
| **Environment** | Your Windows PC | Ubuntu Linux VM |
| **Setup** | Manual npm install | Automatic |
| **Browser Install** | Manual `playwright install` | Automatic in workflow |
| **Logs** | Terminal/console | GitHub Actions UI |
| **Screenshots** | Saved locally | Uploaded as artifacts |
| **Execution Time** | ~52-53 seconds | ~52-53 seconds |
| **Result** | Same reseller created | Same reseller created |

---

## 🎯 What Actually Happens to Your Reseller

**The reseller IS created in your actual system!**

1. Bot navigates to your **real admin URL**
2. Logs in with **real credentials**
3. Fills forms on your **real application**
4. Submits to your **real backend API**
5. Reseller appears in your **real dashboard**

**GitHub Actions is just the "computer" running the bot.**
**The bot interacts with YOUR system, not GitHub's.**

---

## 🚀 Triggering Methods Explained

### **1. Manual (GitHub UI)**
- Click button → Workflow starts
- Good for: Testing, one-off runs

### **2. API (repository_dispatch)**
```javascript
// trigger-github-action.js sends:
POST https://api.github.com/repos/owner/repo/dispatches
{
  "event_type": "create-reseller"
}
```
- Good for: External systems, webhooks, automation

### **3. Schedule (cron)**
```yaml
schedule:
  - cron: '0 0 * * *'  # Daily at midnight
```
- Good for: Regular automated testing

---

## ✅ Summary

**GitHub Actions:**
1. Provides a Linux VM with Node.js
2. Installs Playwright and Chromium automatically
3. Runs your bot in headless mode
4. Shows all logs in the Actions tab
5. Creates the reseller in YOUR system (not GitHub's)
6. Takes ~52-53 seconds (same as local)

**The bot works identically to local execution, just in the cloud!**
