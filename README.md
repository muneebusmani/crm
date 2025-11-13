# CRM Monorepo

A modern, production-ready CRM system built with a **Turborepo monorepo** architecture, featuring automated CI/CD, Supabase integration, and multi-profile dealer management.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Features](#-features)
- [Architecture](#-architecture)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🛠 Tech Stack

### Core Technologies
- **Monorepo / Task Runner:** [Turborepo](https://turbo.build/) with optimized caching (96% faster builds!)
- **Package Manager:** [pnpm](https://pnpm.io/) with workspace support
- **Node Version Management:** `.nvmrc` for consistent environment
- **Code Quality:** [Biome.js](https://biomejs.dev/) for formatting and linting

### Backend
- **Framework:** [NestJS](https://nestjs.com/) with [Fastify](https://www.fastify.io/) HTTP adapter
- **Database:** PostgreSQL with TypeORM
- **Storage:** [Supabase Storage](https://supabase.com/storage) for file uploads
- **Authentication:** JWT-based with refresh tokens
- **Real-time:** WebSocket support for live updates

### Frontend
- **Framework:** [Next.js 14](https://nextjs.org/) with App Router
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [Material-UI](https://mui.com/)
- **State Management:** React Context + Server Actions
- **Forms:** React Hook Form with validation

### Infrastructure
- **Containerization:** [Docker](https://www.docker.com/) with multi-stage builds
- **CI/CD:** GitHub Actions with automated deployments
- **Container Registry:** GitHub Container Registry (GHCR)
- **Reverse Proxy:** Traefik for routing and SSL

---

## 🚀 Quick Start

### Prerequisites

- Node.js (version specified in `.nvmrc`)
- [pnpm](https://pnpm.io/) installed globally
- [Docker](https://www.docker.com/) (optional for containerized development)
- Git for version control

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/xytrixsolutions/crm.git
cd crm
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Use the correct Node.js version**

```bash
nvm use
```

4. **Setup environment files**

Backend environment (`.env.production`):
```env
# Database
DATABASE_HOST=your_db_host
DATABASE_PORT=5432
DATABASE_USERNAME=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=crm

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=7d

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

Frontend environment (`.env.production`):
```env
NEXT_PUBLIC_API_URL=https://api-crm.enginesmarket.co.uk
```

5. **Run the development servers**

```bash
pnpm dev
```

> Runs both frontend (port `3000`) and backend (port `3001`) concurrently.

---

## 📁 Project Structure

```
crm/
├── apps/
│   ├── backend/                    # NestJS backend application
│   │   ├── src/
│   │   │   ├── auth/              # Authentication module
│   │   │   ├── user/              # User management (dealers, admins)
│   │   │   ├── company-user/      # Multi-profile system
│   │   │   ├── leads/             # Lead management
│   │   │   ├── quotations/        # Quote generation
│   │   │   ├── invoices/          # Invoice management
│   │   │   ├── uploads/           # File upload handling
│   │   │   ├── common/            # Shared services & utilities
│   │   │   └── migrations/        # Database migrations
│   │   └── package.json
│   │
│   └── frontend/                   # Next.js frontend application
│       ├── src/
│       │   ├── app/               # Next.js 14 App Router
│       │   │   ├── (auth)/        # Auth pages
│       │   │   ├── (dealer)/      # Dealer portal
│       │   │   └── api/           # API routes
│       │   ├── components/        # Reusable UI components
│       │   ├── features/          # Feature-specific components
│       │   ├── services/          # API service layer
│       │   ├── actions/           # Server actions
│       │   └── lib/               # Utility functions
│       └── package.json
│
├── packages/
│   └── types/                      # Shared TypeScript types
│       ├── src/
│       │   ├── types/             # Type definitions
│       │   └── schemas/           # Validation schemas
│       └── package.json
│
├── supabase/
│   └── functions/                  # Supabase Edge Functions
│       └── receive-lead/          # Lead ingestion endpoint
│
├── .github/
│   └── workflows/
│       └── docker.yml             # CI/CD pipeline
│
├── docker-compose.yaml            # Docker orchestration
├── Dockerfile                     # Multi-stage build config
├── turbo.json                     # Turborepo configuration
├── pnpm-workspace.yaml            # pnpm workspace config
└── README.md                      # This file
```

---

## 💻 Development

### Running Services

**All services (recommended):**
```bash
pnpm dev
```

**Frontend only:**
```bash
pnpm --filter frontend dev
```

**Backend only:**
```bash
pnpm --filter backend dev
```

**Types (when changing schemas):**
```bash
pnpm --filter @crm/types run build
```

### Code Quality

**Lint all packages:**
```bash
pnpm lint
```

**Format code:**
```bash
pnpm format
```

**Type checking:**
```bash
pnpm typecheck
```

### Building for Production

**Build all packages:**
```bash
pnpm build
```

**Run production builds:**
```bash
pnpm start
```

### Database Migrations

**Generate migration:**
```bash
cd apps/backend
pnpm migration:generate -- src/migrations/MigrationName
```

**Run migrations:**
```bash
pnpm migration:run
```

**Revert migration:**
```bash
pnpm migration:revert
```

---

## 🚀 Deployment

### Automated Deployment (Recommended)

Simply push a git tag to trigger automated CI/CD:

```bash
# Create a new release tag
git tag v0.5.15
git push origin v0.5.15
```

**What happens automatically:**
1. ✅ GitHub Actions builds Docker images (3-5 min)
2. ✅ Images pushed to GitHub Container Registry
3. ✅ Server pulls pre-built images (30 sec)
4. ✅ Containers restart with new version
5. ✅ Old images cleaned up

**Build Performance:**
- First build: ~5.5 minutes
- Cached build (no changes): ~13 seconds (**96% faster!**)
- Partial changes: ~1-2 minutes

### Manual Deployment

**Using deployment script (Windows):**
```powershell
.\deploy.ps1 -Tag v0.5.15
```

**Using deployment script (Linux/Mac):**
```bash
chmod +x deploy.sh
./deploy.sh v0.5.15
```

### Docker Compose (Local)

```bash
docker compose up -d --build
```

### Rollback

```bash
# Deploy previous version
git push origin v0.5.14
# Or
.\deploy.ps1 -Tag v0.5.14
```

For detailed deployment instructions, see:
- 📖 [QUICK-DEPLOY.md](./QUICK-DEPLOY.md) - Quick reference
- 📖 [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete guide
- 📖 [SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md) - First-time setup
- 📖 [CI-CD-SUMMARY.md](./CI-CD-SUMMARY.md) - Architecture overview
- 📖 [TURBOREPO-CACHE-OPTIMIZATION.md](./TURBOREPO-CACHE-OPTIMIZATION.md) - Cache strategies

---

## ✨ Features

### Multi-Profile Dealer System
- Chrome-like profile selection for dealers
- Default profile auto-created on registration
- Quick profile switching without re-authentication
- Profile-specific permissions and contexts

📖 See: [FRONTEND-IMPLEMENTATION.md](./FRONTEND-IMPLEMENTATION.md), [LINKING-GUIDE.md](./LINKING-GUIDE.md)

### Supabase Storage Integration
- Direct browser → Supabase uploads (no backend bandwidth)
- Signed upload URLs (60-second expiry)
- Signed view URLs with caching (15-minute TTL)
- Private bucket with Row-Level Security (RLS)
- Support for JPEG, PNG, WebP (5MB limit)

📖 See: [SUPABASE-STORAGE-SETUP.md](./SUPABASE-STORAGE-SETUP.md), [SUPABASE-IMPLEMENTATION.md](./SUPABASE-IMPLEMENTATION.md), [TESTING-GUIDE.md](./TESTING-GUIDE.md)

### Lead Reception Edge Function
- Highly available lead ingestion (99.9% uptime)
- Direct database insertion (no backend dependency)
- Compatible with existing PHP integration (enginefinders.co.uk)
- No PHP changes required

📖 See: [LEAD-RECEPTION-SOLUTION.md](./LEAD-RECEPTION-SOLUTION.md), [EDGE-FUNCTION-DEPLOY.md](./EDGE-FUNCTION-DEPLOY.md)

### Automated CI/CD Pipeline
- GitHub Actions workflow
- Pre-built Docker images (faster deployments)
- Dual caching strategy (Registry + GitHub Actions)
- Automatic cleanup of old images
- SSH-based deployment

📖 See: [CI-CD-SUMMARY.md](./CI-CD-SUMMARY.md)

### Core Business Features
- Lead management with real-time updates
- Quotation generation with PDF export
- Invoice creation and tracking
- Dealer tier and credit system
- Activity logging and analytics
- Email notifications (SMTP)
- Bank details management
- User authentication and authorization

---

## 🏗 Architecture

### Upload Flow (Supabase Storage)

```
┌─────────────┐     1. Request    ┌─────────────┐
│   Browser   │ ─────────────────> │   Backend   │
│             │    signed URL      │   (NestJS)  │
└─────────────┘                    └─────────────┘
       │                                    │
       │                           2. Generate
       │                              signed URL
       │                                    │
       │         3. Signed URL              │
       │ <──────────────────────────────────┘
       │
       │         4. Upload file directly
       v
┌─────────────┐
│  Supabase   │
│   Storage   │
└─────────────┘
       │
       │         5. Update DB path
       v
┌─────────────┐
│  Database   │
└─────────────┘
```

### Deployment Architecture

```
┌─────────────────────────────────────────┐
│ Developer                               │
│ git tag v1.0.0                         │
│ git push origin v1.0.0                 │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ GitHub Actions                          │
│ - Build frontend image (parallel)       │
│ - Build backend image (parallel)        │
│ - Push to GHCR                          │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Production Server                       │
│ - Pull pre-built images                 │
│ - docker compose up --no-build          │
│ - Cleanup old images                    │
└─────────────────────────────────────────┘
```

### Multi-Profile System Flow

```
┌─────────────┐
│ Dealer Login│
└──────┬──────┘
       │
       ▼
┌─────────────┐     No Profile     ┌──────────────┐
│ Middleware  │ ───────────────────>│ Select       │
│   Check     │                     │ Profile Page │
└──────┬──────┘                     └──────┬───────┘
       │                                   │
       │ Profile Selected                  │ User Selects
       │                                   │ Profile
       ▼                                   ▼
┌─────────────┐                     ┌──────────────┐
│   Dealer    │<────────────────────│ Profile      │
│  Dashboard  │   Set Cookie        │ Selected     │
└─────────────┘                     └──────────────┘
```

---

## 🧪 Testing

### Backend Testing

```bash
cd apps/backend
pnpm test           # Unit tests
pnpm test:e2e       # End-to-end tests
pnpm test:cov       # Coverage report
```

### Frontend Testing

```bash
cd apps/frontend
pnpm test           # Jest tests
pnpm test:e2e       # Playwright E2E tests
```

### Manual Testing

Refer to testing guides:
- 📖 [TESTING-GUIDE.md](./TESTING-GUIDE.md) - Supabase Storage testing
- 📖 [DEBUGGING-GUIDE.md](./DEBUGGING-GUIDE.md) - Company user debugging

### Testing Endpoints

**Lead ingestion Edge Function:**
```bash
curl -X POST https://ceurdvhocykwltpxgktp.supabase.co/functions/v1/receive-lead \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"1234567890"}'
```

**Signed upload URL:**
```bash
curl -X POST http://localhost:3001/api/v1/uploads/dealer-avatar-signed-url \
  -H "Cookie: access_token=YOUR_TOKEN" \
  -d '{"fileName":"avatar.jpg","contentType":"image/jpeg"}'
```

---

## 🐛 Troubleshooting

### Common Issues

**Build fails in CI/CD:**
- Check GitHub Actions logs
- Verify Docker Buildx is enabled
- Check GHCR permissions

**Images not displaying:**
- Verify Supabase signed URLs are generated
- Check Next.js remote image configuration
- Verify bucket and RLS policies

**Profile not created:**
- Check migration status
- Verify CompanyUserModule is imported
- Check backend logs for errors

**Deployment fails:**
- Verify SSH key in GitHub secrets
- Check server has Docker and Git
- Verify GHCR login on server

### Debug Commands

**View Docker logs:**
```bash
docker compose logs -f
```

**Check database migrations:**
```bash
cd apps/backend
pnpm migration:show
```

**View Supabase function logs:**
```bash
supabase functions logs receive-lead --follow
```

**Check Turborepo cache:**
```bash
pnpm turbo run build --dry-run
```

For detailed troubleshooting:
- 📖 [DEBUGGING-GUIDE.md](./DEBUGGING-GUIDE.md)
- 📖 [DEPLOYMENT.md#troubleshooting](./DEPLOYMENT.md#troubleshooting)

---

## 🤝 Contributing

1. **Pull the latest changes**
   ```bash
   git pull origin main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Run development servers**
   ```bash
   pnpm dev
   ```

5. **Follow code quality standards**
   - Use Biome.js formatting
   - Write TypeScript types
   - Add tests for new features
   - Update documentation

6. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

7. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring
- `test:` - Test updates

---

## 📚 Documentation

### Setup & Configuration
- [SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md) - First-time setup guide
- [SUPABASE-STORAGE-SETUP.md](./SUPABASE-STORAGE-SETUP.md) - Storage configuration
- [EDGE-FUNCTION-DEPLOY.md](./EDGE-FUNCTION-DEPLOY.md) - Edge function deployment

### Implementation Guides
- [FRONTEND-IMPLEMENTATION.md](./FRONTEND-IMPLEMENTATION.md) - Frontend features
- [SUPABASE-IMPLEMENTATION.md](./SUPABASE-IMPLEMENTATION.md) - Supabase integration
- [LINKING-GUIDE.md](./LINKING-GUIDE.md) - Module integration
- [IMPLEMENTATION-REVIEW.md](./IMPLEMENTATION-REVIEW.md) - Architecture review

### Operations
- [QUICK-DEPLOY.md](./QUICK-DEPLOY.md) - Quick deployment reference
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [CI-CD-SUMMARY.md](./CI-CD-SUMMARY.md) - CI/CD architecture

### Optimization & Testing
- [TURBOREPO-CACHE-OPTIMIZATION.md](./TURBOREPO-CACHE-OPTIMIZATION.md) - Build optimization
- [TESTING-GUIDE.md](./TESTING-GUIDE.md) - Testing procedures
- [DEBUGGING-GUIDE.md](./DEBUGGING-GUIDE.md) - Debugging workflows

### Solutions
- [LEAD-RECEPTION-SOLUTION.md](./LEAD-RECEPTION-SOLUTION.md) - Lead ingestion setup

---

## 📞 Support

- **Issues:** Open a GitHub issue
- **Documentation:** Check the docs folder
- **Email:** support@enginesmarket.co.uk

---

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ by [Xytrix Solutions](https://github.com/xytrixsolutions)**
