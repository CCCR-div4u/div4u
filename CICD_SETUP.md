# CICD 파이프라인 설정 가이드

## 개요
이 프로젝트는 GitHub Actions를 통해 AWS EKS 클러스터에 자동 배포되는 CICD 파이프라인을 구성합니다.

## 사전 요구사항

### 1. AWS 리소스
- EKS 클러스터 (`div4u-cluster`)
- ECR 리포지토리 3개:
  - `div4u-backend`
  - `div4u-frontend` 
  - `div4u-comparison-service`
- IAM 사용자 (GitHub Actions용)

### 2. GitHub Secrets 설정
다음 secrets를 GitHub 리포지토리에 추가해야 합니다:

```
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_ACCOUNT_ID=your-aws-account-id
```

## 빌드 프로세스

### Backend
- TypeScript 컴파일 (`npm run build`)
- Docker 이미지 빌드 및 ECR 푸시
- 포트: 3001

### Frontend  
- Vite 빌드 (`npm run build`)
- Nginx 기반 Docker 이미지
- 포트: 80

### Comparison Service
- TypeScript 컴파일 (`npm run build`)
- Docker 이미지 빌드 및 ECR 푸시
- 포트: 3002

## 배포 아키텍처

```
Internet → ALB Ingress → EKS Services → Pods
                      ├── Frontend (Nginx)
                      ├── Backend (Node.js)
                      └── Comparison Service (Node.js)
```

## 배포 트리거
- `main` 브랜치 푸시 시 프로덕션 배포
- `develop` 브랜치 푸시 시 스테이징 배포
- Pull Request 시 빌드 테스트

## 모니터링
- Kubernetes 헬스체크
- 리소스 제한 설정
- 로드밸런서를 통한 트래픽 분산

## 수동 배포 명령어

```bash
# ECR 로그인
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-northeast-2.amazonaws.com

# 이미지 빌드 및 푸시
docker build -t div4u-backend ./backend
docker tag div4u-backend:latest <account-id>.dkr.ecr.ap-northeast-2.amazonaws.com/div4u-backend:latest
docker push <account-id>.dkr.ecr.ap-northeast-2.amazonaws.com/div4u-backend:latest

# Kubernetes 배포
kubectl apply -f k8s/
```

## 트러블슈팅

### 빌드 실패 시
1. TypeScript 에러 확인
2. 의존성 설치 확인
3. 환경 변수 설정 확인

### 배포 실패 시
1. AWS 권한 확인
2. EKS 클러스터 상태 확인
3. ECR 리포지토리 존재 확인

### 서비스 접근 불가 시
1. Ingress 설정 확인
2. Service 및 Pod 상태 확인
3. 보안 그룹 설정 확인