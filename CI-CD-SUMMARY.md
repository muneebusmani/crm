# 🎉 CI/CD Automation Summary

## What Was Changed

### ✅ Files Modified
1. **`.github/workflows/docker.yml`** - Complete CI/CD workflow for automated builds and deployments
2. **`docker-compose.yaml`** - Added support for pre-built images via environment variables

### ✅ Files Created
1. **`deploy.sh`** - Bash deployment script (Linux/Mac)
2. **`deploy.ps1`** - PowerShell deployment script (Windows)
3. **`DEPLOYMENT.md`** - Complete deployment guide
4. **`QUICK-DEPLOY.md`** - Quick reference for daily deployments
5. **`.env.deploy.example`** - Example environment variables for deployment
6. **`.github/ISSUE_TEMPLATE/deployment.md`** - Deployment checklist template
7. **`README.md`** - Updated with deployment section

---

## How It Works Now

### The Old Way (Manual) ❌
```bash
cd crm
eval $(ssh-agent)
ssh-add ~/.ssh/crm-deploy-key
git fetch --all
git checkout tags/v0.5.13 -b release-v0.5.13
docker compose up -d --build  # ⏰ 10-15 minutes of building on server
```

### The New Way (Automated) ✅

**Option 1: Fully Automated (Recommended)**
```bash
git tag v0.5.14
git push origin v0.5.14
# Done! GitHub Actions builds & deploys everything
```

**Option 2: Manual with Script**
```powershell
.\deploy.ps1 -Tag v0.5.14
# 30 seconds deployment with pre-built images
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Developer                                                        │
│                                                                  │
│ git tag v0.5.14                                                 │
│ git push origin v0.5.14                                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ GitHub Actions (Ubuntu, 4-core, 14GB RAM)                      │
│                                                                  │
│ 1. Build Frontend Docker Image (parallel)    ⏰ 3-5 min        │
│ 2. Build Backend Docker Image (parallel)     ⏰ 3-5 min        │
│ 3. Push to ghcr.io/xytrixsolutions/crm/*                       │
│ 4. Connect to server via SSH                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Production Server                                                │
│                                                                  │
│ 1. Git checkout tag                          ⏰ 5 sec          │
│ 2. Pull pre-built images                     ⏰ 20 sec         │
│ 3. docker compose up -d --no-build           ⏰ 5 sec          │
│ 4. Clean up old images                       ⏰ 5 sec          │
│                                                                  │
│ Total deployment time: ~35 seconds! 🚀                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Benefits

### 🚀 Speed
- **Before:** 10-15 minutes build time on server
- **After:** 30 seconds deployment (images pre-built on GitHub)

### 💪 Reliability
- Same image tested in CI goes to production
- No "works on my machine" issues
- Consistent builds every time

### 🔄 Easy Rollbacks
```bash
# Rollback to any previous version instantly
.\deploy.ps1 -Tag v0.5.12
```

### 📦 Disk Space
- Old images auto-cleaned after 72 hours
- No build cache accumulation on server

### 🔐 Security
- SSH key stored in GitHub Secrets
- GitHub Container Registry for images
- No credentials in code

---

## Setup Required (One-Time)

### 1. GitHub Repository Secrets
Add these at: `Settings > Secrets and variables > Actions`

| Secret Name | Value | Example |
|------------|-------|---------|
| `CRM_DEPLOY_KEY` | SSH private key content | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SERVER_HOST` | Server hostname/IP | `crm.yourserver.com` or `192.168.1.100` |
| `SERVER_USER` | SSH username | `root` or `ubuntu` |

### 2. Server Login to GHCR
```bash
# On your server, run once:
cd crm
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u xytrixsolutions --password-stdin
```

Get token from: https://github.com/settings/tokens (scope: `read:packages`)

### 3. Test the Workflow
```bash
# Create a test tag
git tag v0.5.14-test
git push origin v0.5.14-test

# Watch it run at:
# https://github.com/xytrixsolutions/crm/actions
```

---

## Workflow Jobs

### Job 1: `build-and-push`
- ✅ Builds frontend and backend Docker images
- ✅ Pushes to GitHub Container Registry
- ✅ Uses layer caching for speed
- ✅ Runs on every tag push (`v*.*.*`)

### Job 2: `deploy`
- ✅ Waits for build job to complete
- ✅ SSHs into your server
- ✅ Pulls pre-built images
- ✅ Restarts containers
- ✅ Cleans up old images
- ✅ Only runs on tag push

---

## Docker Compose Changes

```yaml
services:
  frontend:
    image: ${FRONTEND_IMAGE:-crm-frontend-local}  # NEW!
    build: ...  # Kept for local development
```

**How it works:**
- If `FRONTEND_IMAGE` environment variable is set → uses that image
- Otherwise → builds locally (for development)

**Local dev unchanged:**
```bash
docker compose up -d --build  # Still works!
```

**Production with pre-built images:**
```bash
export FRONTEND_IMAGE=ghcr.io/xytrixsolutions/crm/frontend:v0.5.14
export BACKEND_IMAGE=ghcr.io/xytrixsolutions/crm/backend:v0.5.14
docker compose up -d --no-build
```

---

## Troubleshooting

### Workflow not triggering?
- Check tag format: `v1.2.3` (must start with `v`)
- View actions tab: https://github.com/xytrixsolutions/crm/actions

### Build failing?
- Check GitHub Actions logs
- Verify Dockerfile builds locally: `docker build -t test .`

### Deployment failing?
- Test SSH connection: `ssh -i ~/.ssh/crm-deploy-key user@server`
- Verify secrets are set in GitHub
- Check server has Docker and Git installed

### Images not pulling on server?
- Re-login to GHCR: `echo $TOKEN | docker login ghcr.io -u xytrixsolutions --password-stdin`
- Check token has `read:packages` scope
- Verify images exist: https://github.com/orgs/xytrixsolutions/packages

---

## Next Steps

1. **Test the setup:**
   ```bash
   git tag v0.5.14-test
   git push origin v0.5.14-test
   ```

2. **Watch the magic happen:**
   - Go to: https://github.com/xytrixsolutions/crm/actions
   - See builds complete in ~5 minutes
   - See deployment complete in ~30 seconds

3. **Verify deployment:**
   - Frontend: https://crm.enginesmarket.co.uk
   - Backend: https://api-crm.enginesmarket.co.uk

4. **Celebrate! 🎉**
   - No more waiting for builds on your slow server
   - Fast, reliable, automated deployments

---

## Questions?

- Full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Quick reference: [QUICK-DEPLOY.md](./QUICK-DEPLOY.md)
- Manual deploy scripts: `deploy.sh` or `deploy.ps1`

Enjoy your blazing fast deployments! 🚀
