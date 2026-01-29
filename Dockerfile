# Build stage
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json server/
COPY web/package.json web/

RUN pnpm install --frozen-lockfile

COPY server server
COPY web web

# Build web app (Vite)
RUN pnpm --filter web build

# Serve built frontend from server/public
RUN cp -r web/dist server/public

# Generate Prisma client and build server
RUN pnpm --filter server db:generate
RUN pnpm --filter server build

# Production stage
FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

ENV PORT=4000

# Copy workspace files and install deps (include devDeps for prisma CLI; NODE_ENV set after)
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/server/package.json /app/server/package.json
COPY --from=builder /app/web/package.json /app/web/package.json

RUN pnpm install --frozen-lockfile

# Copy built server and Prisma
COPY --from=builder /app/server/dist /app/server/dist
COPY --from=builder /app/server/public /app/server/public
COPY --from=builder /app/server/prisma /app/server/prisma

WORKDIR /app/server

RUN pnpm exec prisma generate

ENV NODE_ENV=production

EXPOSE 4000

# Run migrations, seed, then start the server
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm exec prisma db seed && node dist/index.js"]
