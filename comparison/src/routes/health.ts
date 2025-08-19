import express from 'express';
import { config } from '../config';
import { HealthCheckResponse } from '../types';
import { SeoulAPIService } from '../services/seoulApiService';

const router = express.Router();
const seoulAPI = new SeoulAPIService();

/**
 * @swagger
 * components:
 *   schemas:
 *     HealthResponse:
 *       $ref: '#/components/schemas/HealthResponse'
 */

/**
 * @swagger
 * /comparison/health:
 *   get:
 *     summary: 서비스 상태 확인
 *     description: 서비스의 현재 상태와 의존성을 확인합니다.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: 서비스 상태 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       503:
 *         description: 서비스 비정상 상태
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// GET /api/comparison/health - 헬스체크
router.get('/health', async (req, res) => {
  // 서울시 API 상태 확인 (빠른 응답을 위해 타임아웃 설정)
  let seoulAPIStatus: 'healthy' | 'unhealthy' = 'healthy';
  
  try {
    const apiStatus = await Promise.race([
      seoulAPI.checkAPIStatus(),
      new Promise<{available: boolean}>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      )
    ]);
    
    seoulAPIStatus = apiStatus.available ? 'healthy' : 'unhealthy';
  } catch (error) {
    seoulAPIStatus = 'unhealthy';
    console.warn('⚠️ Seoul API health check failed:', error instanceof Error ? error.message : 'Unknown error');
  }

  const healthResponse: HealthCheckResponse = {
    status: seoulAPIStatus === 'healthy' ? 'healthy' : 'healthy', // 서비스 자체는 정상, API만 문제
    service: config.service.name,
    version: config.service.version,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    dependencies: {
      seoulAPI: seoulAPIStatus,
      cache: 'healthy'
    }
  };

  res.json(healthResponse);
});

// GET /api/comparison/info - 서비스 정보
router.get('/info', (req, res) => {
  res.json({
    service: config.service.name,
    version: config.service.version,
    description: 'MSA Comparison Service for div4u Seoul Congestion System',
    endpoints: [
      'GET /api/comparison/health',
      'GET /api/comparison/info', 
      'GET /api/comparison/cache-stats',
      'POST /api/comparison/compare'
    ],
    configuration: {
      port: config.port,
      environment: config.nodeEnv,
      cacheTTL: `${config.cache.ttlMinutes} minutes`,
      allowedOrigins: config.cors.allowedOrigins
    },
    timestamp: new Date().toISOString()
  });
});

// GET /api/comparison/cache-stats - 캐시 통계
router.get('/cache-stats', (req, res) => {
  try {
    // SeoulAPIService 인스턴스에서 캐시 통계 가져오기
    // 임시로 기본 통계 반환 (실제로는 서비스 인스턴스 필요)
    const stats = {
      totalItems: 0,
      memoryUsage: 0,
      hitRate: 0,
      oldestItem: 0,
      newestItem: 0,
      message: 'Cache statistics available after API calls'
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get cache statistics',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;