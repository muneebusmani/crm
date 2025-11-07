#
# # --- builder ---
# FROM node:22-alpine AS builder
# WORKDIR /app
#
# RUN corepack enable && corepack prepare pnpm@latest --activate
#
# # Copy workspace manifests
# COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
# COPY apps/frontend/package.json apps/frontend/
# COPY apps/backend/package.json apps/backend/
# COPY packages/types/package.json packages/types/
#
# COPY apps/frontend/.env apps/frontend/.env
#
# RUN pnpm install --frozen-lockfile
#
# # Copy full source
# COPY . .
#
# # Build both workspaces
# # RUN pnpm --filter frontend... run build
# # RUN pnpm --filter backend... run build
# RUN pnpm build
#
# # --- frontend runtime ---
# FROM node:22-alpine AS frontend-runtime
# WORKDIR /app
# ENV NODE_ENV=production
#
# COPY --from=builder /app/apps/frontend/.next/standalone ./
# COPY --from=builder /app/apps/frontend/public ./public
# COPY --from=builder /app/.next/static ./.next/static
#
# EXPOSE 3000
# CMD ["node", "server.js"]
#
# # --- backend runtime ---
# FROM node:22-alpine AS backend-runtime
# WORKDIR /app
# ENV NODE_ENV=production
#
# COPY --from=builder /app/apps/backend/dist ./dist
# COPY --from=builder /app/apps/backend/package.json ./
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/packages ./packages
#
# EXPOSE 3001
# CMD ["node", "dist/main.js"]
# --- builder stage (shared) ---
# FROM node:22-alpine AS builder
# WORKDIR /app
#
# RUN corepack enable && corepack prepare pnpm@latest --activate
#
# COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
# COPY apps/frontend/package.json apps/frontend/
# COPY apps/backend/package.json apps/backend/
# COPY packages/types/package.json packages/types/
#
# COPY . .
#
# # Frontend build needs its .env
# RUN cp apps/frontend/.env apps/frontend/.env || true
# RUN pnpm install --frozen-lockfile
# RUN pnpm run build-server
# # RUN pnpm --filter frontend... run build
# # RUN pnpm --filter backend... run build
#
# # --- frontend runtime ---
# FROM node:22-alpine AS frontend-runtime
# WORKDIR /app
# ENV NODE_ENV=production
#
# COPY --from=builder /app/apps/frontend/.next/standalone ./
# COPY --from=builder /app/apps/frontend/public ./public
# COPY --from=builder /app/apps/frontend/.next/static ./.next/static
#
# EXPOSE 3000
# CMD ["node", "server.js"]
#
# # --- backend runtime ---
# FROM node:22-alpine AS backend-runtime
# WORKDIR /app
# ENV NODE_ENV=production
#
# COPY --from=builder /app/apps/backend/dist ./dist
# COPY --from=builder /app/apps/backend/package.json ./
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/packages ./packages
#
# # Backend env is mounted via docker-compose
# # COPY apps/backend/.env .env   <- optional if you prefer runtime mount
#
# EXPOSE 3001
# CMD ["node", "dist/main.js"]
#
FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# --- Copy manifests first for caching ---
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* turbo.json ./
COPY apps/frontend/package.json apps/frontend/
COPY apps/backend/package.json apps/backend/
COPY packages/types/package.json packages/types/

# --- Install dependencies with cache mount ---
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --frozen-lockfile --ignore-scripts

# --- Copy the rest of the source ---
COPY . .

# Frontend build needs its .env
RUN cp apps/frontend/.env.production apps/frontend/.env.production || true

# Run Turbo build with cache mount for Turborepo
RUN --mount=type=cache,target=/app/.turbo \
  pnpm run build-server

# --- frontend runtime ---
FROM node:22-alpine AS frontend-runtime
WORKDIR /app

ENV NODE_ENV=production

# Copy the entire standalone build
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

# Change to frontend app directory
WORKDIR /app/apps/frontend

EXPOSE 3000
CMD ["node", "server.js"]


# --- backend runtime ---
FROM node:22-alpine AS backend-runtime
WORKDIR /app
ENV NODE_ENV=production

# Install Chromium and dependencies required by Puppeteer
# RUN apk add --no-cache \
#     chromium \
#     nss \
#     freetype \
#     harfbuzz \
#     ca-certificates \
#     ttf-freefont \
#     font-noto-emoji

RUN apk add chromium

# Tell Puppeteer to use the system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

EXPOSE 3001
CMD ["npm", "run", "start:prod"]

