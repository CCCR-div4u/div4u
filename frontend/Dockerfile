# Multi-stage build for React app with BFF

# Stage 1: Build stage
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치 (개발 의존성 포함)
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

# React 앱 빌드
RUN npm run build

# BFF 서버 파일 준비
RUN npm run copy:server

# Stage 2: BFF Runtime
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 빌드된 정적 파일들과 BFF 서버 파일 복사
COPY --from=builder /app/dist ./dist

# BFF 런타임 의존성 설치
RUN cd dist && npm install --only=production

# 비root 사용자 생성 및 권한 설정
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# 비root 사용자로 전환
USER nodejs

# 포트 노출 (80 → 3000으로 변경)
EXPOSE 3000

# 환경변수 설정
ENV NODE_ENV=production
ENV PORT=3000

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# BFF 서버 실행
CMD ["node", "dist/server.js"]
