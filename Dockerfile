FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY . .

RUN pnpm install --no-frozen-lockfile

# Build frontend static files
RUN pnpm --filter @workspace/tradevision build

# Build API server bundle
RUN pnpm --filter @workspace/api-server build

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "--enable-source-maps", "./artifacts/api-server/dist/index.mjs"]
