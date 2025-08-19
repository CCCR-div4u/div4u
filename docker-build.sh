#!/bin/bash

# Seoul Congestion Service V2 Docker Build Script

echo "🐿️ Seoul Congestion Service V2 Docker Build 시작..."

# 이전 컨테이너 정리
echo "📦 이전 컨테이너 정리 중..."
docker-compose -f docker-compose.dev.yml down

# 이미지 빌드
echo "🔨 Docker 이미지 빌드 중..."
docker-compose -f docker-compose.dev.yml build --no-cache

# 컨테이너 실행
echo "🚀 컨테이너 실행 중..."
docker-compose -f docker-compose.dev.yml up -d

# 상태 확인
echo "📊 컨테이너 상태 확인..."
docker-compose -f docker-compose.dev.yml ps

echo ""
echo "✅ 빌드 완료!"
echo "🌐 프론트엔드: http://localhost:5174"
echo "🔧 백엔드 API: http://localhost:3001"
echo ""
echo "📋 유용한 명령어:"
echo "  로그 확인: docker-compose -f docker-compose.dev.yml logs -f"
echo "  컨테이너 중지: docker-compose -f docker-compose.dev.yml down"
echo "  컨테이너 재시작: docker-compose -f docker-compose.dev.yml restart"