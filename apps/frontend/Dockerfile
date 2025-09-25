FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy Environment
COPY .env ./

# COPY package*.json ./

# Copy lockfiles and manifest
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Install deps
RUN pnpm install --frozen-lockfile

# Copy rest of the source
COPY . .

# Build
RUN pnpm run build

# --- runtime stage ---
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy Next standalone server
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/standalone/.env ./
# Copy static assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]

