# Kubernetes 배포 가이드 ⚓

Seoul Congestion Service V2를 Kubernetes 클러스터에 배포하는 방법입니다.

## 📋 사전 요구사항

### 필수 도구
- **kubectl**: Kubernetes 명령줄 도구
- **Docker**: 컨테이너 이미지 빌드용
- **Kubernetes 클러스터**: 로컬(minikube, kind) 또는 클라우드(EKS, GKE, AKS)

### 클러스터 요구사항
- **Kubernetes 버전**: 1.20+
- **Ingress Controller**: nginx-ingress (권장)
- **Metrics Server**: HPA 사용을 위해 필요
- **최소 리소스**: CPU 2코어, 메모리 4GB

## 🚀 빠른 시작

### 1. 환경 준비
```bash
# kubectl 설치 확인
kubectl version --client

# 클러스터 연결 확인
kubectl cluster-info

# Ingress Controller 설치 (필요한 경우)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
```

### 2. API 키 설정
```bash
# Secret 파일에서 API 키 설정
# Base64로 인코딩된 서울시 API 키 생성
echo -n "your_seoul_api_key" | base64

# k8s/secret.yaml 파일에서 seoul-api-key 값을 위에서 생성한 값으로 변경
```

### 3. 배포 실행

#### 스크립트 사용 (권장)
```bash
# Linux/Mac
cd k8s
chmod +x deploy.sh

# Docker 이미지 빌드
./deploy.sh build-images

# 전체 배포
./deploy.sh deploy

# Windows
cd k8s
deploy.bat build-images
deploy.bat deploy
```

#### 수동 배포
```bash
cd k8s

# 순서대로 배포
kubectl apply -f namespace.yaml
kubectl apply -f secret.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
kubectl apply -f network-policy.yaml
```

### 4. 서비스 접속

#### Ingress를 통한 접속
```bash
# /etc/hosts 파일에 추가 (로컬 클러스터의 경우)
echo "$(kubectl get ingress div4u-ingress -n div4u -o jsonpath='{.status.loadBalancer.ingress[0].ip}') div4u.local" >> /etc/hosts

# 브라우저에서 접속
# http://div4u.local
```

#### 포트 포워딩을 통한 접속
```bash
# 스크립트 사용
./deploy.sh port-forward

# 수동 포트 포워딩
kubectl port-forward service/div4u-frontend-service 8080:80 -n div4u &
kubectl port-forward service/div4u-backend-service 8081:3001 -n div4u &

# 접속 URL
# 프론트엔드: http://localhost:8080
# 백엔드: http://localhost:8081
```

## 📊 모니터링 및 관리

### 배포 상태 확인
```bash
# 스크립트 사용
./deploy.sh status

# 수동 확인
kubectl get all -n div4u
kubectl get ingress -n div4u
kubectl get hpa -n div4u
```

### 로그 확인
```bash
# 스크립트 사용
./deploy.sh logs backend
./deploy.sh logs frontend

# 수동 로그 확인
kubectl logs -f deployment/div4u-backend -n div4u
kubectl logs -f deployment/div4u-frontend -n div4u
```

### 리소스 사용량 확인
```bash
# Pod 리소스 사용량
kubectl top pods -n div4u

# Node 리소스 사용량
kubectl top nodes

# HPA 상태
kubectl get hpa -n div4u
```

## 🔧 관리 명령어

### 애플리케이션 업데이트
```bash
# 스크립트 사용
./deploy.sh update

# 수동 업데이트
kubectl rollout restart deployment/div4u-backend -n div4u
kubectl rollout restart deployment/div4u-frontend -n div4u

# 업데이트 상태 확인
kubectl rollout status deployment/div4u-backend -n div4u
```

### 스케일링
```bash
# 수동 스케일링
kubectl scale deployment div4u-backend --replicas=3 -n div4u
kubectl scale deployment div4u-frontend --replicas=3 -n div4u

# HPA 상태 확인
kubectl get hpa -n div4u
```

### 애플리케이션 삭제
```bash
# 스크립트 사용
./deploy.sh delete

# 수동 삭제
kubectl delete namespace div4u
```

## 📁 파일 구조

```
k8s/
├── namespace.yaml              # 네임스페이스 정의
├── secret.yaml                 # API 키 및 ConfigMap
├── backend-deployment.yaml     # 백엔드 Deployment
├── backend-service.yaml        # 백엔드 Service
├── frontend-deployment.yaml    # 프론트엔드 Deployment
├── frontend-service.yaml       # 프론트엔드 Service
├── ingress.yaml               # Ingress 설정
├── hpa.yaml                   # Horizontal Pod Autoscaler
├── network-policy.yaml        # 네트워크 정책
├── deploy.sh                  # Linux/Mac 배포 스크립트
├── deploy.bat                 # Windows 배포 스크립트
└── README.md                  # 이 파일
```

## 🔒 보안 설정

### Network Policy
- Pod 간 통신 제한
- 외부 트래픽 제어
- DNS 및 API 호출 허용

### Secret 관리
- API 키는 Kubernetes Secret으로 관리
- Base64 인코딩으로 저장
- 환경변수로 Pod에 주입

### 리소스 제한
- CPU/메모리 requests 및 limits 설정
- HPA를 통한 자동 스케일링
- 리소스 사용량 모니터링

## 🌐 클라우드별 설정

### AWS EKS
```bash
# EKS 클러스터 생성
eksctl create cluster --name div4u --region ap-northeast-2

# ALB Ingress Controller 설치
kubectl apply -k "github.com/aws/eks-charts/stable/aws-load-balancer-controller//crds?ref=master"
```

### Google GKE
```bash
# GKE 클러스터 생성
gcloud container clusters create div4u --zone=asia-northeast3-a

# Ingress 설정
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/gce/deploy.yaml
```

### Azure AKS
```bash
# AKS 클러스터 생성
az aks create --resource-group myResourceGroup --name div4u --node-count 2

# Application Gateway Ingress Controller 설치
kubectl apply -f https://raw.githubusercontent.com/Azure/application-gateway-kubernetes-ingress/master/docs/examples/aspnetapp.yaml
```

## 🐛 트러블슈팅

### Pod 시작 실패
```bash
# Pod 상태 확인
kubectl describe pod <pod-name> -n div4u

# 이벤트 확인
kubectl get events -n div4u --sort-by='.lastTimestamp'

# 로그 확인
kubectl logs <pod-name> -n div4u
```

### Ingress 접속 불가
```bash
# Ingress 상태 확인
kubectl describe ingress div4u-ingress -n div4u

# Ingress Controller 확인
kubectl get pods -n ingress-nginx

# DNS 설정 확인
nslookup div4u.local
```

### HPA 작동 안함
```bash
# Metrics Server 확인
kubectl get pods -n kube-system | grep metrics-server

# HPA 상태 확인
kubectl describe hpa div4u-backend-hpa -n div4u

# 리소스 메트릭 확인
kubectl top pods -n div4u
```

### 이미지 Pull 실패
```bash
# 이미지 확인
docker images | grep div4u

# 이미지 태그 확인
kubectl describe pod <pod-name> -n div4u

# ImagePullPolicy 확인
kubectl get deployment div4u-backend -n div4u -o yaml | grep imagePullPolicy
```

## 📈 성능 최적화

### 리소스 튜닝
- CPU/메모리 requests/limits 조정
- HPA 메트릭 임계값 조정
- Node 리소스 모니터링

### 네트워크 최적화
- Service Mesh 도입 고려
- 로드 밸런싱 전략 최적화
- 캐싱 전략 구현

### 스토리지 최적화
- Persistent Volume 사용 고려
- 로그 로테이션 설정
- 임시 파일 정리

## 🎯 다음 단계

1. **모니터링**: Prometheus + Grafana 설치
2. **로깅**: ELK Stack 또는 Fluentd 설정
3. **CI/CD**: GitOps 파이프라인 구축
4. **보안**: Pod Security Standards 적용
5. **백업**: ETCD 백업 전략 수립

---

✅ **Kubernetes 배포 매니페스트 작성 완료!**

이제 Seoul Congestion Service V2를 Kubernetes 클러스터에 안전하고 확장 가능하게 배포할 수 있습니다.