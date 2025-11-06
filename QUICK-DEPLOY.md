# 🚀 Quick Deployment Reference

## Setup (One-time only)

### 1. Add GitHub Secrets
Go to: `https://github.com/xytrixsolutions/crm/settings/secrets/actions`

Add:
- `CRM_DEPLOY_KEY` → Your SSH private key
- `SERVER_HOST` → Your server IP/hostname  
- `SERVER_USER` → SSH username

### 2. Create GitHub Token for Server
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scope: `read:packages`
4. Copy token

### 3. Login on Server
SSH to your server and run:
```bash
cd crm
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u xytrixsolutions --password-stdin
```

## Daily Usage

### Automatic Deployment (Easiest!)
```bash
git tag v0.5.15
git push origin v0.5.15
```
✅ Done! GitHub Actions builds and deploys automatically.

### Manual Deployment with Script (Windows)
```powershell
.\deploy.ps1 -Tag v0.5.15
```

### Manual Deployment with Script (Linux/Mac)
```bash
chmod +x deploy.sh
./deploy.sh v0.5.15
```

## What Happens Behind the Scenes

1. 🏗️ GitHub Actions builds Docker images (3-5 minutes)
2. 📦 Images pushed to `ghcr.io/xytrixsolutions/crm/*`
3. 🚀 Server pulls pre-built images (30 seconds)
4. ♻️ Containers restart with new images
5. 🧹 Old images cleaned up

## Time Comparison

**Before:**
- Build on server: 10-15 minutes ⏰

**After:**
- Build on GitHub: 3-5 minutes (parallel to your work) ⚡
- Deploy on server: 30 seconds 🚀

## Environment Variables (Optional)

Set these to avoid passing parameters:

**Windows PowerShell:**
```powershell
$env:SERVER_HOST = "your-server.com"
$env:SERVER_USER = "root"
$env:SSH_KEY = "$env:USERPROFILE\.ssh\crm-deploy-key"
$env:GITHUB_TOKEN = "ghp_yourtoken"
```

**Linux/Mac:**
```bash
export SERVER_HOST="your-server.com"
export SERVER_USER="root"
export SSH_KEY="~/.ssh/crm-deploy-key"
export GITHUB_TOKEN="ghp_yourtoken"
```

## Troubleshooting

### "Permission denied" on server
```bash
# Check SSH key permissions
chmod 600 ~/.ssh/crm-deploy-key

# Test SSH connection
ssh -i ~/.ssh/crm-deploy-key root@your-server.com
```

### "Failed to pull image"
```bash
# Re-login to GHCR on server
echo $GITHUB_TOKEN | docker login ghcr.io -u xytrixsolutions --password-stdin
```

### "Workflow not triggering"
- Check tag format matches `v*.*.*` (e.g., v1.2.3)
- View workflow runs: https://github.com/xytrixsolutions/crm/actions

### View workflow status
```bash
# Watch the build progress
gh run watch  # Requires GitHub CLI

# Or visit
# https://github.com/xytrixsolutions/crm/actions
```

## Rollback to Previous Version

Super easy! Just deploy an older tag:
```bash
git push origin v0.5.13  # Re-push old tag
# Or
.\deploy.ps1 -Tag v0.5.13
```

## Local Development

Nothing changes for local dev:
```bash
docker compose up -d --build
```

Images build locally when environment variables aren't set.
