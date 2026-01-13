# 🚀 How to Run GitHub Actions Workflow - Step by Step

## 📍 Step 1: Go to Actions Tab

1. Open your repository: https://github.com/sharpkaif-source/AddReseller
2. Click on the **"Actions"** tab (it's in the top menu bar, next to "Code", "Issues", "Pull requests")

## 📍 Step 2: Find the Workflow

You should see:
- **"Create Reseller Bot"** workflow listed on the left sidebar
- If you don't see it, click **"All workflows"** on the left

## 📍 Step 3: Run the Workflow

1. Click on **"Create Reseller Bot"** workflow
2. You'll see a button on the right side: **"Run workflow"** (blue button)
3. Click **"Run workflow"**
4. A dropdown will appear - click the green **"Run workflow"** button again

## 📍 Step 4: Watch It Execute

1. The workflow will start running (you'll see a yellow dot)
2. Click on the running workflow to see details
3. Expand **"Run reseller creation bot"** step to see logs
4. Wait ~52-53 seconds for completion

## 🔍 If You Don't See the Workflow

### Option A: Refresh the Page
- Press `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac) to hard refresh

### Option B: Check Workflow File
- Make sure `.github/workflows/reseller-bot.yml` exists in your repository
- Go to: https://github.com/sharpkaif-source/AddReseller/tree/main/.github/workflows

### Option C: Trigger via API
If the UI doesn't show it, you can trigger it via API using the script:
```bash
node trigger-github-action.js
```
(You'll need to set `GITHUB_TOKEN` and `GITHUB_REPO` environment variables)

## 📸 Visual Guide

```
GitHub Repository Page
├── Code (tab)
├── Issues (tab)
├── Pull requests (tab)
├── Actions (tab) ← CLICK HERE
│   ├── All workflows (left sidebar)
│   │   └── Create Reseller Bot ← CLICK HERE
│   │       └── [Run workflow] button ← CLICK HERE
│   └── Workflow runs (shows history)
└── ...
```

## ✅ What You Should See

**Before Running:**
- Workflow name: "Create Reseller Bot"
- Button: "Run workflow" (blue, on the right)

**After Clicking "Run workflow":**
- A new workflow run appears
- Status: Yellow dot (running) → Green checkmark (success) or Red X (failed)

## 🆘 Still Can't See It?

1. **Check if you're logged in** to GitHub
2. **Check repository permissions** - you need write access
3. **Try direct link:** https://github.com/sharpkaif-source/AddReseller/actions/workflows/reseller-bot.yml
4. **Check browser console** for any errors (F12)

## 📞 Quick Links

- **Actions Tab:** https://github.com/sharpkaif-source/AddReseller/actions
- **Workflow File:** https://github.com/sharpkaif-source/AddReseller/blob/main/.github/workflows/reseller-bot.yml
- **Direct Workflow:** https://github.com/sharpkaif-source/AddReseller/actions/workflows/reseller-bot.yml
