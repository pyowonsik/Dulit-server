# 1. Node.js 이미지를 기반으로 시작
FROM node:18 AS build

# 2. 작업 디렉토리 설정
WORKDIR /usr/src/app

# 3. pnpm 설치
RUN npm install -g pnpm

# 4. 의존성 파일 복사
COPY package*.json ./

# 5. pnpm으로 의존성 설치
RUN pnpm install

# 6. 소스 코드 복사
COPY . .

# 7. 애플리케이션 빌드
RUN pnpm run build

# 8. 프로덕션 이미지를 위한 새로운 레이어 생성
FROM node:18 AS production

WORKDIR /usr/src/app

# 9. pnpm 설치
RUN npm install -g pnpm

# 10. 의존성 파일 복사
COPY package*.json ./

# 11. 프로덕션 의존성만 설치
RUN pnpm install --prod

# 12. 빌드된 코드 복사
COPY --from=build /usr/src/app/dist ./dist

# 13. 환경 변수 파일 복사
COPY .env .env

# 14. 애플리케이션 포트 노출
EXPOSE 3000

# 15. 앱 실행 명령어
CMD ["node", "dist/main.js"]
