# 📋 Setup Checklist

Use this checklist to set up automated deployments for the first time.

## ✅ GitHub Repository Setup

- [ ] Add `CRM_DEPLOY_KEY` secret
  - Go to: https://github.com/xytrixsolutions/crm/settings/secrets/actions
  - Click "New repository secret"
  - Name: `CRM_DEPLOY_KEY`
  - Value: Contents of your SSH private key (~/.ssh/crm-deploy-key)

- [ ] Add `SERVER_HOST` secret
  - Name: `SERVER_HOST`
  - Value: Your server hostname or IP address

- [ ] Add `SERVER_USER` secret  
  - Name: `SERVER_USER`
  - Value: SSH username (e.g., `root` or `ubuntu`)

## ✅ GitHub Personal Access Token (PAT)

- [ ] Create PAT for GHCR access
  - Go to: https://github.com/settings/tokens
  - Click "Generate new token (classic)"
  - Select scope: `read:packages` and `write:packages`
  - Copy the token (starts with `ghp_`)
  - Save it securely (you'll need it for server and local deployments)

## ✅ Server Setup

- [ ] SSH into your server
  ```bash
  ssh -i ~/.ssh/crm-deploy-key user@your-server.com
  ```

- [ ] Navigate to project directory
  ```bash
  cd crm
  ```

- [ ] Login to GitHub Container Registry
  ```bash
  echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u xytrixsolutions --password-stdin
  ```

- [ ] Verify Docker network exists
  ```bash
  docker network ls | grep web || docker network create web
  ```

- [ ] Verify environment files exist
  ```bash
  ls -la apps/frontend/.env.production
  ls -la apps/backend/.env.production
  ```

## ✅ Local Environment Setup (Optional)

- [ ] Copy environment template
  ```bash
  cp .env.deploy.example .env.deploy
  ```

- [ ] Edit `.env.deploy` with your values
  ```bash
  # Edit SERVER_HOST, SERVER_USER, SSH_KEY, GITHUB_TOKEN
  notepad .env.deploy  # or your preferred editor
  ```

- [ ] Test deployment script (PowerShell on Windows)
  ```powershell
  # Load environment variables
  Get-Content .env.deploy | ForEach-Object {
    if ($_ -match '^([^=]+)=(.+)$') {
      [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
  }
  
  # Test (don't actually deploy)
  # .\deploy.ps1 -Tag v0.5.14
  ```

## ✅ Test the Workflow

- [ ] Create a test tag
  ```bash
  git tag v0.5.14-test
  git push origin v0.5.14-test
  ```

- [ ] Watch GitHub Actions run
  - Go to: https://github.com/xytrixsolutions/crm/actions
  - Click on the latest workflow run
  - Verify both jobs complete successfully:
    - ✅ build-and-push
    - ✅ deploy

- [ ] Verify images in GHCR
  - Go to: https://github.com/orgs/xytrixsolutions/packages
  - You should see `crm/frontend` and `crm/backend` packages

- [ ] Verify deployment on server
  ```bash
  ssh -i ~/.ssh/crm-deploy-key user@your-server.com
  cd crm
  docker ps  # Should show running containers
  git branch  # Should show release-v0.5.14-test
  ```

- [ ] Test the application
  - Frontend: https://crm.enginesmarket.co.uk
  - Backend API: https://api-crm.enginesmarket.co.uk

## ✅ Documentation Review

- [ ] Read [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [ ] Read [QUICK-DEPLOY.md](./QUICK-DEPLOY.md) - Quick reference
- [ ] Read [CI-CD-SUMMARY.md](./CI-CD-SUMMARY.md) - What changed and why

## ✅ Ready for Production!

Once all checkboxes are complete, you're ready to deploy with confidence:

```bash
# Create production tag
git tag v0.5.14
git push origin v0.5.14

# Sit back and relax! ☕
# GitHub Actions will build and deploy automatically
```

## 🎉 Success Indicators

After pushing a tag, you should see:

1. ✅ GitHub Actions workflow starts (within seconds)
2. ✅ Build job completes (3-5 minutes)
3. ✅ Deploy job completes (30 seconds)
4. ✅ Application accessible at your domains
5. ✅ No errors in container logs: `docker compose logs -f`

## ⚠️ Troubleshooting

If something doesn't work, check:

- [ ] GitHub Actions logs for error messages
- [ ] Server SSH access with the key
- [ ] GHCR login on server
- [ ] Docker network and environment files
- [ ] Tag format matches `v*.*.*` pattern

## 📞 Need Help?

Refer to the troubleshooting sections in:
- [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting)
- [QUICK-DEPLOY.md](./QUICK-DEPLOY.md#troubleshooting)
