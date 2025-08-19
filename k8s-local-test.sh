#!/bin/bash

# Seoul Congestion Service V2 로컬 Kubernetes 테스트 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

NAMESPACE="div4u"

echo -e "${BLUE}🐿️ Seoul Congestion Service V2 로컬 테스트 시작...${NC}"

# 1. 네임스페이스 및 ConfigMap 적용
echo -e "${YELLOW}📦 Step 1: Applying namespace and configmap...${NC}"
kubectl apply -f k8s/namespaces.yaml
kubectl apply -f k8s/configmap.yaml

# 2. 현재 배포된 서비스들 재시작 (새로운 ConfigMap 적용)
echo -e "${YELLOW}🔄 Step 2: Restarting deployments to apply new config...${NC}"

if kubectl get deployment div4u-backend -n $NAMESPACE >/dev/null 2>&1; then
    kubectl rollout restart deployment/div4u-backend -n $NAMESPACE
    echo "Backend deployment restarted"
fi

if kubectl get deployment div4u-comparison -n $NAMESPACE >/dev/null 2>&1; then
    kubectl rollout restart deployment/div4u-comparison -n $NAMESPACE
    echo "Comparison deployment restarted"
fi

if kubectl get deployment div4u-frontend -n $NAMESPACE >/dev/null 2>&1; then
    kubectl rollout restart deployment/div4u-frontend -n $NAMESPACE
    echo "Frontend deployment restarted"
fi

# 3. Ingress 업데이트
echo -e "${YELLOW}🌐 Step 3: Updating ingress...${NC}"
kubectl apply -f k8s/ingress-alb.yaml

# 4. 배포 상태 확인
echo -e "${YELLOW}📊 Step 4: Waiting for deployments to be ready...${NC}"

if kubectl get deployment div4u-backend -n $NAMESPACE >/dev/null 2>&1; then
    kubectl wait --for=condition=available --timeout=120s deployment/div4u-backend -n $NAMESPACE
fi

if kubectl get deployment div4u-comparison -n $NAMESPACE >/dev/null 2>&1; then
    kubectl wait --for=condition=available --timeout=120s deployment/div4u-comparison -n $NAMESPACE
fi

if kubectl get deployment div4u-frontend -n $NAMESPACE >/dev/null 2>&1; then
    kubectl wait --for=condition=available --timeout=120s deployment/div4u-frontend -n $NAMESPACE
fi

echo ""
echo -e "${GREEN}🎉 로컬 테스트 설정 완료!${NC}"
echo ""

# 5. 상태 확인
echo -e "${YELLOW}📋 현재 상태:${NC}"
kubectl get pods -n $NAMESPACE
echo ""
kubectl get services -n $NAMESPACE
echo ""
kubectl get ingress -n $NAMESPACE

echo ""
echo -e "${YELLOW}🔗 테스트 방법:${NC}"
echo "1. 포트 포워딩으로 로컬 테스트:"
echo "   kubectl port-forward service/div4u-frontend-service 8080:80 -n $NAMESPACE"
echo "   kubectl port-forward service/div4u-backend-service 8081:3001 -n $NAMESPACE"
echo "   kubectl port-forward service/div4u-comparison-service 8082:3002 -n $NAMESPACE"
echo ""
echo "2. 브라우저에서 접속:"
echo "   Frontend: http://localhost:8080"
echo "   Backend API: http://localhost:8081/api"
echo "   Comparison API: http://localhost:8082/api/comparison"
echo ""
echo "3. API 테스트:"
echo "   curl http://localhost:8081/api/health"
echo "   curl http://localhost:8082/api/comparison/health"

echo ""
echo -e "${GREEN}✅ 로컬 테스트 준비 완료!${NC}"
