# PowerShell script to create GitHub repository and deploy
# Usage: .\create-github-repo.ps1 -GitHubUsername "your-username" -GitHubToken "your-token"

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [Parameter(Mandatory=$true)]
    [string]$GitHubToken,
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "AddReseller",
    
    [Parameter(Mandatory=$false)]
    [string]$Description = "Automated reseller creation bot with Playwright",
    
    [Parameter(Mandatory=$false)]
    [switch]$Private = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Creating GitHub repository and deploying..." -ForegroundColor Green
Write-Host ""

# Create repository via GitHub API
$repoUrl = "https://api.github.com/user/repos"
$headers = @{
    "Authorization" = "token $GitHubToken"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "Reseller-Bot-Deploy"
}
$body = @{
    name = $RepoName
    description = $Description
    private = $Private.IsPresent
    auto_init = $false
} | ConvertTo-Json

Write-Host "📦 Creating repository: $RepoName" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri $repoUrl -Method Post -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "✅ Repository created successfully!" -ForegroundColor Green
    Write-Host "   URL: $($response.html_url)" -ForegroundColor Cyan
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 422) {
        Write-Host "⚠️  Repository already exists or name is invalid" -ForegroundColor Yellow
        Write-Host "   Continuing with deployment..." -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error creating repository: $_" -ForegroundColor Red
        Write-Host "   Status: $statusCode" -ForegroundColor Red
        exit 1
    }
}

# Wait a moment for GitHub to process
Start-Sleep -Seconds 2

# Check if remote already exists
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "⚠️  Remote 'origin' already exists: $remoteExists" -ForegroundColor Yellow
    git remote remove origin
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
    Write-Host "✅ Successfully deployed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Go to: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor White
    Write-Host "   2. Click 'Actions' tab" -ForegroundColor White
    Write-Host "   3. Click 'Create Reseller Bot' workflow" -ForegroundColor White
    Write-Host "   4. Click 'Run workflow' → 'Run workflow'" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Direct links:" -ForegroundColor Cyan
    Write-Host "   Repository: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor White
    Write-Host "   Actions: https://github.com/$GitHubUsername/$RepoName/actions" -ForegroundColor White
} catch {
    Write-Host ""
    Write-Host "❌ Error pushing to GitHub" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "   You may need to:" -ForegroundColor Yellow
    Write-Host "   1. Set up authentication (GitHub token in URL or SSH key)" -ForegroundColor White
    Write-Host "   2. Or push manually: git push -u origin $currentBranch" -ForegroundColor White
    exit 1
}
