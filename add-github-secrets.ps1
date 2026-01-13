# PowerShell script to add GitHub Secrets via API
# Usage: .\add-github-secrets.ps1 -GitHubToken "your-token"

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubToken,
    
    [Parameter(Mandatory=$false)]
    [string]$GitHubUsername = "sharpkaif-source",
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "AddReseller"
)

$ErrorActionPreference = "Stop"

Write-Host "🔐 Adding GitHub Secrets..." -ForegroundColor Green
Write-Host ""

# Secrets to add
$secrets = @{
    "SMTP_SERVER" = "smtp.gmail.com"
    "SMTP_PORT" = "587"
    "SMTP_USERNAME" = "mohd.kashif@singleinterface.com"
    "SMTP_PASSWORD" = "pirv tvjr bqlc espa"
    "NOTIFICATION_EMAIL" = "mohd.kashif@singleinterface.com"
}

$baseUrl = "https://api.github.com/repos/$GitHubUsername/$RepoName"
$headers = @{
    "Authorization" = "token $GitHubToken"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "GitHub-Secrets-Setup"
}

# Get the repository public key for encryption
Write-Host "📦 Getting repository public key..." -ForegroundColor Cyan
try {
    $publicKeyResponse = Invoke-RestMethod -Uri "$baseUrl/actions/secrets/public-key" -Method Get -Headers $headers
    $publicKey = $publicKeyResponse.key
    $keyId = $publicKeyResponse.key_id
    Write-Host "✅ Public key retrieved" -ForegroundColor Green
} catch {
    Write-Host "❌ Error getting public key: $_" -ForegroundColor Red
    Write-Host "   Make sure your token has 'repo' scope" -ForegroundColor Yellow
    exit 1
}

# Function to encrypt secret using public key
function Encrypt-Secret {
    param(
        [string]$Secret,
        [string]$PublicKey
    )
    
    # Load System.Security.Cryptography
    Add-Type -AssemblyName System.Security
    
    # Convert public key from base64
    $publicKeyBytes = [Convert]::FromBase64String($PublicKey)
    
    # Import RSA public key
    $rsa = New-Object System.Security.Cryptography.RSACryptoServiceProvider
    $rsa.ImportRSAPublicKey($publicKeyBytes, [ref]$null)
    
    # Encrypt the secret
    $secretBytes = [System.Text.Encoding]::UTF8.GetBytes($Secret)
    $encryptedBytes = $rsa.Encrypt($secretBytes, $false)
    
    # Return base64 encoded encrypted secret
    return [Convert]::ToBase64String($encryptedBytes)
}

# Add each secret
foreach ($secretName in $secrets.Keys) {
    $secretValue = $secrets[$secretName]
    
    Write-Host "🔐 Adding secret: $secretName" -ForegroundColor Cyan
    
    try {
        # Encrypt the secret
        $encryptedValue = Encrypt-Secret -Secret $secretValue -PublicKey $publicKey
        
        # Prepare request body
        $body = @{
            encrypted_value = $encryptedValue
            key_id = $keyId
        } | ConvertTo-Json
        
        # Add the secret
        $response = Invoke-RestMethod -Uri "$baseUrl/actions/secrets/$secretName" -Method Put -Headers $headers -Body $body -ContentType "application/json"
        
        Write-Host "   ✅ $secretName added successfully" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 404) {
            Write-Host "   ⚠️  Secret might already exist or repository not found" -ForegroundColor Yellow
        } else {
            Write-Host "   ❌ Error adding $secretName : $_" -ForegroundColor Red
            Write-Host "   Status: $statusCode" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "✅ Secrets setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Added secrets:" -ForegroundColor Yellow
foreach ($secretName in $secrets.Keys) {
    Write-Host "   - $secretName" -ForegroundColor White
}
Write-Host ""
Write-Host "🔗 Verify at: https://github.com/$GitHubUsername/$RepoName/settings/secrets/actions" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 Test by running the workflow manually" -ForegroundColor Yellow
