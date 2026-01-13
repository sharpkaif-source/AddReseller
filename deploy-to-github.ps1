# PowerShell script to deploy to GitHub
# Usage: .\deploy-to-github.ps1 -GitHubUsername "your-username"

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "AddReseller"
)

Write-Host "🚀 Starting GitHub deployment..." -ForegroundColor Green
Write-Host ""

# Check if remote already exists
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "⚠️  Remote 'origin' already exists: $remoteExists" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to update it? (y/n)"
    if ($overwrite -eq "y" -or $overwrite -eq "Y") {
        git remote remove origin
    } else {
        Write-Host "❌ Deployment cancelled" -ForegroundColor Red
        exit 1
    }
}

# Add remote
$remoteUrl = "https://github.com/$GitHubUsername/$RepoName.git"
Write-Host "📦 Adding remote: $remoteUrl" -ForegroundColor Cyan
git remote add origin $remoteUrl

# Check current branch
$currentBranch = git branch --show-current
Write-Host "📌 Current branch: $currentBranch" -ForegroundColor Cyan

# Push to GitHub
Write-Host ""
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Green
Write-Host "   Repository: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Cyan
Write-Host ""

try {
    git push -u origin $currentBranch
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Go to: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor White
    Write-Host "   2. Click 'Actions' tab" -ForegroundColor White
    Write-Host "   3. Click 'Create Reseller Bot' workflow" -ForegroundColor White
    Write-Host "   4. Click 'Run workflow' → 'Run workflow'" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Direct link: https://github.com/$GitHubUsername/$RepoName/actions" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "❌ Error pushing to GitHub" -ForegroundColor Red
    Write-Host "   Make sure you've created the repository on GitHub first:" -ForegroundColor Yellow
    Write-Host "   https://github.com/new" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Repository name should be: $RepoName" -ForegroundColor Yellow
    exit 1
}
