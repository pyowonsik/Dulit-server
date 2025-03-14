FROM node:18 AS development

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package*.json ./
RUN pnpm install

COPY . .
RUN pnpm run build

FROM node:18 AS production

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main.js"]
