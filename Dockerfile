FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY . .

RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @workspace/tradevision build

EXPOSE 3000
CMD ["pnpm", "--filter", "@workspace/tradevision", "dev"]
