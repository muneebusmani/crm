---
name: 🚀 Deployment Checklist
about: Track a production deployment
title: 'Deploy v[VERSION] to Production'
labels: deployment
assignees: ''

---

## Deployment Info

- **Version:** v0.0.0
- **Date:** YYYY-MM-DD
- **Deployer:** @username

## Pre-Deployment Checklist

- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] Database migrations reviewed (if any)
- [ ] Environment variables updated on server (if needed)
- [ ] Backup created (if needed)

## Deployment Steps

- [ ] Tag created and pushed: `git tag vX.Y.Z && git push origin vX.Y.Z`
- [ ] GitHub Actions build successful
- [ ] Images pushed to GHCR
- [ ] Deployment to server completed
- [ ] Health check passed

## Post-Deployment Verification

- [ ] Frontend accessible at https://crm.enginesmarket.co.uk
- [ ] Backend API accessible at https://api-crm.enginesmarket.co.uk
- [ ] Login working
- [ ] Critical features tested
- [ ] No errors in logs

## Rollback Plan (if needed)

If issues occur, rollback to previous version:
```bash
git push origin v[PREVIOUS_VERSION]
# or
./deploy.ps1 -Tag v[PREVIOUS_VERSION]
```

## Notes

<!-- Add any deployment notes, issues encountered, or special instructions -->
