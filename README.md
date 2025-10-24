# 둘잇 (Dulit) Backend Server

[![GitHub Branch](https://img.shields.io/badge/branch-main-blue)](https://github.com/pyowonsik/Dulit-server)
[![Swagger](https://img.shields.io/badge/swagger-API_문서-85EA2D?logo=swagger&logoColor=white)](https://pyowonsik.site/doc)

## 목차

- [개요](#개요)
- [시스템 구성도](#시스템-구성도)
- [ERD](#erd)
- [기술 스택](#기술-스택)
- [주요 기능 & 구현 내용](#주요-기능--구현-내용)
- [리뷰](#리뷰)
- [트러블슈팅 & 피드백](#트러블슈팅--피드백)
- [느낀 점](#느낀-점)
- [API 문서](#api-문서)
- [배포](#배포)

## 개요

**둘잇(Dulit)** 은 두 사람을 하나로 이어주는 커플 전용 애플리케이션의 백엔드 서버입니다.

실시간 커플 채팅을 기본 기능으로 하여 소통을 제공하며, 기념일과 약속 등록 기능을 통해 중요한 순간들을 관리합니다. 실시간 위치 공유와 데이트 기록을 통해 더 가까운 관계를 유지할 수 있게 돕고, 달력을 활용하여 데이트 일정을 기록하며, 나만의 데이트 코스를 커뮤니티에 공유하여 다른 커플들과 아이디어를 나눌 수 있습니다.

'둘잇'은 커플들의 소통과 추억을 더 특별하고 의미 있게 만들어주는 서비스의 핵심 백엔드 시스템입니다.

### 프로젝트 정보

- **개발 기간**: 2024.12 ~ 2025.03
- **아키텍처**: 모놀리식 (Monolithic)
- **배포 환경**: AWS EC2 + Docker + Jenkins CI/CD
- **도메인**: [https://pyowonsik.site](https://pyowonsik.site)

## 시스템 구성도

![시스템 구성도](./readme_source/architecture.png)

## ERD

![ERD](./readme_source/erd.png)

## 기술 스택

### Backend Framework & Language

<img src="https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=NestJS&logoColor=white"> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=TypeScript&logoColor=white"> <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=Node.js&logoColor=white">

### Database & ORM

<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=PostgreSQL&logoColor=white"> <img src="https://img.shields.io/badge/TypeORM-FE0803?style=flat-square&logo=TypeORM&logoColor=white"> <img src="https://img.shields.io/badge/QueryBuilder-2596BE?style=flat-square&logoColor=white">

### Auth & Security

<img src="https://img.shields.io/badge/OAuth2-EB5424?style=flat-square&logo=Auth0&logoColor=white"> <img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=JSON Web Tokens&logoColor=white"> <img src="https://img.shields.io/badge/Passport-34E27A?style=flat-square&logo=Passport&logoColor=white">

### Testing & Logging

<img src="https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=Jest&logoColor=white"> <img src="https://img.shields.io/badge/Winston-231F20?style=flat-square&logo=winston&logoColor=white">

### 3rd Party & Real-time

<img src="https://img.shields.io/badge/Kakao_API-FFCD00?style=flat-square&logo=Kakao&logoColor=black"> <img src="https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=Socket.io&logoColor=white">

### Storage & Cloud

<img src="https://img.shields.io/badge/AWS_S3-569A31?style=flat-square&logo=Amazon S3&logoColor=white"> <img src="https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=Amazon AWS&logoColor=white">

### DevOps & CI/CD

<img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=Docker&logoColor=white"> <img src="https://img.shields.io/badge/Docker_Compose-2496ED?style=flat-square&logo=Docker&logoColor=white"> <img src="https://img.shields.io/badge/Jenkins-D24939?style=flat-square&logo=Jenkins&logoColor=white"> <img src="https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=NGINX&logoColor=white">

### Development Tools

<img src="https://img.shields.io/badge/WebStorm-000000?style=flat-square&logo=WebStorm&logoColor=white"> <img src="https://img.shields.io/badge/Postman-FF6C37?style=flat-square&logo=Postman&logoColor=white"> <img src="https://img.shields.io/badge/Swagger-85EA2D?style=flat-square&logo=Swagger&logoColor=black">

## 주요 기능 & 구현 내용

### 🔐 인증 & 사용자 관리

#### 카카오 소셜 로그인 (OAuth2)

- **OAuth2 인증 흐름**: 인가 코드 → Access Token → 사용자 정보 조회
- **JWT 토큰 발급**: AccessToken(30분), RefreshToken(7일)
- **토큰 갱신 로직**: AccessToken 만료 시 RefreshToken을 이용한 자동 재발급
- **Guard 패턴**: NestJS Guard를 활용한 라우트 레벨 인증/인가
- **신규 사용자 처리**: 최초 로그인 시 자동 회원가입

#### 프로필 관리

- 닉네임, 프로필 이미지 수정
- **AWS S3 파일 업로드**: Multer + AWS SDK를 활용한 파일 스트리밍 업로드
- 파일 타입 검증 및 용량 제한 (10MB)
- Sharp를 이용한 이미지 리사이징

### 💑 커플 매칭 시스템

- **초대 코드 생성**: 고유한 매칭 코드 발급
- **초대 코드 공유**: 상대방이 코드 입력하여 커플 연결
- **실시간 매칭 알림**: Socket.IO를 통한 즉시 알림
- **커플 정보 관리**: 커플 프로필, 사귄 날짜, D-Day 계산

### 💬 실시간 채팅 시스템

#### Socket.IO 기반 1:1 채팅

- WebSocket 연결 관리 및 실시간 메시지 송수신
- 읽음 표시 처리
- **메시지 영구 저장**: PostgreSQL에 채팅 기록 저장
- **페이지네이션**: Cursor 기반으로 이전 메시지 조회
- 미디어 파일 전송 지원 (이미지, 동영상)

### 📅 기념일 & 약속 관리

#### 기념일 시스템

- 기념일 제목, 날짜 등록/수정/삭제
- **D-Day 자동 계산**: 남은 일수 실시간 표시
- 날짜순 정렬 및 목록 조회

#### 약속 관리

- 약속 제목, 장소, 시간 등록
- 약속 목록 조회 (시간순 정렬)
- 약속 수정/삭제

#### 약속 알림 (Cron 스케줄러)

- **약속 2시간 전 자동 알림**: `@nestjs/schedule`을 이용한 스케줄링
- Socket.IO로 실시간 알림 전송
- 알림 이력 저장

### 📆 캘린더 & 데이트 기록

- 날짜별 일정 등록 (제목, 내용, 이미지 첨부)
- 월별 일정 조회
- 데이트 일정 관리 및 기록

### 📝 커뮤니티 (게시글)

#### 데이트 코스 공유 시스템

- 게시글 작성/수정/삭제 (제목, 내용, 이미지)
- **Cursor 기반 무한 스크롤**: 페이지네이션 로직 일원화
- **Page 기반 페이지네이션**: 페이지 번호 네비게이션 지원
- 게시글 검색 (제목/내용)
- DTO와 공통 클래스를 통한 재사용성 향상

#### 댓글 시스템

- 댓글 작성/삭제
- 댓글 개수 표시

### 🔔 실시간 알림 시스템

- 커플 매칭 완료 알림
- 약속 2시간 전 알림
- 댓글 작성 알림
- Socket.IO Gateway를 통한 실시간 푸시

### ✅ 테스트 (Jest)

- **단위 테스트**: 주요 비즈니스 로직 테스트 커버리지 100%
- **Mock 객체**: 의존성 격리 및 일관성 유지
- 인증, 파일 업로드, 실시간 채팅 등 복잡한 기능 테스트

### 🚀 배포 & 인프라

#### AWS EC2 서버 배포

- **Docker 기반 배포**: 애플리케이션, PostgreSQL, Jenkins 컨테이너화
- **Jenkins CI/CD 파이프라인**: GitHub Webhook 연동으로 코드 변경 시 자동 빌드 및 배포

#### HTTP → HTTPS 마이그레이션

- **도메인 연결**: `pyowonsik.site` 구매 및 DNS 설정
- **SSL 인증서 발급**: Let's Encrypt를 통한 무료 SSL 인증서
- **Nginx 리버스 프록시**:
  - HTTPS 종료점 역할
  - HTTP → HTTPS 강제 리다이렉트
  - `/jenkins/` 서브패스 프록시 설정
- **보안 강화**:
  - 내부 서비스 포트 차단 (expose 사용)
  - AWS 보안 그룹에서 HTTPS(443)만 허용
- **SSL 자동 갱신**: Cron + Certbot 통합으로 무중단 인증서 갱신

## 리뷰

### A. Full Stack 경험

이번 프로젝트는 백엔드 개발자로서의 경험을 쌓는 데 중요한 기회를 제공했습니다. 특히 배포 및 운영 관련 경험을 통해 많은 것을 배울 수 있었습니다.

그동안 주로 Flutter를 사용하여 프론트엔드 작업에 집중했지만, 인턴 경험을 통해 풀스택 개발을 했던 기억이 있어 이번 프로젝트에서 백엔드 개발을 맡을 수 있었습니다. 인턴 당시에는 Express로 백엔드를 개발해본 경험이 있었고, 작년 초에는 토이 프로젝트를 진행하며 백엔드 개발 스터디를 잠깐 했던 경험도 있었습니다. 이를 바탕으로 이번 프로젝트에서는 **NestJS**를 선택하게 되었습니다.

프론트엔드 개발에 익숙한 상태였지만, 백엔드 개발은 제대로 해본 적이 없었고, 특히 배포 관련 경험이 전무했기 때문에 처음에는 상당히 어려웠습니다. 실제로 만든 서버를 AWS EC2, Docker, Jenkins를 사용하여 실시간으로 무중단 배포를 진행하면서 많은 시행착오를 겪었고, 그 과정에서 많은 시간을 투자해야 했습니다. 그러나 이러한 경험은 개발자로서 한층 성장할 수 있는 계기가 되었습니다.

풀스택 개발의 큰 장점 중 하나는, 필요할 때 프론트엔드와 백엔드 작업을 유연하게 전환할 수 있다는 점이었습니다. 프론트와 백엔드 간의 흐름을 자연스럽게 이해하면서 문제 해결 능력을 키우는 데 많은 도움이 되었습니다.

### B. Test Code

TDD로 개발을 진행하지는 못했지만, 프로젝트 후반부부터 **Jest**를 기반으로 테스트 코드를 작성해 보았습니다.

단위 테스트를 진행하면서 코드의 신뢰성을 높이고, Mock 객체를 통해 의존성을 대체하여 일관성을 유지할 수 있었습니다. 다양한 케이스를 고려하여 예상치 못한 문제를 대비하는 과정에서 테스트 코드의 역할과 중요성에 대해 느낄 수 있었습니다.

특히 인증 관련 로직, 파일 업로드, 실시간 채팅 등 복잡한 기능에 대한 테스트를 작성하면서, 리팩토링 시에도 기존 기능이 정상 동작함을 보장할 수 있었습니다.

### C. Jenkins CI/CD 배포 자동화

NestJS 서버를 Jenkins로 CI/CD 배포하기 위해 Docker 및 Docker Compose를 활용하여 환경을 구축했습니다.

처음에는 NestJS와 관련된 자료가 많지 않아 시행착오를 겪었고, 특히 Jenkins에서 Docker 명령어 실행 문제와 환경 변수 관리에 어려움을 겪었지만, **Docker-in-Docker(dind)** 방식 적용과 Jenkins 환경 변수 플러그인을 활용하여 이를 해결했습니다.

**GitHub Webhook**을 연동하여 코드 푸시 시 자동으로 빌드 및 배포가 이루어지도록 설정했으며, Docker Compose를 활용해 NestJS 서버, PostgreSQL, Jenkins를 하나의 구성으로 관리할 수 있도록 했습니다.

결국, 자동화된 CI/CD 환경을 성공적으로 구축함으로써 코드 푸시만으로 배포까지 원활하게 이루어지는 개발 흐름을 만들었으며, 이를 통해 배포 자동화의 중요성과 실무 적용 가능성을 깊이 이해하는 계기가 되었습니다.

### D. HTTPS 마이그레이션 적용기

이번 프로젝트에서 가장 도전적인 경험 중 하나는 **HTTP에서 HTTPS로의 완전한 마이그레이션**이었습니다. 단순히 SSL 인증서만 적용하는 것이 아니라, nginx 리버스 프록시와 보안 강화까지 함께 고려한 인프라 개편 작업이었습니다.

처음에는 "도메인 사고 SSL 인증서만 발급하면 되겠지"라고 생각했지만, 실제로는 훨씬 복잡했습니다.

**가장 큰 어려움은 Jenkins 프록시 경로 매칭 문제**였습니다. nginx에서 `/jenkins/`로 설정했는데 계속 404 에러가 발생했고, 결국 `proxy_pass` 경로와 Jenkins의 `--prefix` 옵션을 정확히 매칭시켜야 한다는 것을 깨달았습니다.

**SSL 인증서 자동 갱신**도 까다로웠습니다. Let's Encrypt 인증서가 90일마다 만료되기 때문에 certbot과 cron을 활용한 자동화 스크립트를 작성해야 했고, nginx 컨테이너를 중단했다가 재시작하는 로직까지 구현했습니다.

보안 측면에서는 모든 내부 서비스를 `expose`만 사용하도록 변경하고, AWS 보안 그룹에서 HTTPS 포트만 허용하도록 재구성했습니다.

가장 뿌듯했던 순간은 `https://pyowonsik.site`로 접속했을 때 모든 것이 완벽하게 작동하는 것을 확인했을 때였습니다. 이번 경험을 통해 실제 운영 환경의 복잡성과 DevOps의 중요성을 체험할 수 있었고, 앞으로는 처음부터 보안과 운영을 염두에 두고 설계하는 습관을 가지게 되었습니다.

## 트러블슈팅 & 피드백

### A. 트러블슈팅

#### 1. 실시간 커플 매칭 & 연결 처리

**문제**: 두 명의 사용자가 실시간으로 커플로 연결되는 로직을 어떻게 설계할지 고민이었습니다.

**고민 사항**:

- 한 명이 초대 코드를 생성하면, 상대방이 그 코드로 연결하는 방식
- 매칭 성공 시 즉시 양쪽에 알림을 보내야 함
- 이미 커플인 사용자는 다시 매칭할 수 없어야 함
- 잘못된 초대 코드 입력 처리

**해결 과정**:

```typescript
// 1단계: 초대 코드 생성 (UUID 기반)
const inviteCode = uuid();
// 사용자 A가 초대 코드 생성 → Redis에 임시 저장 (TTL: 24시간)

// 2단계: 상대방이 초대 코드 입력
// 사용자 B가 코드 입력 → Redis에서 검증 → Couple 생성

// 3단계: Socket.IO로 실시간 알림
socket.to(userA.socketId).emit('coupleMatched', coupleData);
socket.to(userB.socketId).emit('coupleMatched', coupleData);
```

**배운 점**:

- Redis를 활용한 임시 데이터 저장 및 TTL 관리
- Socket.IO의 Room 개념으로 특정 사용자에게만 메시지 전송
- 트랜잭션 처리로 커플 생성 시 데이터 일관성 보장

#### 2. GitHub Actions → Jenkins 파이프라인 마이그레이션

**문제**: 이전 프로젝트에서는 GitHub Actions를 사용해서 비교적 간편했는데, Jenkins로 전환하면서 설정이 복잡했습니다.

**어려웠던 점**:

- Jenkinsfile 문법 (Groovy 기반)
- Docker-in-Docker 권한 문제
- 환경 변수 관리
- GitHub Webhook 연동

**해결 과정**:

```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'dulit-server'
        CONTAINER_NAME = 'dulit-server-dulit-1'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/...'
            }
        }

        stage('Build') {
            steps {
                sh 'pnpm install'
                sh 'pnpm build'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker-compose down'
                sh 'docker-compose up -d --build'
            }
        }
    }
}
```

**GitHub Actions vs Jenkins 비교**:

| 항목         | GitHub Actions      | Jenkins                     |
| ------------ | ------------------- | --------------------------- |
| 설정 난이도  | ⭐⭐ (YAML, 직관적) | ⭐⭐⭐⭐ (Groovy, 러닝커브) |
| 비용         | 무료 (제한적)       | 자체 호스팅 (서버 비용)     |
| 커스터마이징 | 제한적              | 매우 자유로움               |
| 플러그인     | Marketplace         | 수천 개 플러그인            |

**결론**:

- Jenkins가 초기 설정은 어렵지만, 자체 서버에서 무제한 빌드 가능
- Docker와의 통합이 강력해서 복잡한 배포 시나리오에 유리

#### 3. 소셜 로그인 OAuth2 플로우 이해

**문제**: 프론트엔드 개발 시에는 카카오 로그인 버튼만 눌러서 콜백만 받았는데, 백엔드에서 전체 플로우를 구현하려니 이해가 어려웠습니다.

**혼란스러웠던 점**:

- Authorization Code vs Access Token의 차이
- 카카오/네이버/구글에서 주는 Access Token을 그대로 쓸 수 있는지?
- 백엔드에서 JWT를 별도로 발급해야 하는 이유

**OAuth2 플로우 이해**:

```
[사용자]
   ↓ (1) 카카오 로그인 버튼 클릭
[프론트엔드]
   ↓ (2) 카카오 인증 페이지로 리다이렉트
[카카오 인증 서버]
   ↓ (3) 사용자 로그인 후 Authorization Code 발급
[프론트엔드] (콜백 URL)
   ↓ (4) Authorization Code를 백엔드로 전송
[백엔드]
   ↓ (5) Code로 카카오에 Access Token 요청
[카카오 인증 서버]
   ↓ (6) Access Token 반환
[백엔드]
   ↓ (7) Access Token으로 사용자 정보 조회
   ↓ (8) DB에 사용자 저장/조회
   ↓ (9) 자체 JWT 토큰 발급 (Access + Refresh)
[프론트엔드]
   ↓ (10) JWT로 이후 API 요청
```

**핵심 깨달음**:

```typescript
// ❌ 잘못된 이해: 카카오 Access Token을 그대로 사용?
// 카카오 토큰은 카카오 API에만 유효함!

// ✅ 올바른 방식: 자체 JWT 발급
async kakaoLogin(code: string) {
  // 1. 카카오에서 Access Token 받기
  const kakaoToken = await this.getKakaoToken(code);

  // 2. 카카오 사용자 정보 받기
  const kakaoUser = await this.getKakaoUserInfo(kakaoToken);

  // 3. 우리 DB에 저장/조회
  const user = await this.findOrCreateUser(kakaoUser);

  // 4. 우리 서비스의 JWT 발급 (중요!)
  const jwt = this.jwtService.sign({ userId: user.id });

  return { accessToken: jwt, refreshToken: ... };
}
```

**왜 자체 JWT를 발급해야 하는가?**

- 카카오 토큰은 카카오 API 호출에만 사용 가능
- 우리 서비스의 인증/인가는 우리가 직접 관리해야 함
- 토큰 만료 시간, 권한(Role) 등을 커스터마이징 가능

#### 4. 크론(Cron) 스케줄러 & 문법

**문제**: 약속 2시간 전에 자동으로 알림을 보내는 기능을 구현하려면 크론을 사용해야 했는데, 처음 접해봤습니다.

**어려웠던 점**:

- 크론 문법 (`* * * * *`) 이해
- NestJS에서 크론 사용법
- 매 분마다 체크하는 게 비효율적이지 않을까?

**크론 문법 정리**:

```
 ┌────────────── 초 (0-59)
 │ ┌──────────── 분 (0-59)
 │ │ ┌────────── 시 (0-23)
 │ │ │ ┌──────── 일 (1-31)
 │ │ │ │ ┌────── 월 (1-12)
 │ │ │ │ │ ┌──── 요일 (0-7, 0과 7은 일요일)
 │ │ │ │ │ │
 * * * * * *
```

**예시**:

- `0 * * * *` : 매 시간 0분에 실행
- `0 0 * * *` : 매일 자정에 실행
- `*/5 * * * *` : 5분마다 실행
- `0 9 * * 1-5` : 평일 오전 9시에 실행

**구현 코드**:

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationService {
  // 매 10분마다 체크
  @Cron('0 */10 * * * *')
  async checkUpcomingPlans() {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // 2시간 후에 있는 약속 조회
    const upcomingPlans = await this.planRepository.find({
      where: {
        time: Between(
          twoHoursLater,
          new Date(twoHoursLater.getTime() + 10 * 60 * 1000),
        ),
      },
    });

    // Socket.IO로 실시간 알림
    for (const plan of upcomingPlans) {
      this.sendNotification(plan);
    }
  }
}
```

**최적화 고민**:

- 매 분마다 체크하면 DB 부하가 심하지 않을까?
- → 10분마다 체크하도록 설정
- 더 나은 방법: Redis + Bull Queue로 예약 작업 관리 (향후 개선)

#### 5. HTTPS 적용기

**문제**: HTTP로 개발하다가 실제 배포 시 HTTPS를 적용하는 과정이 생각보다 복잡했습니다.

**단계별 진행 과정**:

**1단계: 도메인 구매**

- 가비아에서 `pyowonsik.site` 구매
- DNS 설정 → AWS EC2 IP 연결

**2단계: Let's Encrypt SSL 인증서 발급**

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d pyowonsik.site
```

**어려웠던 점**: 80 포트가 Nginx에 의해 사용 중이어서 certbot이 실행 안 됨
→ 해결: Nginx 잠시 중지 후 인증서 발급

**3단계: Nginx 리버스 프록시 설정**

```nginx
server {
    listen 80;
    server_name pyowonsik.site;
    return 301 https://$server_name$request_uri;  # HTTP → HTTPS 강제
}

server {
    listen 443 ssl http2;
    server_name pyowonsik.site;

    ssl_certificate /etc/letsencrypt/live/pyowonsik.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pyowonsik.site/privkey.pem;

    location /api {
        proxy_pass http://localhost:3000;
        # ...
    }
}
```

**4단계: Jenkins 프록시 경로 문제**

**문제**: `/jenkins/` 경로로 접속하면 404 에러

```nginx
location /jenkins/ {
    proxy_pass http://localhost:8080/jenkins/;
}
```

**해결**: Jenkins에 `--prefix` 옵션 추가

```bash
# docker-compose.yml
jenkins:
  command: --prefix=/jenkins
```

**5단계: SSL 자동 갱신**

Let's Encrypt 인증서는 90일마다 만료되므로 자동 갱신 필요:

```bash
# certbot-renew.sh
#!/bin/bash
docker-compose stop nginx
certbot renew --quiet
docker-compose start nginx
```

```bash
# crontab -e
0 3 1 * * /path/to/certbot-renew.sh
```

**배운 점**:

- HTTPS는 단순히 인증서만 붙이는 게 아니라 전체 인프라 재구성이 필요
- Nginx 리버스 프록시의 강력함
- 무료 SSL(Let's Encrypt)도 충분히 실무에 사용 가능

### B. 피드백

#### 1. 모놀리식 → 마이크로서비스 고려

현재는 모놀리식 아키텍처로 개발했지만, 서비스가 성장하면 **채팅 서비스**, **알림 서비스**, **커플 관리 서비스** 등으로 분리할 필요성이 있습니다.

**분리 기준**:

- **채팅**: WebSocket 연결 유지, 높은 동시성 → 독립 서버
- **알림**: Cron 기반 배치 작업 → 독립 스케줄러
- **API**: RESTful 요청 처리 → 메인 서버

향후 트래픽 패턴을 분석하여 병목 지점을 파악하고 점진적으로 마이크로서비스로 전환할 계획입니다.

#### 2. 실시간 알림 확장성

현재 Socket.IO로 실시간 알림을 구현했지만, 서버가 여러 대로 확장될 경우 문제가 발생합니다.

**문제점**:

- 서버 A에 연결된 사용자에게 서버 B에서 알림을 보낼 수 없음

**개선 방안**:

- Redis Pub/Sub을 활용한 서버 간 메시지 브로드캐스트
- Socket.IO Redis Adapter 적용
- 또는 FCM(Firebase Cloud Messaging) 통합

#### 3. QueryBuilder vs TypeORM 메서드

복잡한 쿼리의 경우 QueryBuilder를 사용했지만, 단순 CRUD는 TypeORM 메서드를 사용했습니다.

**일관성 기준 수립 필요**:

- 간단한 쿼리: TypeORM Repository 메서드
- 복잡한 조인/서브쿼리: QueryBuilder
- 성능 최적화 필요: Raw Query

#### 4. 테스트 커버리지 유지

프로젝트 후반부에 테스트를 작성했기 때문에, 초반 코드는 테스트 커버리지가 낮습니다.

**개선 방향**:

- TDD는 아니더라도, 기능 개발과 동시에 테스트 작성
- E2E 테스트 추가 (현재는 Unit 테스트만)
- CI 파이프라인에 테스트 자동 실행 단계 추가

## 느낀 점

이번 프로젝트를 통해 백엔드 개발자로서 가장 중요한 것은 **"동작하는 코드"**가 아니라 **"운영 가능한 시스템"**을 만드는 것임을 깨달았습니다.

### 개발자의 시야 확장

프론트엔드 개발만 하던 시절에는 "API만 잘 나오면 되지"라고 생각했습니다. 하지만 백엔드를 직접 개발하고 배포하면서, API 뒤에 숨겨진 **데이터베이스 설계**, **인증/인가**, **파일 스토리지**, **실시간 통신**, **서버 인프라**, **모니터링** 등 수많은 고려사항이 있음을 알게 되었습니다.

### DevOps의 중요성

코드를 작성하는 것보다 배포하고 운영하는 것이 더 어려웠습니다. Jenkins, Docker, Nginx, SSL 인증서 등 DevOps 영역에서 수많은 시행착오를 겪었지만, 결과적으로 이 경험이 개발자로서의 시야를 넓혀주었습니다.

### 실무 준비

이번 프로젝트는 단순한 포트폴리오가 아니라, **실제 서비스를 운영하는 경험**이었습니다. 사용자가 접속할 수 있는 도메인을 구매하고, HTTPS를 적용하고, 자동 배포 시스템을 구축하면서, 실무에서 어떤 일을 하게 될지 미리 경험할 수 있었습니다.

### 다음 단계

앞으로는:

- **성능 최적화**: 쿼리 튜닝, 캐싱 전략, 로드 밸런싱
- **모니터링**: 로그 분석, 에러 트래킹, 성능 지표 수집
- **확장성**: 마이크로서비스 아키텍처, 메시지 큐
- **협업**: 코드 리뷰, 문서화, 컨벤션 정립

이러한 주제들을 학습하고 적용해보고 싶습니다.

## API 문서

[![Swagger](<https://img.shields.io/badge/swagger_문서로_확인하기_(클릭!)-85EA2D?&logo=swagger&logoColor=white>)](https://pyowonsik.site/doc)

### 주요 API 목록

| Domain          | Method    | Endpoint                | Description                |
| --------------- | --------- | ----------------------- | -------------------------- |
| **Auth**        | POST      | `/api/auth/signin`      | 로그인 (카카오 OAuth)      |
| **Auth**        | POST      | `/api/auth/refresh`     | AccessToken 갱신           |
| **Auth**        | POST      | `/api/auth/signout`     | 로그아웃                   |
| **User**        | GET       | `/api/user/profile`     | 내 프로필 조회             |
| **User**        | PATCH     | `/api/user/profile`     | 프로필 수정                |
| **Couple**      | POST      | `/api/couple/match`     | 커플 매칭 요청             |
| **Couple**      | GET       | `/api/couple/info`      | 커플 정보 조회             |
| **Chat**        | GET       | `/api/chat/messages`    | 채팅 메시지 조회           |
| **Chat**        | WebSocket | `/socket.io`            | 실시간 채팅                |
| **Anniversary** | GET       | `/api/anniversary`      | 기념일 목록                |
| **Anniversary** | POST      | `/api/anniversary`      | 기념일 등록                |
| **Anniversary** | PATCH     | `/api/anniversary/:id`  | 기념일 수정                |
| **Anniversary** | DELETE    | `/api/anniversary/:id`  | 기념일 삭제                |
| **Plan**        | GET       | `/api/plan`             | 약속 목록                  |
| **Plan**        | POST      | `/api/plan`             | 약속 등록                  |
| **Plan**        | PATCH     | `/api/plan/:id`         | 약속 수정                  |
| **Plan**        | DELETE    | `/api/plan/:id`         | 약속 삭제                  |
| **Calendar**    | GET       | `/api/calendar`         | 캘린더 일정 조회           |
| **Calendar**    | POST      | `/api/calendar`         | 일정 등록                  |
| **Post**        | GET       | `/api/post`             | 게시글 목록 (페이지네이션) |
| **Post**        | GET       | `/api/post/:id`         | 게시글 상세                |
| **Post**        | POST      | `/api/post`             | 게시글 작성                |
| **Post**        | PATCH     | `/api/post/:id`         | 게시글 수정                |
| **Post**        | DELETE    | `/api/post/:id`         | 게시글 삭제                |
| **Comment**     | POST      | `/api/post/:id/comment` | 댓글 작성                  |
| **Comment**     | DELETE    | `/api/comment/:id`      | 댓글 삭제                  |

## 배포 & Infra

### AWS EC2 배포 환경

![EC2](./readme_source/ec2_preview.png)
![S3](./readme_source/s3_preview.png)

### Docker 컨테이너 구성

![Docker](./readme_source/docker_preview.png)

**실행 중인 컨테이너**:

1. **nginx-alpine** (Nginx 프록시)
   - 포트: 80 → 80/tcp, 443 → 443/tcp
   - 역할: HTTPS 종료점, 리버스 프록시
2. **dulit-server-dulit** (NestJS 서버)
   - 포트: 3000/tcp
   - 역할: 백엔드 API 서버
3. **jenkins/jenkins:lts** (Jenkins CI/CD)
   - 포트: 8080/tcp, 50000/tcp
   - 역할: 자동 빌드 및 배포
4. **postgres:16** (PostgreSQL 데이터베이스)
   - 포트: 5432/tcp
   - 역할: 메인 데이터베이스

### Jenkins CI/CD 파이프라인

![Jenkins](./readme_source/jenkins_preview.png)

**자동화 배포 프로세스**:

1. GitHub에 코드 Push
2. GitHub Webhook → Jenkins 자동 트리거
3. Jenkins 파이프라인 실행:
   - 소스 코드 체크아웃
   - 의존성 설치 (`pnpm install`)
   - TypeScript 컴파일 (`pnpm build`)
   - Docker 이미지 빌드
   - 컨테이너 재시작
4. 배포 완료

### Swagger API 문서

![Swagger](./readme_source/swagger_preview.png)

**실시간 API 문서**:

- **접속 URL**: [https://pyowonsik.site/doc](https://pyowonsik.site/doc)
- **버전**: Dulit 1.0 (OAS 3.0)
- **설명**: 대한민국 대표 커플 메신저 Dulit
- **기능**: 모든 API 엔드포인트 테스트 가능

### 핵심 인프라 구성 요소

#### 1. Nginx 리버스 프록시

- **HTTPS 종료점**: Let's Encrypt SSL 인증서
- **경로 라우팅**:
  - `/api` → NestJS 서버 (3000 포트)
  - `/socket.io` → WebSocket 연결
  - `/jenkins` → Jenkins 대시보드
- **SSL 자동 갱신**: Certbot + Cron

#### 2. Docker Compose 오케스트레이션

- 4개 컨테이너 통합 관리
- 자동 재시작 정책
- 볼륨 마운트로 데이터 영속성 보장
- 환경 변수 중앙 관리

#### 3. 보안 설정

- **내부 포트 보호**: expose만 사용 (외부 접근 차단)
- **AWS 보안 그룹**: HTTPS(443)만 허용
- **JWT 토큰 인증**: 모든 API 요청 검증
- **CORS 정책**: 허용된 도메인만 접근

#### 4. 모니터링 & 로깅

- **Winston Logger**: 구조화된 로그 수집
- **Docker Logs**: 컨테이너별 로그 관리
- **Jenkins 빌드 이력**: 배포 추적
