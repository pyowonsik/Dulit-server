# 1. Node.js 이미지를 기반으로 빌드 단계 구성
FROM node:18 AS build

# 2. 작업 디렉토리 설정
WORKDIR /usr/src/app

# 3. pnpm 설치
RUN npm install -g pnpm

# 4. 의존성 파일 복사 및 설치
COPY package*.json ./
RUN pnpm install

# 5. 소스 코드 복사 및 애플리케이션 빌드
COPY . .
RUN pnpm run build

# 6. 프로덕션 이미지를 위한 새로운 레이어 생성
FROM node:18 AS production

# 7. 작업 디렉토리 설정
WORKDIR /usr/src/app

# 8. pnpm 설치
RUN npm install -g pnpm

# 9. 의존성 파일 복사 및 프로덕션 의존성만 설치
COPY package*.json ./
RUN pnpm install --prod

# 10. 빌드 결과물 복사
COPY --from=build /usr/src/app/dist ./dist

# 11. 포트 노출
EXPOSE 3000

# 12. 앱 실행 명령
CMD ["node", "dist/main.js"]
