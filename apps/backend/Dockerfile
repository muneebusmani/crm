FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY .env ./

# Copy manifests
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY apps/backend/package.json apps/backend/
COPY packages/types/package.json packages/types/

# Install only needed deps
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build backend
RUN pnpm --filter backend... run build

# --- runtime stage ---
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

EXPOSE 3001
CMD ["node", "dist/main.js"]
