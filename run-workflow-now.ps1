# Quick script to trigger GitHub Actions workflow
# This will trigger the workflow via GitHub API

param(
    [Parameter(Mandatory=$false)]
    [string]$GitHubToken = $env:GITHUB_TOKEN,
    
    [Parameter(Mandatory=$false)]
    [string]$GitHubUsername = "sharpkaif-source",
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "AddReseller"
)

if (-not $GitHubToken) {
    Write-Host "❌ GITHUB_TOKEN not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To trigger the workflow, you need a GitHub Personal Access Token." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Get a token and set it:" -ForegroundColor Cyan
    Write-Host "   1. Go to: https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "   2. Generate new token (classic)" -ForegroundColor White
    Write-Host "   3. Check 'repo' scope" -ForegroundColor White
    Write-Host "   4. Run: `$env:GITHUB_TOKEN='your-token'; .\run-workflow-now.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Run manually from GitHub UI:" -ForegroundColor Cyan
    Write-Host "   https://github.com/$GitHubUsername/$RepoName/actions/workflows/reseller-bot.yml" -ForegroundColor White
    exit 1
}

Write-Host "🚀 Triggering GitHub Actions workflow..." -ForegroundColor Green
Write-Host ""

$headers = @{
    "Authorization" = "token $GitHubToken"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "Reseller-Bot-Trigger"
}

$body = @{
    ref = "main"
    inputs = @{}
} | ConvertTo-Json

$url = "https://api.github.com/repos/$GitHubUsername/$RepoName/actions/workflows/reseller-bot.yml/dispatches"

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "✅ Workflow triggered successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 View run: https://github.com/$GitHubUsername/$RepoName/actions" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⏳ The bot will start running in a few seconds..." -ForegroundColor Yellow
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ Error triggering workflow" -ForegroundColor Red
    Write-Host "   Status: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Try running manually from GitHub UI instead:" -ForegroundColor Yellow
    Write-Host "   https://github.com/$GitHubUsername/$RepoName/actions/workflows/reseller-bot.yml" -ForegroundColor Cyan
}
