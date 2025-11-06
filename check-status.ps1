# CRM Deployment Status Checker
# Run this script to check the status of your deployment

param(
    [string]$SshUser = $env:SERVER_USER ?? "root",
    [string]$SshHost = $env:SERVER_HOST ?? "your-server.com",
    [string]$SshKey = $env:SSH_KEY ?? "$env:USERPROFILE\.ssh\crm-deploy-key"
)

$ErrorActionPreference = "Stop"

Write-Host "🔍 Checking CRM Deployment Status..." -ForegroundColor Cyan
Write-Host ""

$statusCommand = @"
echo '📦 Docker Containers Status:'
docker ps --filter 'name=crm' --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}'
echo ''

echo '🌿 Current Git Branch/Tag:'
cd crm && git branch --show-current && git describe --tags --exact-match 2>/dev/null || echo '(not on a tag)'
echo ''

echo '🐳 Docker Images:'
docker images | grep crm | head -5
echo ''

echo '📊 Container Resource Usage:'
docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}' | grep crm
echo ''

echo '📝 Recent Logs (last 20 lines):'
echo '--- Frontend ---'
docker logs crm-frontend --tail 20 2>&1 | tail -10
echo ''
echo '--- Backend ---'
docker logs crm-backend --tail 20 2>&1 | tail -10
echo ''

echo '✅ Health Check:'
echo -n 'Frontend (https://crm.enginesmarket.co.uk): '
curl -s -o /dev/null -w '%{http_code}' https://crm.enginesmarket.co.uk || echo 'Failed'
echo ''
echo -n 'Backend (https://api-crm.enginesmarket.co.uk): '
curl -s -o /dev/null -w '%{http_code}' https://api-crm.enginesmarket.co.uk || echo 'Failed'
echo ''

echo '💾 Disk Usage:'
df -h / | tail -1
"@

Write-Host "Connecting to $SshHost..." -ForegroundColor Blue
ssh -i $SshKey "$SshUser@$SshHost" "$statusCommand"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Status check completed!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Failed to get status" -ForegroundColor Red
    exit 1
}
