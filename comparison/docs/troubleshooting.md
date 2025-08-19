# Troubleshooting Guide

이 가이드는 Div4u Comparison Service 사용 중 발생할 수 있는 문제들과 해결 방법을 제공합니다.

## 🚨 긴급 문제 해결

### 서비스가 시작되지 않는 경우

1. **포트 확인**
   ```bash
   netstat -ano | findstr :3002  # Windows
   lsof -i :3002                 # macOS/Linux
   ```

2. **환경변수 확인**
   ```bash
   node -e "console.log('API Key:', process.env.SEOUL_API_KEY ? '✅' : '❌')"
   ```

3. **의존성 재설치**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **서비스 강제 재시작**
   ```bash
   pkill -f "comparison-service"  # 프로세스 종료
   npm run dev                    # 재시작
   ```

## 📋 문제 분류별 해결 방법

### 🚀 서버 시작 문제

#### 문제: `EADDRINUSE: address already in use`

**증상**:
```
Error: listen EADDRINUSE: address already in use :::3002
```

**원인**: 포트 3002가 이미 사용 중

**해결방법**:
```bash
# 방법 1: 다른 포트 사용
PORT=3003 npm run dev

# 방법 2: 기존 프로세스 종료
# Windows
netstat -ano | findstr :3002
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3002
kill -9 <PID>

# 방법 3: .env 파일 수정
echo "PORT=3003" >> .env
```

#### 문제: `Required environment variable SEOUL_API_KEY is not set`

**증상**:
```
Error: Required environment variable SEOUL_API_KEY is not set
```

**원인**: 서울시 API 키가 설정되지 않음

**해결방법**:
```bash
# 1. .env 파일 확인
cat .env | grep SEOUL_API_KEY

# 2. API 키 설정
echo "SEOUL_API_KEY=your_actual_api_key" >> .env

# 3. 환경변수 직접 설정
export SEOUL_API_KEY=your_actual_api_key

# 4. 서비스 재시작
npm run dev
```

#### 문제: `Cannot find module` 오류

**증상**:
```
Error: Cannot find module 'express'
```

**원인**: 의존성 패키지가 설치되지 않음

**해결방법**:
```bash
# 1. 의존성 재설치
npm install

# 2. 캐시 정리 후 재설치
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 3. Node.js 버전 확인
node --version  # 18.0.0 이상 필요
```

### 🌐 API 연동 문제

#### 문제: 서울시 API 연결 실패

**증상**:
```
❌ Core API error for 홍대: Error: Network Error
```

**원인**: 
- 네트워크 연결 문제
- API 키 오류
- 서울시 API 서버 문제

**해결방법**:
```bash
# 1. 네트워크 연결 테스트
curl "http://openapi.seoul.go.kr:8088/sample/json/citydata_ppltn/1/5/POI001"

# 2. API 키 유효성 확인
curl "http://openapi.seoul.go.kr:8088/${SEOUL_API_KEY}/json/citydata_ppltn/1/5/POI001"

# 3. 프록시 설정 (회사 네트워크)
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# 4. DNS 설정 확인
nslookup openapi.seoul.go.kr
```

#### 문제: `정보없음` 응답이 계속 반환됨

**증상**:
```json
{
  "crowdLevel": "정보없음",
  "message": "혼잡도 정보를 가져올 수 없습니다."
}
```

**원인**:
- 잘못된 장소명
- API 키 권한 문제
- 서울시 API 데이터 없음

**해결방법**:
```bash
# 1. 지원되는 장소명 확인
curl http://localhost:3002/api/comparison/info

# 2. 테스트 엔드포인트 사용
curl -X POST http://localhost:3002/api/comparison/test \
  -H "Content-Type: application/json" \
  -d '{"locations": ["테스트1", "테스트2"]}'

# 3. 실제 지원 장소로 테스트
curl -X POST http://localhost:3002/api/comparison/compare \
  -H "Content-Type: application/json" \
  -d '{"locations": ["홍대 관광특구", "명동 관광특구"]}'
```

### 🔒 CORS 및 보안 문제

#### 문제: CORS 오류

**증상**:
```
Access to fetch at 'http://localhost:3002' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**원인**: 허용되지 않은 도메인에서 API 접근

**해결방법**:
```bash
# 1. .env 파일에 도메인 추가
ALLOWED_ORIGINS=http://localhost:5174,http://localhost:5173,http://localhost:3000

# 2. 모든 도메인 허용 (개발용만)
ALLOWED_ORIGINS=*

# 3. 서비스 재시작
npm run dev

# 4. 브라우저 캐시 정리
# Chrome: F12 → Network → Disable cache
```

#### 문제: Rate Limit 초과

**증상**:
```json
{
  "success": false,
  "error": "Rate limit exceeded. Try again later.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

**원인**: 분당 100회 요청 제한 초과

**해결방법**:
```bash
# 1. 잠시 대기 후 재시도 (1분)

# 2. 캐시 활용으로 요청 수 줄이기
CACHE_TTL_MINUTES=5

# 3. 개발 환경에서 Rate Limit 조정 (코드 수정 필요)
# src/middleware/rateLimiter.ts에서 windowMs, max 값 조정
```

### 💾 캐시 관련 문제

#### 문제: 데이터가 업데이트되지 않음

**증상**: 실제 혼잡도가 변경되었는데 같은 결과 반환

**원인**: 캐시된 데이터 사용

**해결방법**:
```bash
# 1. 캐시 초기화
curl -X POST http://localhost:3002/api/comparison/cache/clear

# 2. 캐시 TTL 단축
CACHE_TTL_MINUTES=1

# 3. 캐시 비활성화 (개발용)
CACHE_TTL_MINUTES=0

# 4. 서비스 재시작
npm run dev
```

#### 문제: 메모리 사용량 증가

**증상**: 서비스가 점점 느려지고 메모리 사용량이 증가

**원인**: 캐시 데이터 누적

**해결방법**:
```bash
# 1. 메모리 사용량 확인
curl http://localhost:3002/api/comparison/health

# 2. 캐시 정리
curl -X POST http://localhost:3002/api/comparison/cache/clear

# 3. 캐시 TTL 단축
CACHE_TTL_MINUTES=1

# 4. 서비스 재시작 (메모리 초기화)
npm run dev
```

### 🧪 테스트 관련 문제

#### 문제: 테스트 실행 실패

**증상**:
```
npm test
> jest
Test suite failed to run
```

**원인**: 테스트 환경 설정 문제

**해결방법**:
```bash
# 1. 테스트 의존성 설치
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest

# 2. Jest 설정 확인
cat jest.config.js

# 3. TypeScript 컴파일 확인
npx tsc --noEmit

# 4. 개별 테스트 실행
npm test -- --testNamePattern="ComparisonService"
```

#### 문제: 테스트 타임아웃

**증상**:
```
Timeout - Async callback was not invoked within the 5000ms timeout
```

**원인**: 외부 API 호출로 인한 지연

**해결방법**:
```bash
# 1. 테스트 타임아웃 증가
npm test -- --testTimeout=10000

# 2. Mock 사용 확인
# __tests__ 파일에서 axios mock 설정 확인

# 3. 네트워크 독립적 테스트
npm test -- --testPathIgnorePatterns=integration
```

### 🔧 성능 문제

#### 문제: API 응답 속도 느림

**증상**: API 응답이 5초 이상 소요

**원인**:
- 서울시 API 응답 지연
- 캐시 미사용
- 네트워크 문제

**해결방법**:
```bash
# 1. 캐시 활성화 확인
CACHE_TTL_MINUTES=5

# 2. 병렬 처리 확인 (코드 레벨)
# Promise.all 사용 여부 확인

# 3. 네트워크 지연 측정
curl -w "@curl-format.txt" -o /dev/null -s http://openapi.seoul.go.kr:8088/sample/json/citydata_ppltn/1/5/POI001

# 4. 로컬 네트워크 최적화
# DNS 서버 변경: 8.8.8.8, 1.1.1.1
```

#### 문제: 메모리 누수

**증상**: 장시간 실행 시 메모리 사용량 지속 증가

**원인**: 
- 캐시 정리 미작동
- 이벤트 리스너 정리 안됨
- 타이머 정리 안됨

**해결방법**:
```bash
# 1. 메모리 프로파일링
npm install -g clinic
clinic doctor -- node dist/server.js

# 2. 힙 덤프 분석
node --inspect dist/server.js
# Chrome DevTools에서 Memory 탭 사용

# 3. 캐시 정리 주기 확인
# src/services/cacheService.ts의 cleanup 메서드 확인

# 4. 프로세스 재시작 스케줄링 (임시 해결)
pm2 start dist/server.js --max-memory-restart 200M
```

## 🔍 디버깅 도구

### 로그 분석

```bash
# 상세 디버그 로그 활성화
LOG_LEVEL=debug npm run dev

# 특정 모듈 로그만 확인
DEBUG=comparison:* npm run dev

# 로그 파일로 저장
npm run dev > logs/app.log 2>&1
```

### 네트워크 디버깅

```bash
# HTTP 요청 추적
npm install -g mitmproxy
mitmdump -s debug_script.py

# 네트워크 지연 시뮬레이션
tc qdisc add dev eth0 root netem delay 100ms  # Linux
```

### 성능 모니터링

```bash
# CPU 및 메모리 모니터링
top -p $(pgrep -f comparison-service)

# Node.js 성능 프로파일링
node --prof dist/server.js
node --prof-process isolate-*.log > processed.txt
```

## 📞 지원 요청

### 이슈 리포트 작성 시 포함할 정보

1. **환경 정보**
   ```bash
   node --version
   npm --version
   echo $NODE_ENV
   echo $SEOUL_API_KEY | head -c 10  # 앞 10자리만
   ```

2. **에러 로그**
   ```bash
   # 전체 에러 스택 트레이스 포함
   LOG_LEVEL=debug npm run dev 2>&1 | tee error.log
   ```

3. **재현 단계**
   ```bash
   # 문제를 재현할 수 있는 curl 명령어
   curl -X POST http://localhost:3002/api/comparison/compare \
     -H "Content-Type: application/json" \
     -d '{"locations": ["문제가 되는 장소"]}'
   ```

4. **시스템 정보**
   ```bash
   # OS 정보
   uname -a  # Linux/macOS
   systeminfo | findstr /B /C:"OS Name" /C:"OS Version"  # Windows
   ```

### 긴급 지원

심각한 프로덕션 문제의 경우:

1. **서비스 임시 중단**
   ```bash
   pm2 stop comparison-service
   ```

2. **롤백 준비**
   ```bash
   git log --oneline -10  # 최근 커밋 확인
   git checkout <previous-stable-commit>
   ```

3. **헬스체크 모니터링**
   ```bash
   while true; do
     curl -s http://localhost:3002/api/comparison/health | jq .status
     sleep 10
   done
   ```

## 📚 추가 리소스

### 관련 문서
- [개발 환경 설정](./development-setup.md)
- [환경변수 가이드](./environment-variables.md)
- [API 문서](./api.md)

### 외부 리소스
- [Node.js 디버깅 가이드](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [Express.js 에러 처리](https://expressjs.com/en/guide/error-handling.html)
- [Jest 트러블슈팅](https://jestjs.io/docs/troubleshooting)

### 모니터링 도구
- [PM2](https://pm2.keymetrics.io/): 프로세스 관리
- [New Relic](https://newrelic.com/): APM 모니터링
- [Sentry](https://sentry.io/): 에러 추적

---

이 가이드에서 해결되지 않는 문제가 있다면, GitHub Issues에 상세한 정보와 함께 문의해 주세요.