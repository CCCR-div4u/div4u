# Development Setup Guide

이 가이드는 Div4u Comparison Service의 로컬 개발 환경을 설정하는 방법을 설명합니다.

## 📋 사전 요구사항

### 시스템 요구사항

- **Operating System**: Windows 10/11, macOS 10.15+, Ubuntu 18.04+
- **Node.js**: 18.0.0 이상 (LTS 권장)
- **npm**: 8.0.0 이상
- **Git**: 2.20.0 이상
- **Code Editor**: VS Code 권장

### 필수 계정 및 키

1. **서울시 Open API 키**
   - [서울 열린데이터 광장](https://data.seoul.go.kr/) 회원가입
   - API 키 발급 신청
   - 실시간 도시데이터 API 사용 승인

## 🚀 빠른 설정

### 1. 저장소 클론

```bash
# 메인 프로젝트 클론
git clone <repository-url>
cd div4u

# Comparison Service 디렉토리로 이동
cd comparison-service
```

### 2. Node.js 버전 확인

```bash
# Node.js 버전 확인 (18.0.0 이상 필요)
node --version

# npm 버전 확인 (8.0.0 이상 필요)
npm --version
```

**Node.js 설치가 필요한 경우**:
- [Node.js 공식 사이트](https://nodejs.org/)에서 LTS 버전 다운로드
- 또는 nvm 사용:
  ```bash
  # nvm으로 Node.js 18 설치
  nvm install 18
  nvm use 18
  ```

### 3. 의존성 설치

```bash
# 패키지 설치
npm install

# 설치 확인
npm list --depth=0
```

### 4. 환경변수 설정

```bash
# .env 파일 생성
cp .env.example .env

# .env 파일 편집
# Windows
notepad .env

# macOS/Linux
nano .env
# 또는
code .env
```

**.env 파일 설정**:
```bash
# 서버 설정
PORT=3002
NODE_ENV=development

# 서울시 API 설정 (필수)
SEOUL_API_KEY=your_actual_seoul_api_key_here
SEOUL_API_BASE_URL=http://openapi.seoul.go.kr:8088

# 캐시 설정
CACHE_TTL_MINUTES=1

# CORS 설정
ALLOWED_ORIGINS=http://localhost:5174,http://localhost:3000

# 로깅 설정
LOG_LEVEL=debug
```

### 5. 개발 서버 실행

```bash
# 개발 모드로 실행 (자동 재시작)
npm run dev
```

**성공 시 출력**:
```
🛡️ Rate Limiter initialized: 100 requests per 60s
💾 Cache Service initialized with TTL: 1 minutes
🌐 Seoul API Service initialized: http://openapi.seoul.go.kr:8088
🔧 Comparison Service initialized
🚀 Comparison Service started successfully!
📍 Server running on port 3002
🌍 Environment: development
🔗 Health check: http://localhost:3002/api/comparison/health
📊 Service info: http://localhost:3002/api/comparison/info
⏰ Started at: 2025-08-16T18:00:00.000Z
```

### 6. 서비스 확인

```bash
# Health check
curl http://localhost:3002/api/comparison/health

# Service info
curl http://localhost:3002/api/comparison/info

# 또는 브라우저에서 접속
# http://localhost:3002/api/comparison/health
```

## 🛠️ 개발 도구 설정

### VS Code 설정

**권장 확장 프로그램**:
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "humao.rest-client"
  ]
}
```

**VS Code 설정 (.vscode/settings.json)**:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "eslint.autoFixOnSave": true,
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true
  }
}
```

### Git 설정

**.gitignore 확인**:
```gitignore
# Dependencies
node_modules/
npm-debug.log*

# Build outputs
dist/
build/

# Environment variables
.env
.env.local
.env.production

# Logs
logs/
*.log

# Coverage reports
coverage/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

**Git hooks 설정** (선택사항):
```bash
# Husky 설치 (pre-commit hooks)
npm install --save-dev husky
npx husky install

# Pre-commit hook 추가
npx husky add .husky/pre-commit "npm run lint && npm test"
```

## 🧪 개발 워크플로우

### 1. 기능 개발

```bash
# 새 브랜치 생성
git checkout -b feature/your-feature-name

# 개발 서버 실행
npm run dev

# 코드 변경 후 자동 재시작 확인
# 파일 저장 시 서버가 자동으로 재시작됩니다
```

### 2. 코드 품질 확인

```bash
# 린팅 검사
npm run lint

# 린팅 자동 수정
npm run lint:fix

# 타입 체크
npx tsc --noEmit

# 테스트 실행
npm test

# 테스트 커버리지
npm test -- --coverage
```

### 3. API 테스트

**REST Client 사용** (.vscode/requests.http):
```http
### Health Check
GET http://localhost:3002/api/comparison/health

### Service Info
GET http://localhost:3002/api/comparison/info

### Compare Locations
POST http://localhost:3002/api/comparison/compare
Content-Type: application/json

{
  "locations": ["홍대", "강남역", "명동"],
  "options": {
    "includeRecommendation": true,
    "sortBy": "crowdLevel"
  }
}

### Test Data
POST http://localhost:3002/api/comparison/test
Content-Type: application/json

{
  "locations": ["테스트1", "테스트2", "테스트3"]
}

### Clear Cache
POST http://localhost:3002/api/comparison/cache/clear
```

### 4. 디버깅

**VS Code 디버깅 설정** (.vscode/launch.json):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Comparison Service",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/server.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

**로그 레벨 조정**:
```bash
# 상세 디버그 로그
LOG_LEVEL=debug npm run dev

# 에러만 표시
LOG_LEVEL=error npm run dev
```

## 🔧 고급 설정

### 데이터베이스 연동 (향후)

현재는 메모리 캐시만 사용하지만, 향후 데이터베이스 연동 시:

```bash
# Redis 설치 (캐시용)
# Windows (Chocolatey)
choco install redis-64

# macOS (Homebrew)
brew install redis

# Ubuntu
sudo apt install redis-server

# Redis 실행
redis-server
```

### Docker 개발 환경 (선택사항)

```bash
# Docker Compose로 개발 환경 실행
docker-compose -f docker-compose.dev.yml up

# 개발용 Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3002
CMD ["npm", "run", "dev"]
```

### 환경별 설정

**개발 환경** (.env.development):
```bash
NODE_ENV=development
LOG_LEVEL=debug
CACHE_TTL_MINUTES=1
```

**테스트 환경** (.env.test):
```bash
NODE_ENV=test
LOG_LEVEL=error
CACHE_TTL_MINUTES=0
SEOUL_API_KEY=test-key
```

**스테이징 환경** (.env.staging):
```bash
NODE_ENV=staging
LOG_LEVEL=info
CACHE_TTL_MINUTES=5
```

## 🚨 문제 해결

### 일반적인 문제

#### 1. 포트 이미 사용 중
```bash
# 포트 사용 프로세스 확인
# Windows
netstat -ano | findstr :3002

# macOS/Linux
lsof -i :3002

# 프로세스 종료 후 다시 시도
# 또는 다른 포트 사용
PORT=3003 npm run dev
```

#### 2. 의존성 설치 실패
```bash
# npm 캐시 정리
npm cache clean --force

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 3. TypeScript 컴파일 오류
```bash
# TypeScript 버전 확인
npx tsc --version

# 타입 정의 재설치
npm install --save-dev @types/node @types/express

# 타입 체크만 실행
npx tsc --noEmit
```

#### 4. 서울시 API 연결 실패
```bash
# API 키 확인
echo $SEOUL_API_KEY

# 네트워크 연결 테스트
curl "http://openapi.seoul.go.kr:8088/sample/json/citydata_ppltn/1/5/POI001"

# 프록시 설정 (필요시)
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

### 성능 최적화

#### 개발 서버 성능 향상
```bash
# TypeScript 컴파일 속도 향상
npm install --save-dev ts-node-dev

# 메모리 사용량 모니터링
npm install --save-dev clinic

# 프로파일링
clinic doctor -- node dist/server.js
```

#### 핫 리로드 최적화
```json
// nodemon.json
{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": ["src/**/*.test.ts", "src/**/*.spec.ts"],
  "exec": "ts-node src/server.ts"
}
```

## 📚 추가 리소스

### 문서
- [API 문서](./api.md)
- [환경변수 가이드](./environment-variables.md)
- [트러블슈팅 가이드](./troubleshooting.md)

### 도구
- [Postman Collection](./postman/comparison-service.json)
- [VS Code Snippets](../.vscode/snippets.json)
- [Docker Compose](../docker-compose.dev.yml)

### 학습 자료
- [Node.js 공식 문서](https://nodejs.org/docs/)
- [Express.js 가이드](https://expressjs.com/guide/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Jest 테스팅 가이드](https://jestjs.io/docs/getting-started)

## 🤝 기여하기

개발 환경 설정이 완료되면:

1. **코딩 컨벤션 확인**: [CONTRIBUTING.md](../CONTRIBUTING.md)
2. **이슈 확인**: GitHub Issues에서 작업할 이슈 선택
3. **브랜치 생성**: `feature/`, `bugfix/`, `docs/` 접두사 사용
4. **테스트 작성**: 새 기능에 대한 테스트 코드 작성
5. **Pull Request**: 코드 리뷰를 위한 PR 생성

---

개발 환경 설정에 문제가 있거나 추가 도움이 필요한 경우, GitHub Issues에 문의해 주세요.