# 🚀 개발 환경 설정 가이드

## 📋 필수 파일 생성

GitHub에서 클론한 후 다음 파일들을 생성해야 합니다:

> 💡 **팀원들**: 별도로 전달받은 파일들을 해당 위치에 복사하세요!

## 📁 전달받아야 할 파일 목록

### 🔑 환경 변수 파일들
- `backend/.env` - 백엔드 환경 설정 (API 키 포함)
- `frontend/.env` - 프론트엔드 환경 설정
- `.env` - 루트 환경 설정 (Docker 사용시)

### ☸️ Kubernetes 파일들
- `k8s/secret.yaml` - 실제 API 키가 포함된 Kubernetes Secret

### ❌ 전달받을 필요 없는 것들
- `node_modules/` - `npm install`로 자동 설치됨
- `logs/` - 실행 시 자동 생성됨
- `.git/` - 클론 시 자동 생성됨

### 1. Backend 환경 변수 파일
```bash
# backend/.env 파일 생성
cp backend/.env.example backend/.env
```

**backend/.env 파일 내용:**
```bash
# Backend Environment Variables
PORT=3001
NODE_ENV=development

# Seoul API Configuration
SEOUL_API_KEY=실제_서울시_API_키_여기에_입력
SEOUL_API_BASE_URL=http://openapi.seoul.go.kr:8088

# CORS Configuration
CORS_ORIGIN=http://localhost:5174
```

### 2. Frontend 환경 변수 파일
```bash
# frontend/.env 파일 생성
cp frontend/.env.example frontend/.env
```

**frontend/.env 파일 내용:**
```bash
# API 서버 URL
VITE_API_BASE_URL=http://localhost:3001/api

# 개발 환경 설정
NODE_ENV=development

# 기타 설정
VITE_APP_NAME=Seoul Congestion Service
VITE_APP_VERSION=1.0.0
```

### 3. 루트 환경 변수 파일 (Docker 사용시)
```bash
# .env 파일 생성
cp .env.example .env
```

**루트 .env 파일 내용:**
```bash
# 서울시 공공 API 키
SEOUL_API_KEY=실제_서울시_API_키_여기에_입력

# 개발 환경 설정
NODE_ENV=development

# 포트 설정
FRONTEND_PORT=5174
BACKEND_PORT=3001

# API 베이스 URL
VITE_API_BASE_URL=http://localhost:3001
```

## 🔑 서울시 API 키 발급 방법

1. [서울 열린데이터 광장](https://data.seoul.go.kr/) 접속
2. 회원가입 및 로그인
3. 마이페이지 → 인증키 신청
4. "도시데이터 센서" API 신청
5. 발급받은 키를 위 .env 파일들에 입력

## 🚀 개발 서버 실행

### 방법 1: 개별 실행
```bash
# Backend 실행
cd backend
npm install
npm run dev

# Frontend 실행 (새 터미널)
cd frontend
npm install
npm run dev
```

### 방법 2: Docker Compose 실행
```bash
# 개발 환경
docker-compose -f docker-compose.dev.yml up

# 프로덕션 환경
docker-compose up
```

## 📁 필수 디렉터리 구조

```
Kiro_Service_V2/
├── backend/
│   ├── .env                 # ← 생성 필요
│   └── .env.example         # ← 템플릿
├── frontend/
│   ├── .env                 # ← 생성 필요
│   └── .env.example         # ← 템플릿
├── .env                     # ← 생성 필요 (Docker용)
└── .env.example             # ← 템플릿
```

## ⚠️ 주의사항

- `.env` 파일들은 절대 Git에 커밋하지 마세요
- API 키는 팀 내부에서만 공유하세요
- 개발 완료 후 API 키를 GitHub Secrets에 등록하세요

## 🆘 문제 해결

### 1. API 키 오류
- `.env` 파일에 올바른 API 키가 입력되었는지 확인
- 서울시 API 키가 활성화되었는지 확인

### 2. 포트 충돌
- 다른 서비스가 3000, 5174 포트를 사용하고 있는지 확인
- 필요시 `.env` 파일에서 포트 번호 변경

### 3. CORS 오류
- backend/.env의 CORS_ORIGIN이 올바른지 확인
- 프론트엔드 URL과 일치하는지 확인