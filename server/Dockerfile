FROM node:22-alpine AS base
RUN npm install -g pnpm@10.33.3
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc .pnpmfile.cjs ./
COPY server/package.json ./server/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile --filter server --filter @contentiq/shared

FROM base AS build
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc .pnpmfile.cjs ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY packages/shared ./packages/shared
COPY server ./server
RUN pnpm --filter @contentiq/shared build
RUN pnpm --filter server build
RUN pnpm --filter server deploy --prod /app/deploy

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/deploy/node_modules ./node_modules
COPY --from=build /app/deploy/package.json ./package.json
COPY --from=build /app/server/dist ./dist
EXPOSE 5001
CMD ["node", "dist/index.js"]
