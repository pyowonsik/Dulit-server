# ---- Base Image 설정 ----
FROM node:18-alpine AS base

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# ---- Development 환경 ----
FROM base AS development

COPY . .

CMD ["pnpm", "start:dev"]

# ---- Production 환경 ----
FROM base AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY . .

RUN pnpm build

CMD ["node", "dist/main.js"]
