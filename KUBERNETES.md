# Seoul Congestion Service V2 - Kubernetes 배포 가이드

## 🚀 빠른 시작

### 1. 전체 배포 (Docker 빌드 + Kubernetes 배포)
```bash
# 모든 서비스 빌드 및 배포
./k8s-deploy.sh
```

### 2. 설정만 업데이트 (빠른 테스트)
```bash
# ConfigMap, Ingress 등 설정만 업데이트
./k8s-local-test.sh
```

### 3. 상태 확인
```bash
# 배포 상태 확인
./k8s-status.sh
```

## 🔧 로컬 테스트

### 포트 포워딩
```bash
# 각 서비스별 포트 포워딩
kubectl port-forward service/div4u-frontend-service 8080:80 -n div4u
kubectl port-forward service/div4u-backend-service 8081:3001 -n div4u
kubectl port-forward service/div4u-comparison-service 8082:3002 -n div4u
```

### 브라우저 접속
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8081/api
- **Comparison API**: http://localhost:8082/api/comparison

### API 테스트
```bash
# 헬스체크
curl http://localhost:8081/api/health
curl http://localhost:8082/api/comparison/health

# 혼잡도 조회 테스트
curl -X POST http://localhost:8081/api/congestion/query \
  -H "Content-Type: application/json" \
  -d '{"query": "강남역", "serviceType": "realtime"}'

# 비교 서비스 테스트
curl -X POST http://localhost:8082/api/comparison/compare \
  -H "Content-Type: application/json" \
  -d '{"locations": ["강남역", "홍대입구역"]}'
```

## 🏗️ 아키텍처

### API 경로 구조
```
Ingress (www.div4u.com)
├── /                    → Frontend (SPA)
├── /api/*               → Backend Service
└── /api/comparison/*    → Comparison Service
```

### 서비스 간 통신
```
Frontend → Ingress → Backend/Comparison
Comparison → Backend (내부 서비스 통신)
```

## 📋 주요 변경사항 (Kubernetes 최적화)

### ✅ 완료된 수정사항
1. **Ingress 라우팅 개선**
   - Frontend, Backend, Comparison 모든 서비스 라우팅 추가
   - 경로 우선순위 설정 (`/api/comparison` > `/api` > `/`)

2. **서비스 간 통신 최적화**
   - Comparison Service: `localhost:3001` → `div4u-backend-service:3001`
   - Frontend: 절대 URL → 상대 경로 (`/api`, `/api/comparison`)

3. **환경변수 중앙 관리**
   - ConfigMap을 통한 모든 환경변수 관리
   - Docker 빌드 시점에 환경변수 적용

4. **배포 자동화**
   - 전체 배포 스크립트 (`k8s-deploy.sh`)
   - 빠른 테스트 스크립트 (`k8s-local-test.sh`)
   - 상태 확인 스크립트 (`k8s-status.sh`)

## 🛠️ 수동 배포 단계

### 1. 네임스페이스 및 ConfigMap
```bash
kubectl apply -f k8s/namespaces.yaml
kubectl apply -f k8s/configmap.yaml
```

### 2. Backend 배포
```bash
kubectl apply -f k8s/backend/backend-deployment.yaml
kubectl apply -f k8s/backend/backend-service.yaml
```

### 3. Comparison 배포
```bash
kubectl apply -f k8s/comparison/comparison-deployment.yaml
kubectl apply -f k8s/comparison/comparison-service.yaml
```

### 4. Frontend 배포
```bash
kubectl apply -f k8s/frontend/frontend-deployment.yaml
kubectl apply -f k8s/frontend/frontend-service.yaml
```

### 5. Ingress 적용
```bash
kubectl apply -f k8s/ingress-alb.yaml
```

## 🔍 트러블슈팅

### 일반적인 문제들

#### 1. Pod가 시작되지 않는 경우
```bash
# Pod 상태 확인
kubectl get pods -n div4u

# Pod 로그 확인
kubectl logs <pod-name> -n div4u

# Pod 상세 정보
kubectl describe pod <pod-name> -n div4u
```

#### 2. 서비스 간 통신 문제
```bash
# 서비스 확인
kubectl get services -n div4u

# DNS 해결 테스트
kubectl exec -it <pod-name> -n div4u -- nslookup div4u-backend-service
```

#### 3. Ingress 문제
```bash
# Ingress 상태 확인
kubectl get ingress -n div4u
kubectl describe ingress div4u-ingress -n div4u

# Ingress Controller 로그
kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
```

### 로그 확인
```bash
# 실시간 로그 확인
kubectl logs -f deployment/div4u-backend -n div4u
kubectl logs -f deployment/div4u-comparison -n div4u
kubectl logs -f deployment/div4u-frontend -n div4u

# 이전 로그 확인
kubectl logs deployment/div4u-backend -n div4u --previous
```

### 재시작
```bash
# 특정 배포 재시작
kubectl rollout restart deployment/div4u-backend -n div4u
kubectl rollout restart deployment/div4u-comparison -n div4u
kubectl rollout restart deployment/div4u-frontend -n div4u

# 모든 배포 재시작
kubectl rollout restart deployment -n div4u
```

## 📊 모니터링

### 리소스 사용량
```bash
# CPU/메모리 사용량
kubectl top pods -n div4u
kubectl top nodes

# 리소스 제한 확인
kubectl describe pod <pod-name> -n div4u | grep -A 5 "Limits\|Requests"
```

### 이벤트 확인
```bash
# 최근 이벤트
kubectl get events -n div4u --sort-by='.lastTimestamp'

# 특정 리소스 이벤트
kubectl describe deployment div4u-backend -n div4u
```

## 🔄 업데이트 및 롤백

### 이미지 업데이트
```bash
# 새 이미지로 업데이트
kubectl set image deployment/div4u-backend backend=harbor.bluesunnywings.com/div4u/div4u-backend:new-tag -n div4u

# 롤아웃 상태 확인
kubectl rollout status deployment/div4u-backend -n div4u
```

### 롤백
```bash
# 이전 버전으로 롤백
kubectl rollout undo deployment/div4u-backend -n div4u

# 특정 버전으로 롤백
kubectl rollout undo deployment/div4u-backend --to-revision=2 -n div4u

# 롤아웃 히스토리
kubectl rollout history deployment/div4u-backend -n div4u
```

## 🚀 프로덕션 배포 체크리스트

- [ ] 모든 환경변수가 ConfigMap에 설정되어 있는가?
- [ ] Secret이 필요한 경우 생성되어 있는가?
- [ ] 리소스 제한(CPU/Memory)이 적절히 설정되어 있는가?
- [ ] 헬스체크 엔드포인트가 정상 동작하는가?
- [ ] Ingress SSL 인증서가 설정되어 있는가?
- [ ] HPA(Horizontal Pod Autoscaler)가 필요한가?
- [ ] 로그 수집 및 모니터링이 설정되어 있는가?
- [ ] 백업 및 복구 계획이 있는가?

## 📞 지원

문제가 발생하면 다음 정보와 함께 문의하세요:

1. `kubectl get pods -n div4u -o wide`
2. `kubectl get services -n div4u`
3. `kubectl get ingress -n div4u`
4. 관련 Pod 로그
5. 에러 메시지 및 재현 단계
