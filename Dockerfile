# prod stage
FROM node:18-alpine

WORKDIR /usr/src/app

# 빌드된 결과물만 복사
COPY --from=build /usr/src/app/dist ./dist
COPY package*.json ./

RUN pnpm install --prod

EXPOSE 3000

CMD ["node", "dist/main.js"]