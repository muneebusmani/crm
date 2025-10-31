# CRM Deployment Guide

This guide explains how to deploy the CRM application using automated builds from GitHub Actions.

## Overview

The deployment process has been automated to:
1. **Build** Docker images on GitHub Actions (fast, powerful servers)
2. **Push** images to GitHub Container Registry (ghcr.io)
3. **Deploy** pre-built images to your server via SSH (no build time on server!)

## Prerequisites

### 1. GitHub Secrets Setup

Add these secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):

- `CRM_DEPLOY_KEY`: Your SSH private key for server access
- `SERVER_HOST`: Your server's hostname or IP address
- `SERVER_USER`: SSH username (e.g., `root` or your user)

The `GITHUB_TOKEN` is automatically provided by GitHub Actions.

### 2. Server Setup

On your server, make sure:

1. **Docker is installed** and the user has permission to run docker commands
2. **Git is configured** with access to your repository
3. **The project is cloned** at `~/crm` (or update paths in workflow)
4. **Traefik network exists**: `docker network create web`
5. **Environment files exist**:
   - `apps/frontend/.env.production`
   - `apps/backend/.env.production`

### 3. GitHub Container Registry Access

The images are stored in GitHub Container Registry (ghcr.io). To pull them on your server:

1. Create a Personal Access Token (PAT) on GitHub:
   - Go to `Settings > Developer settings > Personal access tokens > Tokens (classic)`
   - Generate new token with `read:packages` scope
   
2. Login to GHCR on your server:
   ```bash
   echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
   ```

## Deployment Methods

### Method 1: Automated via Git Tags (Recommended)

Simply create and push a version tag:

```bash
git tag v0.5.14
git push origin v0.5.14
```

This will:
- ✅ Build Docker images on GitHub Actions
- ✅ Push images to GitHub Container Registry
- ✅ Automatically deploy to your server via SSH
- ✅ Clean up old images

### Method 2: Manual Deployment Script

Use the provided `deploy.sh` script:

```bash
# Make it executable (first time only)
chmod +x deploy.sh

# Deploy a specific version
./deploy.sh v0.5.14
```

Make sure to set these environment variables or update the script:
```bash
export SSH_USER="root"
export SSH_HOST="your-server.com"
export SSH_KEY="~/.ssh/crm-deploy-key"
export GITHUB_TOKEN="your_github_pat"
```

### Method 3: Manual SSH Deployment

If you prefer to run commands manually:

```bash
# On your server
cd crm
git fetch --all
git checkout tags/v0.5.14 -b release-v0.5.14

# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Pull pre-built images
docker pull ghcr.io/xytrixsolutions/crm/frontend:v0.5.14
docker pull ghcr.io/xytrixsolutions/crm/backend:v0.5.14

# Set image environment variables
export FRONTEND_IMAGE=ghcr.io/xytrixsolutions/crm/frontend:v0.5.14
export BACKEND_IMAGE=ghcr.io/xytrixsolutions/crm/backend:v0.5.14

# Deploy
docker compose up -d --no-build

# Clean up
docker image prune -af --filter "until=72h"
```

## Workflow Explanation

### `.github/workflows/docker.yml`

The workflow has two jobs:

#### 1. `build-and-push`
- Runs on every tag push (`v*.*.*`)
- Builds frontend and backend images using Docker Buildx
- Pushes images to `ghcr.io/xytrixsolutions/crm/frontend:TAG` and `backend:TAG`
- Uses layer caching for faster builds

#### 2. `deploy`
- Runs after successful build
- Connects to your server via SSH
- Pulls pre-built images
- Updates docker-compose with new images
- Restarts containers with zero build time

## Docker Compose Changes

The `docker-compose.yaml` now supports environment variables for images:

```yaml
services:
  frontend:
    image: ${FRONTEND_IMAGE:-crm-frontend-local}
    build: ...  # Fallback for local development
```

- If `FRONTEND_IMAGE` is set, uses that image
- Otherwise, builds locally (development mode)

## Benefits

✅ **Fast deployments**: No build time on your server (builds happen on GitHub's infrastructure)  
✅ **Consistent builds**: Same image tested in CI is deployed to production  
✅ **Easy rollbacks**: Just deploy a previous tag  
✅ **Cache optimization**: Subsequent builds are faster due to layer caching  
✅ **Automated**: Push a tag and everything happens automatically  

## Troubleshooting

### Images not found on server
Make sure you're logged into GHCR on your server:
```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

### Permission denied on server
Check that your SSH key is added to GitHub secrets and has proper permissions on the server.

### Build fails in GitHub Actions
Check the Actions tab in your repository for detailed error logs.

### Old workflow still running
Cancel old workflow runs in the Actions tab if needed.

## Local Development

For local development, just use docker-compose as usual:

```bash
docker compose up -d --build
```

The `image` directive with fallback ensures it builds locally when env vars aren't set.

## Version Management

Recommended versioning scheme:
- `v1.0.0` - Major releases
- `v1.1.0` - Minor releases  
- `v1.1.1` - Patch releases

Create tags from your latest commit:
```bash
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3
```
