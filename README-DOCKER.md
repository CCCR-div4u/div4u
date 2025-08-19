# Docker 컨테이너화 완료 🐳

Seoul Congestion Service V2가 성공적으로 Docker 컨테이너화되었습니다.

## 📦 생성된 파일들

### Docker 설정 파일
- `frontend/Dockerfile` - 프론트엔드 프로덕션 이미지 (Nginx + React)
- `frontend/Dockerfile.dev` - 프론트엔드 개발 이미지
- `backend/Dockerfile` - 백엔드 프로덕션 이미지
- `backend/Dockerfile.dev` - 백엔드 개발 이미지
- `docker-compose.yml` - 프로덕션 환경 구성
- `docker-compose.dev.yml` - 개발 환경 구성

### 편의 스크립트
- `docker-scripts.sh` - Linux/Mac용 Docker 관리 스크립트
- `docker-scripts.bat` - Windows용 Docker 관리 스크립트

### 설정 파일
- `.env.example` - 환경변수 예시 파일
- `frontend/nginx.conf` - Nginx 설정 (API 프록시 포함)
- `test-docker.js` - Docker 컨테이너 통합 테스트 스크립트

## 🚀 사용 방법

### 1. 환경 설정
```bash
# 환경변수 파일 생성
cp .env.example .env

# .env 파일에서 SEOUL_API_KEY 설정
# SEOUL_API_KEY=your_actual_api_key_here
```

### 2. 개발 환경 실행
```bash
# Linux/Mac
./docker-scripts.sh dev

# Windows
docker-scripts.bat dev

# 또는 직접 명령어
docker-compose -f docker-compose.dev.yml up --build
```

### 3. 프로덕션 환경 실행
```bash
# Linux/Mac
./docker-scripts.sh prod

# Windows
docker-scripts.bat prod

# 또는 직접 명령어
docker-compose up --build
```

### 4. 서비스 접속
- **프론트엔드**: http://localhost:5174
- **백엔드 API**: http://localhost:3001
- **헬스체크**: http://localhost:3001/api/health

## 🧪 테스트

### Docker 컨테이너 통합 테스트
```bash
# 컨테이너 실행 후 별도 터미널에서
node test-docker.js
```

### 개별 서비스 테스트
```bash
# 백엔드 헬스체크
curl http://localhost:3001/api/health

# API 테스트
curl -X POST http://localhost:3001/api/congestion/query \
  -H "Content-Type: application/json" \
  -d '{"query":"강남역 혼잡도 알려줘"}'

# 프론트엔드 접근
curl http://localhost:5174
```

## 📊 모니터링

### 컨테이너 상태 확인
```bash
# 스크립트 사용
./docker-scripts.sh status

# 직접 명령어
docker-compose ps
docker-compose -f docker-compose.dev.yml ps
```

### 로그 확인
```bash
# 전체 로그
./docker-scripts.sh logs dev

# 특정 서비스 로그
./docker-scripts.sh logs-service backend dev
./docker-scripts.sh logs-service frontend dev
```

### 리소스 사용량
```bash
docker stats
```

## 🔧 관리 명령어

### 컨테이너 중지
```bash
./docker-scripts.sh stop
```

### 컨테이너 및 볼륨 정리
```bash
./docker-scripts.sh clean
```

### 이미지 다시 빌드
```bash
# 개발 환경
docker-compose -f docker-compose.dev.yml build --no-cache

# 프로덕션 환경
docker-compose build --no-cache
```

## 🌐 네트워크 구성

### 개발 환경
- 프론트엔드: 포트 5174 (Vite 개발 서버)
- 백엔드: 포트 3001 (Express 서버)
- 내부 네트워크: `kiro-network`

### 프로덕션 환경
- 프론트엔드: 포트 5174 (Nginx)
- 백엔드: 포트 3001 (Express 서버)
- API 프록시: Nginx가 `/api/*` 요청을 백엔드로 전달
- 내부 네트워크: `kiro-network`

## 🔒 보안 설정

### Nginx 보안 헤더
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Content-Security-Policy 설정

### 환경변수 보안
- API 키는 환경변수로 관리
- .env 파일은 .gitignore에 포함
- 프로덕션에서는 Docker secrets 사용 권장

## 🐛 트러블슈팅

### 포트 충돌
```bash
# 포트 사용 중인 프로세스 확인
netstat -tulpn | grep :3001
netstat -tulpn | grep :5174

# 기존 서비스 중지
./docker-scripts.sh stop
```

### 빌드 실패
```bash
# 캐시 없이 다시 빌드
docker-compose build --no-cache

# Docker 시스템 정리
docker system prune -f
```

### API 연결 문제
```bash
# 네트워크 확인
docker network ls
docker network inspect kiro_kiro-network

# 컨테이너 간 통신 테스트
docker exec -it kiro-frontend-dev ping backend
```

## 📈 성능 최적화

### 프론트엔드
- Multi-stage build로 이미지 크기 최적화
- Nginx gzip 압축 활성화
- 정적 파일 캐싱 설정

### 백엔드
- Node.js Alpine 이미지 사용
- 프로덕션 의존성만 설치
- 헬스체크 구성

### 네트워크
- 내부 네트워크로 서비스 간 통신 최적화
- API 프록시로 CORS 문제 해결

## 🎯 다음 단계

1. **Kubernetes 배포**: `21. Kubernetes 배포 매니페스트 작성` 작업 진행
2. **성능 최적화**: 이미지 크기 최적화, 캐싱 전략 개선
3. **모니터링**: Prometheus, Grafana 연동
4. **CI/CD**: GitHub Actions를 통한 자동 배포 파이프라인 구축

---

✅ **Docker 컨테이너화 작업 완료!**

이제 Seoul Congestion Service V2를 Docker로 쉽게 배포하고 관리할 수 있습니다.