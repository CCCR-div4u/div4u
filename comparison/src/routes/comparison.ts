import express from 'express';
import { ComparisonRequest } from '../types';
import { validateComparisonRequest } from '../middleware/validation';
import { ComparisonService } from '../services/comparisonService';

const router = express.Router();
const comparisonService = new ComparisonService();

/**
 * @swagger
 * components:
 *   schemas:
 *     ComparisonRequest:
 *       $ref: '#/components/schemas/ComparisonRequest'
 *     ComparisonResponse:
 *       $ref: '#/components/schemas/ComparisonResponse'
 */

/**
 * @swagger
 * /comparison/compare:
 *   post:
 *     summary: 여러 장소 혼잡도 비교
 *     description: 여러 장소의 혼잡도를 비교하고 최적의 장소를 추천합니다.
 *     tags: [Comparison]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ComparisonRequest'
 *           examples:
 *             basic:
 *               summary: 기본 비교 요청
 *               value:
 *                 locations: ["홍대", "강남역", "명동"]
 *             with_options:
 *               summary: 옵션 포함 요청
 *               value:
 *                 locations: ["홍대", "강남역", "명동"]
 *                 options:
 *                   includeRecommendation: true
 *                   sortBy: "crowdLevel"
 *                   maxLocations: 5
 *     responses:
 *       200:
 *         description: 비교 결과 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ComparisonResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
// POST /api/comparison/compare - 여러 장소 혼잡도 비교
router.post('/compare', validateComparisonRequest, async (req, res, next) => {
  try {
    const request: ComparisonRequest = req.body;
    
    console.log(`🔍 Comparison request received:`, {
      locations: request.locations,
      options: request.options,
      timestamp: new Date().toISOString()
    });

    // 실제 비교 서비스 호출
    const response = await comparisonService.compareLocations(request);

    if (response.success) {
      console.log(`✅ Comparison completed successfully for ${request.locations.length} locations`);
    } else {
      console.error(`❌ Comparison failed:`, response.error);
    }

    res.json(response);

  } catch (error) {
    console.error('❌ Error in comparison endpoint:', error);
    next(error);
  }
});

// POST /api/comparison/test - 테스트용 다양한 혼잡도 시뮬레이션
router.post('/test', validateComparisonRequest, async (req, res, next) => {
  try {
    const request: ComparisonRequest = req.body;
    
    console.log(`🧪 Test comparison request received:`, {
      locations: request.locations,
      timestamp: new Date().toISOString()
    });

    // 테스트용 다양한 혼잡도 데이터 생성 - 사용자 문제 시나리오 재현
    // 이태원=약간붐빔, 홍대=여유 상황
    const testCrowdLevels = ['약간 붐빔', '여유', '보통', '붐빔'];
    const comparisons = request.locations.map((location, index) => ({
      location,
      displayName: `${location} 일대`,
      crowdLevel: testCrowdLevels[index % testCrowdLevels.length] as "붐빔" | "약간 붐빔" | "보통" | "여유" | "정보없음",
      message: `테스트 데이터: ${testCrowdLevels[index % testCrowdLevels.length]} 상태입니다.`,
      timestamp: new Date().toISOString(),
      rank: index + 1
    }));

    // ComparisonService의 analyzeComparison 메서드를 직접 호출
    const analysis = (comparisonService as any).analyzeComparison(comparisons);

    const response = {
      success: true,
      data: {
        comparisons,
        analysis,
        timestamp: new Date().toISOString()
      }
    };

    console.log(`🧪 Test comparison completed:`, {
      locations: request.locations.length,
      bestChoice: analysis.recommendation.bestChoice,
      alternatives: analysis.recommendation.alternativeOptions
    });

    res.json(response);

  } catch (error) {
    console.error('❌ Error in test comparison endpoint:', error);
    next(error);
  }
});

// POST /api/comparison/cache/clear - 캐시 초기화 (개발용)
router.post('/cache/clear', async (req, res, next) => {
  try {
    // ComparisonService의 캐시 초기화
    (comparisonService as any).seoulAPI.clearCache();
    
    console.log('🧹 Cache cleared successfully');
    
    res.json({
      success: true,
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    next(error);
  }
});

export default router;