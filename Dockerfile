# Tiny Inventory: server + web. Single container.
FROM node:20-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/
COPY web/package.json ./web/
RUN pnpm install --frozen-lockfile

COPY server ./server
COPY web ./web

# Build web
RUN pnpm --filter web build
RUN cp -r web/dist server/public

# Build server
RUN pnpm --filter server exec prisma generate
RUN pnpm --filter server build

WORKDIR /app/server
ENV NODE_ENV=production
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/index.js"]
