# Docker 배포 가이드 🐳

Seoul Congestion Service V2를 Docker로 배포하는 방법입니다.

## 🚀 빠른 시작

### 1. 환경 변수 설정
```bash
# .env.example을 .env로 복사
cp .env.example .env

# 서울시 API 키 설정
# .env 파일에서 SEOUL_API_KEY 값을 실제 API 키로 변경
```

### 2. Docker Compose로 실행 (권장)

#### 편리한 스크립트 사용 (권장)
```bash
# Linux/Mac
chmod +x docker-scripts.sh
./docker-scripts.sh dev              # 개발 환경 실행
./docker-scripts.sh prod             # 프로덕션 환경 실행

# Windows
docker-scripts.bat dev               # 개발 환경 실행
docker-scripts.bat prod              # 프로덕션 환경 실행
```

#### 직접 Docker Compose 명령어 사용
```bash
# 개발 환경
docker-compose -f docker-compose.dev.yml up --build

# 프로덕션 환경
docker-compose up --build
```

### 2. 개별 컨테이너 빌드 및 실행

```bash
# 백엔드 빌드 및 실행
cd backend
docker build -t div4u-backend-v2 .
docker run -d -p 3001:3001 --name backend-v2 div4u-backend-v2

# 프론트엔드 빌드 및 실행
cd frontend
docker build -t div4u-frontend-v2 .
docker run -d -p 5174:80 --name frontend-v2 div4u-frontend-v2
```

## 📋 서비스 접속

- **프론트엔드**: http://localhost:5174
- **백엔드 API**: http://localhost:3001
- **헬스체크**: http://localhost:3001/api/health

## 🔧 유용한 명령어

### 스크립트를 통한 관리 (권장)
```bash
# Linux/Mac
./docker-scripts.sh help             # 도움말 확인
./docker-scripts.sh status           # 컨테이너 상태 확인
./docker-scripts.sh logs dev         # 개발 환경 로그 확인
./docker-scripts.sh logs-service backend dev  # 백엔드 로그만 확인
./docker-scripts.sh stop             # 모든 컨테이너 중지
./docker-scripts.sh clean            # 컨테이너 및 볼륨 정리

# Windows
docker-scripts.bat help              # 도움말 확인
docker-scripts.bat status            # 컨테이너 상태 확인
docker-scripts.bat logs dev          # 개발 환경 로그 확인
docker-scripts.bat logs-service backend dev  # 백엔드 로그만 확인
docker-scripts.bat stop              # 모든 컨테이너 중지
docker-scripts.bat clean             # 컨테이너 및 볼륨 정리
```

### 직접 Docker Compose 명령어
```bash
# 컨테이너 상태 확인
docker-compose -f docker-compose.dev.yml ps

# 로그 확인
docker-compose -f docker-compose.dev.yml logs -f

# 특정 서비스 로그만 확인
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend

# 컨테이너 중지
docker-compose -f docker-compose.dev.yml down

# 컨테이너 재시작
docker-compose -f docker-compose.dev.yml restart
```

### 이미지 관리
```bash
# 이미지 다시 빌드 (캐시 없이)
docker-compose -f docker-compose.dev.yml build --no-cache

# 사용하지 않는 이미지 정리
docker image prune -f

# 모든 컨테이너, 이미지, 볼륨 정리
docker system prune -a --volumes
```

## 🐛 트러블슈팅

### 포트 충돌 문제
```bash
# 포트 사용 중인 프로세스 확인
netstat -tulpn | grep :3001
netstat -tulpn | grep :5174

# 기존 V1 서비스 중지 후 V2 실행
```

### 컨테이너 빌드 실패
```bash
# 캐시 없이 다시 빌드
docker-compose -f docker-compose.dev.yml build --no-cache

# 개별 서비스 빌드
docker-compose -f docker-compose.dev.yml build backend
docker-compose -f docker-compose.dev.yml build frontend
```

### API 연결 문제
```bash
# 백엔드 헬스체크
curl http://localhost:3001/api/health

# 네트워크 확인
docker network ls
docker network inspect div4u-network
```

## 🌐 프로덕션 배포

### 환경 변수 설정
```bash
# .env.production 파일을 .env로 복사
cp .env.production .env

# 필요한 환경 변수 수정
export SEOUL_API_KEY=your_api_key
export FRONTEND_URL=https://your-domain.com
```

### 프로덕션 실행
```bash
docker-compose up -d
```

## 📊 모니터링

### 컨테이너 리소스 사용량
```bash
docker stats div4u-backend-v2 div4u-frontend-v2
```

### 헬스체크 상태
```bash
docker inspect --format='{{.State.Health.Status}}' div4u-backend-v2
docker inspect --format='{{.State.Health.Status}}' div4u-frontend-v2
```