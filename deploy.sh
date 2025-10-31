#!/bin/bash

# CRM Deployment Script
# This script simplifies deploying to your server using pre-built images from GitHub

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if tag is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide a version tag${NC}"
    echo "Usage: ./deploy.sh v0.5.13"
    exit 1
fi

TAG=$1
REPO="xytrixsolutions/crm"

echo -e "${BLUE}Deploying CRM version ${TAG}...${NC}"

# SSH connection details (customize these)
SSH_USER="${SSH_USER:-root}"
SSH_HOST="${SSH_HOST:-your-server.com}"
SSH_KEY="${SSH_KEY:-~/.ssh/crm-deploy-key}"

# Deploy to server
ssh -i "$SSH_KEY" "$SSH_USER@$SSH_HOST" << ENDSSH
set -e

echo -e "${BLUE}Navigating to CRM directory...${NC}"
cd crm

echo -e "${BLUE}Fetching latest git changes...${NC}"
git fetch --all
git checkout tags/${TAG} -B release-${TAG}

echo -e "${BLUE}Logging into GitHub Container Registry...${NC}"
# You'll need a GitHub Personal Access Token with read:packages permission
# Set it as GITHUB_TOKEN environment variable or create a .env file
echo "\$GITHUB_TOKEN" | docker login ghcr.io -u xytrixsolutions --password-stdin

echo -e "${BLUE}Pulling pre-built images...${NC}"
docker pull ghcr.io/${REPO}/frontend:${TAG}
docker pull ghcr.io/${REPO}/backend:${TAG}

echo -e "${BLUE}Setting image environment variables...${NC}"
export FRONTEND_IMAGE=ghcr.io/${REPO}/frontend:${TAG}
export BACKEND_IMAGE=ghcr.io/${REPO}/backend:${TAG}

echo -e "${BLUE}Deploying with docker compose...${NC}"
docker compose up -d --no-build

echo -e "${BLUE}Cleaning up old images...${NC}"
docker image prune -af --filter "until=72h"

echo -e "${GREEN}✓ Deployment complete!${NC}"
ENDSSH

echo -e "${GREEN}✓ Successfully deployed ${TAG} to server!${NC}"
