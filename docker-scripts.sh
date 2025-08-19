#!/bin/bash

# Docker 스크립트 모음

# 개발 환경 실행
dev() {
    echo "🚀 개발 환경 시작..."
    docker-compose -f docker-compose.dev.yml up --build
}

# 개발 환경 백그라운드 실행
dev-detached() {
    echo "🚀 개발 환경 백그라운드 시작..."
    docker-compose -f docker-compose.dev.yml up --build -d
}

# 프로덕션 환경 실행
prod() {
    echo "🚀 프로덕션 환경 시작..."
    docker-compose up --build
}

# 프로덕션 환경 백그라운드 실행
prod-detached() {
    echo "🚀 프로덕션 환경 백그라운드 시작..."
    docker-compose up --build -d
}

# 컨테이너 중지
stop() {
    echo "⏹️ 컨테이너 중지..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose down
}

# 컨테이너 및 볼륨 삭제
clean() {
    echo "🧹 컨테이너 및 볼륨 정리..."
    docker-compose -f docker-compose.dev.yml down -v --remove-orphans
    docker-compose down -v --remove-orphans
    docker system prune -f
}

# 로그 확인
logs() {
    if [ "$1" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml logs -f
    else
        docker-compose logs -f
    fi
}

# 특정 서비스 로그 확인
logs-service() {
    if [ -z "$1" ]; then
        echo "사용법: logs-service <service-name> [dev]"
        echo "예시: logs-service backend dev"
        return 1
    fi
    
    if [ "$2" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml logs -f "$1"
    else
        docker-compose logs -f "$1"
    fi
}

# 컨테이너 상태 확인
status() {
    echo "📊 컨테이너 상태:"
    docker-compose ps
    echo ""
    echo "📊 개발 컨테이너 상태:"
    docker-compose -f docker-compose.dev.yml ps
}

# 헬프
help() {
    echo "🐳 Docker 스크립트 사용법:"
    echo ""
    echo "개발 환경:"
    echo "  ./docker-scripts.sh dev              - 개발 환경 실행"
    echo "  ./docker-scripts.sh dev-detached     - 개발 환경 백그라운드 실행"
    echo ""
    echo "프로덕션 환경:"
    echo "  ./docker-scripts.sh prod             - 프로덕션 환경 실행"
    echo "  ./docker-scripts.sh prod-detached    - 프로덕션 환경 백그라운드 실행"
    echo ""
    echo "관리:"
    echo "  ./docker-scripts.sh stop             - 모든 컨테이너 중지"
    echo "  ./docker-scripts.sh clean            - 컨테이너 및 볼륨 정리"
    echo "  ./docker-scripts.sh status           - 컨테이너 상태 확인"
    echo ""
    echo "로그:"
    echo "  ./docker-scripts.sh logs [dev]       - 모든 서비스 로그 확인"
    echo "  ./docker-scripts.sh logs-service <service> [dev] - 특정 서비스 로그 확인"
    echo ""
    echo "예시:"
    echo "  ./docker-scripts.sh dev              # 개발 환경 시작"
    echo "  ./docker-scripts.sh logs-service backend dev  # 개발 백엔드 로그 확인"
}

# 메인 스위치
case "$1" in
    dev)
        dev
        ;;
    dev-detached)
        dev-detached
        ;;
    prod)
        prod
        ;;
    prod-detached)
        prod-detached
        ;;
    stop)
        stop
        ;;
    clean)
        clean
        ;;
    logs)
        logs "$2"
        ;;
    logs-service)
        logs-service "$2" "$3"
        ;;
    status)
        status
        ;;
    help|--help|-h)
        help
        ;;
    *)
        echo "❌ 알 수 없는 명령어: $1"
        echo ""
        help
        exit 1
        ;;
esac