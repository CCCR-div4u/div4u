# Environment Variables Guide

이 문서는 Div4u Comparison Service의 환경변수 설정에 대한 상세 가이드입니다.

## 📋 환경변수 개요

환경변수는 서비스의 동작을 제어하는 설정값들입니다. 개발, 테스트, 프로덕션 환경에 따라 다른 값을 설정할 수 있습니다.

## 🔧 설정 방법

### 1. .env 파일 사용 (권장)

```bash
# .env 파일 생성
cp .env.example .env

# .env 파일 편집
nano .env
```

### 2. 시스템 환경변수

```bash
# Linux/macOS
export SEOUL_API_KEY=your_api_key_here
export PORT=3002

# Windows (PowerShell)
$env:SEOUL_API_KEY="your_api_key_here"
$env:PORT="3002"

# Windows (CMD)
set SEOUL_API_KEY=your_api_key_here
set PORT=3002
```

### 3. Docker 환경

```yaml
# docker-compose.yml
services:
  comparison-service:
    environment:
      - SEOUL_API_KEY=your_api_key_here
      - PORT=3002
      - NODE_ENV=production
```

## 📝 환경변수 목록

### 🚀 서버 설정

#### `PORT`
- **설명**: 서버가 실행될 포트 번호
- **타입**: Number
- **기본값**: `3002`
- **필수**: ❌
- **예시**: `3002`, `8080`, `3000`

```bash
PORT=3002
```

#### `NODE_ENV`
- **설명**: 실행 환경 모드
- **타입**: String
- **기본값**: `development`
- **필수**: ❌
- **가능한 값**: `development`, `test`, `staging`, `production`

```bash
NODE_ENV=development
```

**환경별 동작 차이**:
- `development`: 상세 로그, 핫 리로드
- `test`: 테스트 최적화, 로그 최소화
- `staging`: 프로덕션과 유사하지만 디버그 정보 포함
- `production`: 성능 최적화, 보안 강화

### 🌐 서울시 API 설정

#### `SEOUL_API_KEY` ⭐ 필수
- **설명**: 서울시 Open API 인증 키
- **타입**: String
- **기본값**: 없음
- **필수**: ✅
- **발급처**: [서울 열린데이터 광장](https://data.seoul.go.kr/)

```bash
SEOUL_API_KEY=6d4d776b466c656533356a4b4b5872
```

**API 키 발급 방법**:
1. 서울 열린데이터 광장 회원가입
2. 마이페이지 → API 키 발급
3. 실시간 도시데이터 API 사용 신청
4. 승인 후 키 사용 가능

#### `SEOUL_API_BASE_URL`
- **설명**: 서울시 API 기본 URL
- **타입**: String
- **기본값**: `http://openapi.seoul.go.kr:8088`
- **필수**: ❌

```bash
SEOUL_API_BASE_URL=http://openapi.seoul.go.kr:8088
```

### 💾 캐시 설정

#### `CACHE_TTL_MINUTES`
- **설명**: 캐시 유지 시간 (분 단위)
- **타입**: Number
- **기본값**: `1`
- **필수**: ❌
- **권장값**: 개발 환경 `1`, 프로덕션 환경 `5`

```bash
CACHE_TTL_MINUTES=1
```

**TTL 설정 가이드**:
- `0`: 캐시 비활성화 (테스트용)
- `1`: 빠른 업데이트 (개발용)
- `5`: 균형잡힌 성능 (프로덕션 권장)
- `10+`: 높은 성능, 낮은 실시간성

### 🔒 보안 및 CORS 설정

#### `ALLOWED_ORIGINS`
- **설명**: CORS에서 허용할 도메인 목록 (쉼표로 구분)
- **타입**: String (comma-separated)
- **기본값**: `http://localhost:5174`
- **필수**: ❌

```bash
ALLOWED_ORIGINS=http://localhost:5174,http://localhost:3000,https://yourdomain.com
```

**설정 예시**:
```bash
# 개발 환경
ALLOWED_ORIGINS=http://localhost:5174,http://localhost:3000

# 프로덕션 환경
ALLOWED_ORIGINS=https://div4u.com,https://api.div4u.com

# 모든 도메인 허용 (보안상 권장하지 않음)
ALLOWED_ORIGINS=*
```

### 📊 로깅 설정

#### `LOG_LEVEL`
- **설명**: 로그 출력 레벨
- **타입**: String
- **기본값**: `info`
- **필수**: ❌
- **가능한 값**: `error`, `warn`, `info`, `debug`

```bash
LOG_LEVEL=info
```

**로그 레벨별 출력**:
- `error`: 에러만 출력
- `warn`: 경고 이상 출력
- `info`: 정보 이상 출력 (권장)
- `debug`: 모든 로그 출력 (개발용)

## 🌍 환경별 설정 예시

### 개발 환경 (.env.development)

```bash
# 서버 설정
PORT=3002
NODE_ENV=development

# 서울시 API
SEOUL_API_KEY=your_development_api_key
SEOUL_API_BASE_URL=http://openapi.seoul.go.kr:8088

# 캐시 설정 (빠른 업데이트)
CACHE_TTL_MINUTES=1

# CORS 설정 (로컬 개발)
ALLOWED_ORIGINS=http://localhost:5174,http://localhost:3000

# 로깅 설정 (상세 로그)
LOG_LEVEL=debug
```

### 테스트 환경 (.env.test)

```bash
# 서버 설정
PORT=3003
NODE_ENV=test

# 서울시 API (테스트용 키 또는 모킹)
SEOUL_API_KEY=test_api_key
SEOUL_API_BASE_URL=http://localhost:8088

# 캐시 설정 (캐시 비활성화)
CACHE_TTL_MINUTES=0

# CORS 설정 (테스트 환경)
ALLOWED_ORIGINS=http://localhost:3000

# 로깅 설정 (에러만)
LOG_LEVEL=error
```

### 스테이징 환경 (.env.staging)

```bash
# 서버 설정
PORT=3002
NODE_ENV=staging

# 서울시 API
SEOUL_API_KEY=your_staging_api_key
SEOUL_API_BASE_URL=http://openapi.seoul.go.kr:8088

# 캐시 설정 (프로덕션과 유사)
CACHE_TTL_MINUTES=5

# CORS 설정 (스테이징 도메인)
ALLOWED_ORIGINS=https://staging.div4u.com

# 로깅 설정 (정보 레벨)
LOG_LEVEL=info
```

### 프로덕션 환경 (.env.production)

```bash
# 서버 설정
PORT=3002
NODE_ENV=production

# 서울시 API
SEOUL_API_KEY=your_production_api_key
SEOUL_API_BASE_URL=http://openapi.seoul.go.kr:8088

# 캐시 설정 (성능 최적화)
CACHE_TTL_MINUTES=5

# CORS 설정 (프로덕션 도메인만)
ALLOWED_ORIGINS=https://div4u.com,https://api.div4u.com

# 로깅 설정 (경고 이상)
LOG_LEVEL=warn
```

## 🔐 보안 고려사항

### 1. API 키 보안

```bash
# ❌ 잘못된 예시 - 코드에 하드코딩
const API_KEY = "6d4d776b466c656533356a4b4b5872";

# ✅ 올바른 예시 - 환경변수 사용
const API_KEY = process.env.SEOUL_API_KEY;
```

### 2. .env 파일 보안

```bash
# .gitignore에 추가 (필수)
.env
.env.local
.env.production
.env.*.local

# 파일 권한 설정 (Linux/macOS)
chmod 600 .env
```

### 3. 프로덕션 환경 보안

```bash
# 환경변수로 직접 설정 (Docker/K8s)
docker run -e SEOUL_API_KEY=secret_key comparison-service

# 또는 secrets 사용
kubectl create secret generic api-secrets \
  --from-literal=seoul-api-key=your_secret_key
```

## 🧪 환경변수 검증

### 1. 시작 시 검증

서비스는 시작 시 필수 환경변수를 자동으로 검증합니다:

```typescript
// src/config/index.ts
export const validateConfig = (): void => {
  const requiredEnvVars = ['SEOUL_API_KEY'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Required environment variable ${envVar} is not set`);
    }
  }
};
```

### 2. 수동 검증

```bash
# 환경변수 확인 스크립트
npm run check-env

# 또는 직접 확인
node -e "console.log('API Key:', process.env.SEOUL_API_KEY ? '✅ Set' : '❌ Missing')"
```

### 3. Health Check에서 확인

```bash
# Health check API로 설정 상태 확인
curl http://localhost:3002/api/comparison/health

# 응답에서 dependencies 섹션 확인
{
  "dependencies": {
    "seoulAPI": "healthy",  // API 키가 올바르게 설정됨
    "cache": "healthy"
  }
}
```

## 🚨 문제 해결

### 일반적인 문제

#### 1. API 키 관련 오류

**증상**:
```
⚠️ SEOUL_API_KEY가 설정되지 않았습니다.
```

**해결방법**:
```bash
# .env 파일 확인
cat .env | grep SEOUL_API_KEY

# 환경변수 직접 설정
export SEOUL_API_KEY=your_api_key_here

# 서비스 재시작
npm run dev
```

#### 2. 포트 충돌

**증상**:
```
Error: listen EADDRINUSE: address already in use :::3002
```

**해결방법**:
```bash
# 다른 포트 사용
PORT=3003 npm run dev

# 또는 .env 파일 수정
echo "PORT=3003" >> .env
```

#### 3. CORS 오류

**증상**:
```
Access to fetch at 'http://localhost:3002' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**해결방법**:
```bash
# .env 파일에 도메인 추가
ALLOWED_ORIGINS=http://localhost:5174,http://localhost:5173,http://localhost:3000
```

#### 4. 캐시 문제

**증상**: 데이터가 업데이트되지 않음

**해결방법**:
```bash
# 캐시 TTL 단축
CACHE_TTL_MINUTES=0

# 또는 캐시 초기화
curl -X POST http://localhost:3002/api/comparison/cache/clear
```

### 환경변수 디버깅

```bash
# 모든 환경변수 출력
printenv | grep -E "(PORT|NODE_ENV|SEOUL|CACHE|ALLOWED|LOG)"

# Node.js에서 환경변수 확인
node -e "console.log(process.env)"

# 특정 환경변수만 확인
node -e "console.log('PORT:', process.env.PORT)"
```

## 📚 추가 리소스

### 관련 문서
- [개발 환경 설정 가이드](./development-setup.md)
- [API 문서](./api.md)
- [트러블슈팅 가이드](./troubleshooting.md)

### 도구
- [dotenv](https://www.npmjs.com/package/dotenv): .env 파일 로딩
- [env-var](https://www.npmjs.com/package/env-var): 환경변수 검증
- [cross-env](https://www.npmjs.com/package/cross-env): 크로스 플랫폼 환경변수 설정

### 보안 도구
- [git-secrets](https://github.com/awslabs/git-secrets): Git에서 비밀 정보 검출
- [truffleHog](https://github.com/trufflesecurity/truffleHog): 저장소에서 비밀 정보 스캔

---

환경변수 설정에 문제가 있거나 추가 도움이 필요한 경우, GitHub Issues에 문의해 주세요.