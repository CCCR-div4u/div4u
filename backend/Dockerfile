# Node.js 18 Alpine 이미지 사용 (경량화)
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치 (빌드용 전체 설치)
RUN npm ci

# 소스 코드 복사
COPY . .

# TypeScript 컴파일 및 에셋 복사
RUN npm run build

# 작업 디렉토리 전체를 node 사용자에게 권한 부여
RUN chown -R node:node /app

# 포트 노출
EXPOSE 3001

# node 사용자로 실행
USER node

# 애플리케이션 실행
CMD ["npm", "start"]