# CRM Deployment Script (PowerShell)
# This script simplifies deploying to your server using pre-built images from GitHub

param(
    [Parameter(Mandatory=$true)]
    [string]$Tag,
    
    [string]$SshUser = $env:SSH_USER ?? "root",
    [string]$SshHost = $env:SERVER_HOST ?? "your-server.com",
    [string]$SshKey = $env:SSH_KEY ?? "$env:USERPROFILE\.ssh\crm-deploy-key",
    [string]$GithubToken = $env:GITHUB_TOKEN
)

$ErrorActionPreference = "Stop"

$REPO = "xytrixsolutions/crm"

Write-Host "Deploying CRM version $Tag..." -ForegroundColor Blue

# Check if GitHub token is set
if ([string]::IsNullOrEmpty($GithubToken)) {
    Write-Host "Warning: GITHUB_TOKEN not set. You may need to login to GHCR on the server." -ForegroundColor Yellow
}

# Create SSH command
$sshCommand = @"
set -e

echo '📦 Navigating to CRM directory...'
cd crm

echo '🔄 Fetching latest git changes...'
git fetch --all
git checkout tags/$Tag -B release-$Tag

echo '🔐 Logging into GitHub Container Registry...'
echo '$GithubToken' | docker login ghcr.io -u xytrixsolutions --password-stdin

echo '⬇️ Pulling pre-built images...'
docker pull ghcr.io/$REPO/frontend:$Tag
docker pull ghcr.io/$REPO/backend:$Tag

echo '⚙️ Setting image environment variables...'
export FRONTEND_IMAGE=ghcr.io/$REPO/frontend:$Tag
export BACKEND_IMAGE=ghcr.io/$REPO/backend:$Tag

echo '🚀 Deploying with docker compose...'
docker compose up -d --no-build

echo '🧹 Cleaning up old images...'
docker image prune -af --filter 'until=72h'

echo '✅ Deployment complete!'
"@

Write-Host "Connecting to server via SSH..." -ForegroundColor Blue

# Execute SSH command
ssh -i $SshKey "$SshUser@$SshHost" $sshCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully deployed $Tag to server!" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
