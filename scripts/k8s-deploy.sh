#!/bin/bash

# Seoul Congestion Service V2 Kubernetes 배포 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 설정
REGISTRY="harbor.bluesunnywings.com/div4u"
NAMESPACE="div4u"
GIT_COMMIT=$(git rev-parse HEAD)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo -e "${BLUE}🐿️ Seoul Congestion Service V2 Kubernetes 배포 시작...${NC}"
echo -e "${YELLOW}📋 배포 정보:${NC}"
echo "  - Registry: $REGISTRY"
echo "  - Namespace: $NAMESPACE"
echo "  - Git Commit: $GIT_COMMIT"
echo "  - Timestamp: $TIMESTAMP"
echo ""

# 함수 정의
build_and_push_image() {
    local service=$1
    local dockerfile_path=$2
    local context_path=$3
    
    echo -e "${BLUE}🔨 Building $service image...${NC}"
    
    # Docker 이미지 빌드
    docker build -f "$dockerfile_path" -t "$REGISTRY/div4u-$service:$GIT_COMMIT" "$context_path"
    docker tag "$REGISTRY/div4u-$service:$GIT_COMMIT" "$REGISTRY/div4u-$service:latest"
    
    # Docker 이미지 푸시
    echo -e "${BLUE}📤 Pushing $service image...${NC}"
    docker push "$REGISTRY/div4u-$service:$GIT_COMMIT"
    docker push "$REGISTRY/div4u-$service:latest"
    
    echo -e "${GREEN}✅ $service image built and pushed successfully${NC}"
}

update_deployment() {
    local service=$1
    local deployment_file=$2
    
    echo -e "${BLUE}🔄 Updating $service deployment...${NC}"
    
    # 이미지 태그 업데이트
    sed -i.bak "s|image: $REGISTRY/div4u-$service:.*|image: $REGISTRY/div4u-$service:$GIT_COMMIT|g" "$deployment_file"
    
    # Kubernetes 배포 적용
    kubectl apply -f "$deployment_file"
    
    echo -e "${GREEN}✅ $service deployment updated${NC}"
}

# 1. Docker 이미지 빌드 및 푸시
echo -e "${YELLOW}📦 Step 1: Building and pushing Docker images...${NC}"

# Frontend 빌드
build_and_push_image "frontend" "./frontend/Dockerfile" "./frontend"

# Backend 빌드
build_and_push_image "backend" "./backend/Dockerfile" "./backend"

# Comparison 빌드
build_and_push_image "comparison" "./comparison/Dockerfile" "./comparison"

echo ""

# 2. Kubernetes 네임스페이스 확인/생성
echo -e "${YELLOW}📦 Step 2: Ensuring namespace exists...${NC}"
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# 3. ConfigMap 및 Secret 적용
echo -e "${YELLOW}📦 Step 3: Applying ConfigMap and Secrets...${NC}"
kubectl apply -f k8s/namespaces.yaml
kubectl apply -f k8s/configmap.yaml

# 4. 서비스 배포
echo -e "${YELLOW}📦 Step 4: Deploying services...${NC}"

# Backend 배포
update_deployment "backend" "k8s/backend/backend-deployment.yaml"
kubectl apply -f k8s/backend/backend-service.yaml

# Comparison 배포
update_deployment "comparison" "k8s/comparison/comparison-deployment.yaml"
kubectl apply -f k8s/comparison/comparison-service.yaml

# Frontend 배포
update_deployment "frontend" "k8s/frontend/frontend-deployment.yaml"
kubectl apply -f k8s/frontend/frontend-service.yaml

# 5. Ingress 적용
echo -e "${YELLOW}📦 Step 5: Applying Ingress...${NC}"
kubectl apply -f k8s/ingress-alb.yaml

# 6. HPA 적용 (선택사항)
echo -e "${YELLOW}📦 Step 6: Applying HPA...${NC}"
kubectl apply -f k8s/hpa.yaml

echo ""

# 7. 배포 상태 확인
echo -e "${YELLOW}📊 Step 7: Checking deployment status...${NC}"
echo -e "${BLUE}Waiting for deployments to be ready...${NC}"

kubectl wait --for=condition=available --timeout=300s deployment/div4u-backend -n $NAMESPACE
kubectl wait --for=condition=available --timeout=300s deployment/div4u-comparison -n $NAMESPACE
kubectl wait --for=condition=available --timeout=300s deployment/div4u-frontend -n $NAMESPACE

echo ""
echo -e "${GREEN}🎉 배포 완료!${NC}"
echo ""
echo -e "${YELLOW}📋 배포 정보:${NC}"
kubectl get pods -n $NAMESPACE
echo ""
kubectl get services -n $NAMESPACE
echo ""
kubectl get ingress -n $NAMESPACE

echo ""
echo -e "${YELLOW}🔗 접속 정보:${NC}"
echo "  - 웹사이트: https://www.div4u.com"
echo "  - API: https://www.div4u.com/api"
echo "  - Comparison API: https://www.div4u.com/api/comparison"

echo ""
echo -e "${YELLOW}📋 유용한 명령어:${NC}"
echo "  - 로그 확인: kubectl logs -f deployment/div4u-backend -n $NAMESPACE"
echo "  - 포드 상태: kubectl get pods -n $NAMESPACE"
echo "  - 서비스 상태: kubectl get services -n $NAMESPACE"
echo "  - 롤백: kubectl rollout undo deployment/div4u-backend -n $NAMESPACE"

echo ""
echo -e "${GREEN}✅ 배포 스크립트 완료!${NC}"
