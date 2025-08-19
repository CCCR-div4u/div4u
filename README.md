# Seoul Congestion Service V2 🐿️

포유(4U) 캐릭터와 함께하는 서울 실시간 혼잡도 서비스

[![CI/CD Pipeline](https://github.com/CCCR-div4u/div4u2/actions/workflows/deployment-pipeline.yaml/badge.svg)](https://github.com/CCCR-div4u/div4u2/actions/workflows/deployment-pipeline.yaml)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://github.com/CCCR-div4u/div4u2/pkgs/container/div4u2%2Ffrontend)
[![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=flat&logo=kubernetes&logoColor=white)](./k8s/)

## ✨ 주요 특징

- **포유 캐릭터 중심 UI**: 채팅 형태의 인터랙티브 인터페이스
- **감정 표현**: 혼잡도에 따라 변하는 포유의 표정과 메시지
- **서울시 120개 지점**: 공식 API 기반 실시간 혼잡도 정보
- **자연어 처리**: "강남역 혼잡해?" 같은 자연스러운 질의 지원
- **개발자 도구**: 테스트 및 디버깅을 위한 전용 도구 페이지
- **CI/CD 파이프라인**: GitHub Actions 기반 자동 배포
- **EKS MSA 아키텍처**: Kubernetes 기반 마이크로서비스 구조

## 🏗️ 아키텍처

자세한 트래픽 흐름과 아키텍처는 [**트래픽 흐름도**](./TRAFFIC_FLOW.md)를 참고하세요.

## 🚀 개발 서버 실행

### 백엔드 (포트 3001)
```bash
cd backend
npm install
npm run dev
```

### 프론트엔드 (포트 5174)
```bash
cd frontend
npm install
npm run dev
```

## 🌐 접속 주소

- **프론트엔드**: http://localhost:5174
- **백엔드 API**: http://localhost:3001

## 🎨 포유 캐릭터 이미지

다음 이미지들을 `frontend/public/images/foru/` 폴더에 넣어주세요:

- `main.png` - 기본/보통 상태
- `running_4u.png` - 로딩 중 (다녀오는 중)
- `crowd_4.png` - 붐빔 상태
- `crowd_3.png` - 약간 붐빔 상태  
- `crowd_1.png` - 여유 상태
- `none.png` - 정보없음 상태

## 📋 V1과의 차이점

### UI/UX 변경사항:
- **V1**: 검색 → 결과 카드 형태
- **V2**: 사용자 ↔ 포유 채팅 형태

### 레이아웃:
- **왼쪽**: 질의 입력 + 추천 + 검색 기록 (V1 스타일 유지)
- **오른쪽**: 포유와의 채팅 결과 (새로운 UX)

### 기능:
- 모든 기존 기능 유지 (추천 시스템, NLP, API 연동 등)
- 포유 캐릭터 감정 표현 추가
- 채팅 형태 결과 표시

## 🔄 V1 비교 테스트

- **V1**: http://localhost:5173 (기존 서비스)
- **V2**: http://localhost:5174 (새로운 서비스)

두 서비스를 동시에 실행하여 나란히 비교할 수 있습니다!

## 🐳 Docker 실행

### Docker Compose로 전체 실행
```bash
# 프로덕션 환경
docker-compose up -d

# 개발 환경
docker-compose -f docker-compose.dev.yml up -d
```

### 개별 컨테이너 실행
```bash
# 백엔드
docker build -t div4u-backend ./backend
docker run -p 3001:3001 div4u-backend

# 프론트엔드
docker build -t div4u-frontend ./frontend
docker run -p 80:80 div4u-frontend
```

## ☸️ Kubernetes 배포

### 빠른 배포
```bash
cd k8s
./deploy.sh deploy
```

### 상태 확인
```bash
./deploy.sh status
```

### 로그 확인
```bash
./deploy.sh logs backend
./deploy.sh logs frontend
```

### 로컬 접근
```bash
./deploy.sh port-forward
# 프론트엔드: http://localhost:8080
# 백엔드: http://localhost:8081
```

## 🔄 CI/CD 파이프라인

GitHub Actions를 통한 자동 배포:

1. **테스트**: 코드 품질 검사 및 단위 테스트
2. **빌드**: Docker 이미지 빌드
3. **푸시**: GitHub Container Registry에 이미지 푸시
4. **배포**: Kubernetes 클러스터에 자동 배포

자세한 내용은 [CICD.md](./CICD.md)를 참고하세요.

## 📁 프로젝트 구조

```
Kiro_Service_V2/
├── .github/workflows/     # GitHub Actions 워크플로우
├── backend/              # Node.js 백엔드 서버
├── frontend/             # React 프론트엔드 앱
├── k8s/                  # Kubernetes 매니페스트
├── specs/                # 프로젝트 명세서
├── docker-compose.yml    # Docker Compose 설정
├── CICD.md              # CI/CD 가이드
└── README.md            # 이 파일
```

## 🛠️ 기술 스택

### Frontend
- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **API Integration**: 서울시 공공데이터 API
- **Natural Language**: 자연어 처리 엔진
- **Testing**: Jest

### DevOps
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Registry**: GitHub Container Registry

## 🌟 주요 페이지

- **홈페이지**: 서비스 소개 및 주요 기능
- **실시간 혼잡도**: 포유와의 채팅 형태 질의응답
- **120개 지점**: 서울시 공식 혼잡도 모니터링 지점
- **개발자 도구**: API 테스트 및 디버깅 도구

## 🤝 기여하기

1. 이 저장소를 Fork합니다
2. 새로운 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

## 📞 지원

- **이슈 리포팅**: [GitHub Issues](https://github.com/cccr-div4u/div4u/issues)
- **문서**: [Wiki](https://github.com/cccr-div4u/div4u/wiki)
- **CI/CD 가이드**: [CICD.md](./CICD.md)