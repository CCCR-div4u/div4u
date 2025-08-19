# Div4u Comparison Service

> MSA 기반 서울시 혼잡도 비교 분석 서비스

Div4u Comparison Service는 서울시 실시간 도시데이터 API를 활용하여 여러 장소의 혼잡도를 비교하고 최적의 장소를 추천하는 마이크로서비스입니다.

## 🌟 주요 기능

- **다중 장소 혼잡도 비교**: 최대 10개 장소의 실시간 혼잡도 동시 조회
- **스마트 추천 알고리즘**: 혼잡도 기반 최적 장소 추천 및 대안 제시
- **자연어 처리**: 사용자 친화적인 장소명 입력 지원
- **데이터 일관성**: Core API와 동일한 데이터 소스 사용
- **성능 최적화**: 캐싱 및 병렬 처리를 통한 빠른 응답
- **에러 처리**: 견고한 폴백 메커니즘

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│ Comparison      │───▶│   Core API      │
│   (React)       │    │   Service       │    │   (Express)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  Seoul Open     │
                       │     API         │
                       └─────────────────┘
```

## 📋 목차

- [빠른 시작](#빠른-시작)
- [설치 및 실행](#설치-및-실행)
- [API 문서](#api-문서)
- [환경 설정](#환경-설정)
- [개발 가이드](#개발-가이드)
- [테스트](#테스트)
- [트러블슈팅](#트러블슈팅)

## 🚀 빠른 시작

```bash
# 1. 저장소 클론 및 디렉토리 이동
cd div4u/comparison-service

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.example .env
# .env 파일에서 SEOUL_API_KEY 설정

# 4. 개발 서버 실행
npm run dev

# 5. 서비스 확인
curl http://localhost:3002/api/comparison/health
```

## 📦 설치 및 실행

### 시스템 요구사항

- **Node.js**: 18.0.0 이상
- **npm**: 8.0.0 이상
- **서울시 Open API 키**: [서울 열린데이터 광장](https://data.seoul.go.kr/)에서 발급

### 로컬 개발 환경

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **환경변수 설정**
   ```bash
   # .env 파일 생성
   cp .env.example .env
   
   # 필수 환경변수 설정
   SEOUL_API_KEY=your_seoul_api_key_here
   ```

3. **개발 서버 실행**
   ```bash
   # 개발 모드 (자동 재시작)
   npm run dev
   
   # 또는 빌드 후 실행
   npm run build
   npm start
   ```

4. **서비스 확인**
   - Health Check: http://localhost:3002/api/comparison/health
   - Service Info: http://localhost:3002/api/comparison/info

### 프로덕션 배포

```bash
# 1. 빌드
npm run build

# 2. 프로덕션 실행
NODE_ENV=production npm start

# 3. PM2를 사용한 프로세스 관리 (선택사항)
npm install -g pm2
pm2 start dist/server.js --name "comparison-service"
```

## 📚 API 문서

### Base URL
```
http://localhost:3002/api/comparison
```

### 인증
현재 버전에서는 별도 인증이 필요하지 않습니다.

### 엔드포인트

#### `GET /health`
서비스 상태 확인

**Response:**
```json
{
  "status": "healthy",
  "service": "comparison-service",
  "version": "1.0.0",
  "timestamp": "2025-08-16T18:00:00.000Z",
  "uptime": 123.456,
  "memory": {
    "used": 45.2,
    "total": 128.0
  },
  "dependencies": {
    "seoulAPI": "healthy",
    "cache": "healthy"
  }
}
```

#### `GET /info`
서비스 정보 조회

**Response:**
```json
{
  "service": "comparison-service",
  "version": "1.0.0",
  "description": "MSA 기반 혼잡도 비교 분석 서비스",
  "endpoints": ["/health", "/info", "/compare"],
  "features": ["multi-location-comparison", "smart-recommendation", "nlp-processing"]
}
```

#### `POST /compare`
여러 장소 혼잡도 비교 및 분석

**Request:**
```json
{
  "locations": ["홍대", "강남역", "명동"],
  "options": {
    "includeRecommendation": true,
    "sortBy": "crowdLevel",
    "maxLocations": 10
  }
}
```

**Parameters:**
- `locations` (required): 비교할 장소명 배열 (최대 10개)
- `options.includeRecommendation` (optional): 추천 정보 포함 여부 (기본값: true)
- `options.sortBy` (optional): 정렬 기준 ("crowdLevel" | "location")
- `options.maxLocations` (optional): 최대 장소 수 (기본값: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "comparisons": [
      {
        "location": "홍대 관광특구",
        "displayName": "홍대 관광특구 일대",
        "crowdLevel": "여유",
        "message": "사람이 몰려있을 가능성이 낮고 붐빔은 거의 느껴지지 않아요.",
        "timestamp": "2025-08-16T18:00:00.000Z",
        "rank": 1
      }
    ],
    "analysis": {
      "mostCrowded": {
        "location": "강남역",
        "crowdLevel": "붐빔"
      },
      "leastCrowded": {
        "location": "홍대 관광특구",
        "crowdLevel": "여유"
      },
      "averageCrowdLevel": {
        "level": "보통",
        "score": 2.3
      },
      "recommendation": {
        "bestChoice": "홍대 관광특구",
        "reason": "현재 가장 여유로워서 편안하게 이용할 수 있습니다",
        "alternativeOptions": ["명동 관광특구"]
      },
      "statistics": {
        "totalLocations": 3,
        "crowdLevelDistribution": {
          "여유": 1,
          "보통": 1,
          "약간붐빔": 0,
          "붐빔": 1
        }
      }
    }
  },
  "timestamp": "2025-08-16T18:00:00.000Z"
}
```

#### `POST /test`
테스트용 다양한 혼잡도 시뮬레이션

**Request:**
```json
{
  "locations": ["장소1", "장소2", "장소3"]
}
```

#### `POST /cache/clear`
캐시 초기화 (개발용)

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared successfully",
  "timestamp": "2025-08-16T18:00:00.000Z"
}
```

### 에러 응답

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-08-16T18:00:00.000Z"
}
```

**에러 코드:**
- `VALIDATION_ERROR`: 요청 데이터 유효성 검사 실패
- `TOO_MANY_LOCATIONS`: 최대 장소 수 초과
- `EMPTY_LOCATIONS`: 장소 목록이 비어있음
- `RATE_LIMIT_EXCEEDED`: 요청 한도 초과
- `INTERNAL_ERROR`: 내부 서버 오류

## ⚙️ 환경 설정

### 환경변수

| 변수명 | 설명 | 기본값 | 필수 |
|--------|------|--------|------|
| `PORT` | 서버 포트 | 3002 | ❌ |
| `NODE_ENV` | 실행 환경 | development | ❌ |
| `SEOUL_API_KEY` | 서울시 API 키 | - | ✅ |
| `SEOUL_API_BASE_URL` | 서울시 API URL | http://openapi.seoul.go.kr:8088 | ❌ |
| `CACHE_TTL_MINUTES` | 캐시 TTL (분) | 1 | ❌ |
| `ALLOWED_ORIGINS` | CORS 허용 도메인 | http://localhost:5174 | ❌ |
| `LOG_LEVEL` | 로그 레벨 | info | ❌ |

### .env.example

```bash
# 서버 설정
PORT=3002
NODE_ENV=development

# 서울시 API 설정
SEOUL_API_KEY=your_seoul_api_key_here
SEOUL_API_BASE_URL=http://openapi.seoul.go.kr:8088

# 캐시 설정
CACHE_TTL_MINUTES=1

# CORS 설정
ALLOWED_ORIGINS=http://localhost:5174,http://localhost:3000

# 로깅 설정
LOG_LEVEL=info
```

## 🛠️ 개발 가이드

### 프로젝트 구조

```
comparison-service/
├── src/
│   ├── __tests__/          # 테스트 파일
│   │   ├── services/       # 서비스 단위 테스트
│   │   ├── routes/         # API 통합 테스트
│   │   └── setup.ts        # 테스트 설정
│   ├── config/             # 설정 파일
│   │   └── index.ts        # 환경변수 및 설정
│   ├── data/               # 정적 데이터
│   │   └── seoulPlaces.json # 서울시 장소 데이터
│   ├── middleware/         # Express 미들웨어
│   │   ├── index.ts        # 미들웨어 통합
│   │   ├── rateLimiter.ts  # 요청 제한
│   │   └── validation.ts   # 요청 유효성 검사
│   ├── routes/             # API 라우트
│   │   ├── comparison.ts   # 비교 API
│   │   ├── health.ts       # 헬스체크 API
│   │   └── index.ts        # 라우트 통합
│   ├── services/           # 비즈니스 로직
│   │   ├── cacheService.ts # 캐시 서비스
│   │   ├── comparisonService.ts # 비교 분석 서비스
│   │   ├── nlpService.ts   # 자연어 처리 서비스
│   │   └── seoulApiService.ts # 서울시 API 서비스
│   ├── types/              # TypeScript 타입 정의
│   │   └── index.ts        # 공통 타입
│   ├── app.ts              # Express 앱 설정
│   └── server.ts           # 서버 시작점
├── dist/                   # 빌드 결과물
├── coverage/               # 테스트 커버리지 리포트
├── jest.config.js          # Jest 테스트 설정
├── package.json
├── tsconfig.json
└── README.md
```

### 개발 스크립트

```bash
# 개발 서버 실행 (자동 재시작)
npm run dev

# TypeScript 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 테스트 실행
npm test

# 테스트 (watch 모드)
npm run test:watch

# 테스트 커버리지
npm test -- --coverage

# 코드 린팅
npm run lint

# 코드 린팅 (자동 수정)
npm run lint:fix
```

### 코딩 컨벤션

- **언어**: TypeScript
- **코드 스타일**: ESLint + Prettier
- **네이밍**: camelCase (변수, 함수), PascalCase (클래스, 인터페이스)
- **파일명**: camelCase.ts
- **로깅**: 구조화된 로깅 (JSON 형태)

### 기여 가이드

1. **브랜치 생성**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **개발 및 테스트**
   ```bash
   npm run dev
   npm test
   ```

3. **코드 품질 확인**
   ```bash
   npm run lint
   npm test -- --coverage
   ```

4. **커밋 및 푸시**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

## 🧪 테스트

### 테스트 실행

```bash
# 모든 테스트 실행
npm test

# 특정 테스트 파일 실행
npm test -- comparisonService.test.ts

# 커버리지 포함 테스트
npm test -- --coverage

# Watch 모드
npm run test:watch
```

### 테스트 구조

- **단위 테스트**: 개별 서비스 및 유틸리티 함수
- **통합 테스트**: API 엔드포인트 및 서비스 간 연동
- **모킹**: 외부 API 및 의존성 모킹

### 테스트 커버리지

현재 테스트 커버리지: **51.71%**

- ComparisonService: 79.29%
- NLPService: 93.18%
- API Routes: 81.08%

## 🔧 트러블슈팅

### 일반적인 문제

#### 1. 포트 충돌
**증상**: `EADDRINUSE: address already in use :::3002`

**해결방법**:
```bash
# 다른 포트 사용
PORT=3003 npm run dev

# 또는 .env 파일에서 포트 변경
echo "PORT=3003" >> .env
```

#### 2. 서울시 API 키 오류
**증상**: `⚠️ SEOUL_API_KEY가 설정되지 않았습니다.`

**해결방법**:
```bash
# .env 파일에 실제 API 키 설정
echo "SEOUL_API_KEY=your_actual_api_key" >> .env
```

#### 3. CORS 오류
**증상**: 프론트엔드에서 `Access-Control-Allow-Origin` 오류

**해결방법**:
```bash
# .env 파일에서 허용 도메인 추가
ALLOWED_ORIGINS=http://localhost:5174,http://localhost:3000,http://your-domain.com
```

#### 4. 메모리 부족
**증상**: 서비스가 느려지거나 응답하지 않음

**해결방법**:
```bash
# 캐시 TTL 단축
CACHE_TTL_MINUTES=1

# 또는 캐시 초기화
curl -X POST http://localhost:3002/api/comparison/cache/clear
```

#### 5. 서울시 API 응답 지연
**증상**: API 응답이 매우 느림

**해결방법**:
- 캐시 활용 (기본 1분 TTL)
- 요청 장소 수 제한 (최대 10개)
- 병렬 처리 활용

### 로그 분석

```bash
# 개발 환경에서 상세 로그 확인
LOG_LEVEL=debug npm run dev

# 프로덕션 환경에서 에러 로그만 확인
LOG_LEVEL=error npm start
```

### 성능 모니터링

서비스는 다음 성능 지표를 제공합니다:

- **응답 시간**: API 응답 시간 측정
- **메모리 사용량**: 힙 메모리 사용량
- **캐시 히트율**: 캐시 효율성
- **API 호출 성공률**: 외부 API 연동 안정성

### 지원

문제가 지속되는 경우:

1. **로그 확인**: 서비스 로그에서 에러 메시지 확인
2. **환경변수 검증**: 필수 환경변수 설정 확인
3. **네트워크 연결**: 서울시 API 연결 상태 확인
4. **이슈 리포트**: GitHub Issues에 문제 상황 보고

## 📈 성능 및 제한사항

### 성능 지표

- **평균 응답 시간**: < 500ms (캐시 히트 시 < 50ms)
- **동시 요청 처리**: 100 req/min (Rate Limiting)
- **메모리 사용량**: < 128MB
- **캐시 TTL**: 1분 (설정 가능)

### 제한사항

- **최대 비교 장소**: 10개
- **요청 제한**: 100회/분
- **캐시 크기**: 메모리 기반 (재시작 시 초기화)
- **지원 지역**: 서울시 한정

## 🚀 로드맵

### v1.1 (예정)
- [ ] 실시간 WebSocket 지원
- [ ] 사용자 선호도 기반 추천
- [ ] 히스토리 데이터 분석

### v1.2 (예정)
- [ ] Redis 캐시 지원
- [ ] 다중 지역 지원 (부산, 대구 등)
- [ ] GraphQL API 지원

### v2.0 (예정)
- [ ] 머신러닝 기반 예측
- [ ] 실시간 알림 서비스
- [ ] 모바일 앱 지원

---

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🤝 기여하기

기여를 환영합니다! [CONTRIBUTING.md](CONTRIBUTING.md)를 참조하여 기여 가이드라인을 확인하세요.

---

**Div4u Comparison Service** - 더 나은 서울 생활을 위한 혼잡도 비교 서비스