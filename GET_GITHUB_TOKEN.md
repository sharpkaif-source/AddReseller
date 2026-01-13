# How to Get GitHub Personal Access Token

To create the repository automatically, you need a GitHub Personal Access Token.

## Steps to Create Token:

1. **Go to GitHub Settings:**
   - Visit: https://github.com/settings/tokens
   - Or: GitHub → Your Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token:**
   - Click **"Generate new token"** → **"Generate new token (classic)"**

3. **Configure Token:**
   - **Note:** `Reseller Bot Deployment`
   - **Expiration:** Choose your preference (90 days, 1 year, or no expiration)
   - **Scopes:** Check these boxes:
     - ✅ `repo` (Full control of private repositories)
       - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
     - ✅ `workflow` (Update GitHub Action workflows)

4. **Generate:**
   - Click **"Generate token"** at the bottom
   - **IMPORTANT:** Copy the token immediately (you won't see it again!)
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

5. **Use the Token:**
   - Run: `.\create-github-repo.ps1 -GitHubUsername "your-username" -GitHubToken "ghp_xxxxx"`
   - Or provide it when prompted

## Security Note:
- Keep your token secret!
- Don't commit it to git
- Revoke it if compromised: https://github.com/settings/tokens

## Alternative: Manual Creation
If you prefer not to use a token, you can:
1. Create the repository manually at: https://github.com/new
2. Then run: `.\deploy-to-github.ps1 -GitHubUsername "your-username"`
