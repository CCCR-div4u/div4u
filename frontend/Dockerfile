# Multi-stage build for React app

# Stage 1: Build stage
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# 환경변수 설정 (빌드 시점)
ARG VITE_API_BASE_URL=/api
ARG VITE_COMPARISON_API_URL=/api/comparison
ARG VITE_APP_NAME="Seoul Congestion Service"
ARG VITE_APP_VERSION="2.0.0"

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_COMPARISON_API_URL=$VITE_COMPARISON_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION

# 프로덕션 빌드
RUN npm run build

# Stage 2: Production stage
FROM nginx:alpine

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/nginx.conf

# 빌드된 파일을 Nginx 서빙 디렉토리로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx 전체 권한 설정
RUN mkdir -p /var/cache/nginx /var/run/nginx /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/run/nginx /var/log/nginx /etc/nginx /usr/share/nginx && \
    chmod -R 755 /var/cache/nginx /var/run/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

# 포트 노출
EXPOSE 80

# root로 실행 (80 포트 사용을 위해)

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
