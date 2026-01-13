# 🚀 GitHub Deployment Instructions

## ✅ Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `AddReseller` (or any name you prefer)
3. Description: `Automated reseller creation bot with Playwright`
4. Choose: **Public** (free unlimited Actions) or **Private** (2,000 minutes/month free)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

## ✅ Step 2: Push Your Code

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/AddReseller.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Or if you prefer SSH:**
```bash
git remote add origin git@github.com:YOUR_USERNAME/AddReseller.git
git branch -M main
git push -u origin main
```

## ✅ Step 3: Configure Secrets (Optional)

If your credentials differ from defaults, add secrets:

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these secrets (if needed):
   - `BASE_URL`: Your admin URL
   - `ADMIN_EMAIL`: Admin email
   - `ADMIN_PASSWORD`: Admin password

**Note:** If you don't set secrets, the workflow will use defaults from `config.js`.

## ✅ Step 4: Test the Workflow

1. Go to your repository on GitHub
2. Click **Actions** tab
3. You should see **"Create Reseller Bot"** workflow
4. Click on it
5. Click **"Run workflow"** → **"Run workflow"**
6. Watch it execute! 🎉

## ✅ Step 5: View Results

1. Click on the running workflow
2. Expand **"Run reseller creation bot"** step
3. See all console logs in real-time
4. Check if reseller was created successfully

## 🔗 Quick Links After Deployment

- **View Workflows:** `https://github.com/YOUR_USERNAME/AddReseller/actions`
- **Trigger via API:** Use `trigger-github-action.js` script
- **Workflow File:** `.github/workflows/reseller-bot.yml`

## 🎯 Next Steps

After deployment, you can:
- ✅ Run manually from GitHub UI
- ✅ Trigger via API using `trigger-github-action.js`
- ✅ Set up scheduled runs (edit workflow file)
- ✅ View all execution history in Actions tab

---

**Need help?** Check `GITHUB_ACTIONS_SETUP.md` for detailed documentation.
