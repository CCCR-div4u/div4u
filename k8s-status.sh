#!/bin/bash

# Seoul Congestion Service V2 Kubernetes 상태 확인 스크립트

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

NAMESPACE="div4u"

echo -e "${BLUE}🐿️ Seoul Congestion Service V2 상태 확인${NC}"
echo ""

# 1. 네임스페이스 확인
echo -e "${YELLOW}📦 Namespace: $NAMESPACE${NC}"
kubectl get namespace $NAMESPACE 2>/dev/null || echo -e "${RED}❌ Namespace not found${NC}"
echo ""

# 2. 포드 상태
echo -e "${YELLOW}🚀 Pods Status:${NC}"
kubectl get pods -n $NAMESPACE -o wide
echo ""

# 3. 서비스 상태
echo -e "${YELLOW}🔗 Services Status:${NC}"
kubectl get services -n $NAMESPACE
echo ""

# 4. Ingress 상태
echo -e "${YELLOW}🌐 Ingress Status:${NC}"
kubectl get ingress -n $NAMESPACE
echo ""

# 5. 배포 상태
echo -e "${YELLOW}📊 Deployments Status:${NC}"
kubectl get deployments -n $NAMESPACE
echo ""

# 6. ConfigMap 확인
echo -e "${YELLOW}⚙️ ConfigMaps:${NC}"
kubectl get configmaps -n $NAMESPACE
echo ""

# 7. 최근 이벤트
echo -e "${YELLOW}📋 Recent Events:${NC}"
kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -10
echo ""

# 8. 헬스체크
echo -e "${YELLOW}🏥 Health Check:${NC}"

# Backend 헬스체크
echo -n "Backend: "
if kubectl get pods -n $NAMESPACE -l app=div4u-backend -o jsonpath='{.items[0].status.phase}' 2>/dev/null | grep -q "Running"; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not Running${NC}"
fi

# Comparison 헬스체크
echo -n "Comparison: "
if kubectl get pods -n $NAMESPACE -l app=div4u-comparison -o jsonpath='{.items[0].status.phase}' 2>/dev/null | grep -q "Running"; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not Running${NC}"
fi

# Frontend 헬스체크
echo -n "Frontend: "
if kubectl get pods -n $NAMESPACE -l app=div4u-frontend -o jsonpath='{.items[0].status.phase}' 2>/dev/null | grep -q "Running"; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not Running${NC}"
fi

echo ""

# 9. 로그 확인 명령어 안내
echo -e "${YELLOW}📋 로그 확인 명령어:${NC}"
echo "  Backend:    kubectl logs -f deployment/div4u-backend -n $NAMESPACE"
echo "  Comparison: kubectl logs -f deployment/div4u-comparison -n $NAMESPACE"
echo "  Frontend:   kubectl logs -f deployment/div4u-frontend -n $NAMESPACE"
echo ""

# 10. 포트 포워딩 명령어 안내
echo -e "${YELLOW}🔗 로컬 테스트용 포트 포워딩:${NC}"
echo "  Frontend:   kubectl port-forward service/div4u-frontend-service 8080:80 -n $NAMESPACE"
echo "  Backend:    kubectl port-forward service/div4u-backend-service 8081:3001 -n $NAMESPACE"
echo "  Comparison: kubectl port-forward service/div4u-comparison-service 8082:3002 -n $NAMESPACE"
echo ""

echo -e "${GREEN}✅ 상태 확인 완료!${NC}"
