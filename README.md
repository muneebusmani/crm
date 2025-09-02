Here’s a fully rewritten `README.md` for your CRM project, combining your tech stack, setup instructions, post-setup workflow, and developer guidance:

# CRM

A modern CRM project using a monorepo setup with separate frontend and backend packages.

---

## Tech Stack

This project uses the following technologies and tools:

- **Package Manager:** [pnpm](https://pnpm.io/)
- **Node Version Management:** `.nvmrc` for specifying Node.js version
- **Code Quality:** [Biome.js](https://biomejs.dev/) (replacing Prettier + ESLint)
- **Containerization:** [Docker](https://www.docker.com/)
- **Backend:** [NestJS](https://nestjs.com/) with [Fastify](https://www.fastify.io/) as the HTTP adapter
- **Frontend:** [Next.js](https://nextjs.org/) with [Tailwind CSS](https://tailwindcss.com/)

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version specified in `.nvmrc`)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) (optional, for containerized setup)

### Setup

1. **Install dependencies**

```bash
pnpm install
```

2. **Use the correct Node.js version**

```bash
nvm use
```

---

## Running the Project

This is a **monorepo** with `frontend` and `backend` packages. You can run them independently using `pnpm` scripts.

### Frontend (Next.js + Tailwind)

Start development:

```bash
pnpm dev:frontend
```

Build for production:

```bash
pnpm build:frontend
```

Run the production build:

```bash
pnpm start:frontend
```

> Default port: `3000`

---

### Backend (NestJS + Fastify)

Start development:

```bash
pnpm dev:backend
```

Build for production:

```bash
pnpm build:backend
```

Run the production build:

```bash
pnpm start:backend
```

> Default port: `3001`. Change in `backend/.env` or `main.ts` if needed.

---

## Code Quality

This project uses **Biome.js** for formatting and linting.

Check for issues:

```bash
pnpm --filter backend biome check
pnpm --filter frontend biome check
```

Automatically fix issues:

```bash
pnpm --filter backend biome fix
pnpm --filter frontend biome fix
```

---

## Docker (Optional)

Run both frontend and backend in Docker:

```bash
docker-compose up --build
```

> Make sure ports `3000` (frontend) and `3001` (backend) are free.

---

## Project Structure Overview

```
crm
├── backend        # NestJS backend
│   ├── src        # Modules, controllers, services
│   └── ...
├── frontend       # Next.js frontend
│   ├── src        # Pages, components, styles
│   └── ...
├── package.json   # Workspace-level scripts
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md
```

---

## Contributing

1. Pull the latest changes.
2. Install dependencies: `pnpm install`
3. Run frontend and backend in development mode.
4. Follow **Biome.js** rules for code style.
5. Open pull requests when ready.
