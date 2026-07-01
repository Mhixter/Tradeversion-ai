FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY . .

RUN pnpm install --no-frozen-lockfile
RUN pnpm run railway:build

EXPOSE 8081
CMD ["pnpm", "run", "railway:start"]
