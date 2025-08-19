import express from 'express';
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';

// ES Module에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 환경변수 설정
const BACKEND_SERVICE_URL = process.env.BACKEND_SERVICE_URL || 'http://div4u-backend-service:3001';
const COMPARISON_SERVICE_URL = process.env.COMPARISON_SERVICE_URL || 'http://div4u-comparison-service:3002';

console.log('🚀 Starting BFF Server...');
console.log(`📡 Backend Service: ${BACKEND_SERVICE_URL}`);
console.log(`📊 Comparison Service: ${COMPARISON_SERVICE_URL}`);

// 정적 파일 서빙 (React 빌드 결과물)
// Docker 환경에서는 이미 dist 디렉터리 안에 있으므로 현재 디렉터리 사용
const staticPath = process.env.NODE_ENV === 'production' ? __dirname : path.join(__dirname, 'dist');
app.use(express.static(staticPath));

// 헬스체크 엔드포인트 (Kubernetes용)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'div4u-frontend-bff'
  });
});

// API 프록시 설정 - Comparison Service (더 구체적인 경로가 먼저)
app.use('/api/comparison', createProxyMiddleware({
  target: COMPARISON_SERVICE_URL,
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  onError: (err, req, res) => {
    console.error('❌ Comparison Service Proxy Error:', err.message);
    res.status(502).json({
      error: 'Comparison Service Unavailable',
      message: 'Unable to connect to comparison service'
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔗 Proxying to Comparison: ${req.method} ${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ Comparison Response: ${proxyRes.statusCode} ${req.url}`);
  }
}));

// API 프록시 설정 - Backend Service
app.use('/api', createProxyMiddleware({
  target: BACKEND_SERVICE_URL,
  changeOrigin: true,
  timeout: 30000,
  proxyTimeout: 30000,
  onError: (err, req, res) => {
    console.error('❌ Backend Service Proxy Error:', err.message);
    res.status(502).json({
      error: 'Backend Service Unavailable',
      message: 'Unable to connect to backend service'
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔗 Proxying to Backend: ${req.method} ${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ Backend Response: ${proxyRes.statusCode} ${req.url}`);
  }
}));

// SPA 라우팅 지원 (모든 경로를 index.html로 리다이렉트)
app.get('*', (req, res) => {
  // API 경로가 아닌 경우에만 index.html 제공
  if (!req.path.startsWith('/api')) {
    const indexPath = process.env.NODE_ENV === 'production' 
      ? path.join(__dirname, 'index.html')
      : path.join(__dirname, 'dist', 'index.html');
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎉 BFF Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});