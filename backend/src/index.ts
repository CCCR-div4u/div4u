import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { LocationService } from './services/LocationService';
import { APIResponse, CongestionQueryRequest, CongestionQueryResponse } from './types';
import { 
  validateCongestionQuery, 
  validateSearchQuery, 
  validateAreaCode, 
  validateCategory,
  validatePagination,
  validateThreshold,
  validateJSON
} from './middleware/validation';
import { 
  globalErrorHandler, 
  notFoundHandler, 
  requestLogger, 
  asyncHandler,
  successResponse,
  errorResponse,
  handleSeoulAPIError,
  logger
} from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Initialize services
const locationService = new LocationService();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
  credentials: true,
}));

// 커스텀 요청 로깅 (morgan 대신)
app.use(requestLogger);

// JSON 파싱 및 에러 처리
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(validateJSON);

// Basic health check endpoint
app.get('/api/health', asyncHandler(async (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    locationStats: locationService.getStats(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  };
  res.json(successResponse(healthData));
}));

// 테스트용: 강남역과 강남 MICE 관광특구 유사도 테스트
app.get('/api/test/gangnam-similarity', asyncHandler(async (req, res) => {
  (locationService as any).testGangnamSimilarity();
  res.json(successResponse({ message: '콘솔 로그를 확인하세요.' }));
}));

// 모든 장소 목록 조회
app.get('/api/locations', validatePagination, asyncHandler(async (req, res) => {
  const locations = locationService.getAllLocations();
  res.json(successResponse(locations));
}));

// 카테고리별 장소 목록 조회
app.get('/api/locations/category/:category', validateCategory, asyncHandler(async (req, res) => {
  const { category } = req.params;
  const locations = locationService.getLocationsByCategory(category as any);
  res.json(successResponse(locations));
}));

// 장소 검색 (키워드)
app.get('/api/locations/search', validateSearchQuery, asyncHandler(async (req, res) => {
  const { q: query } = req.query;
  const locations = locationService.searchLocationsByKeyword(query as string);
  res.json(successResponse(locations));
}));

// 퍼지 검색 (유사도 기반)
app.get('/api/locations/fuzzy-search', validateSearchQuery, validateThreshold, asyncHandler(async (req, res) => {
  const { q: query, threshold } = req.query;
  const searchThreshold = threshold ? parseFloat(threshold as string) : 0.6;
  const results = locationService.fuzzySearchLocations(query as string, searchThreshold);
  res.json(successResponse(results));
}));

// 카테고리 정보 조회
app.get('/api/categories', (req, res) => {
  try {
    const categories = locationService.getCategoryInfo();
    const response: APIResponse<any> = {
      success: true,
      data: categories,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (error) {
    const response: APIResponse<any> = {
      success: false,
      error: 'Failed to fetch categories',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

// 자연어 질의 처리 (NLP)
app.post('/api/nlp/query', validateCongestionQuery, asyncHandler(async (req, res) => {
  const { query } = req.body;
  const result = locationService.processNaturalLanguageQuery(query);
  res.json(successResponse(result));
}));

// 지능형 장소 검색 (NLP + 퍼지 매칭 결합)
app.post('/api/nlp/intelligent-search', validateCongestionQuery, asyncHandler(async (req, res) => {
  const { query } = req.body;
  const result = locationService.intelligentLocationSearch(query);
  res.json(successResponse(result));
}));

// 키워드 추출
app.post('/api/nlp/extract-keywords', (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      const response: APIResponse<any> = {
        success: false,
        error: 'Query is required',
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(response);
    }
    
    const keywords = locationService.extractLocationKeywords(query);
    const intentAnalysis = locationService.analyzeCongestionIntent(query);
    
    const response: APIResponse<any> = {
      success: true,
      data: {
        keywords,
        intentAnalysis,
        originalQuery: query
      },
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (error) {
    const response: APIResponse<any> = {
      success: false,
      error: 'Failed to extract keywords',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

// 혼잡도 레벨 정보 (특정 라우트를 먼저 정의)
app.get('/api/congestion/levels', (req, res) => {
  try {
    const levels = locationService.getSupportedCongestionLevels();
    const response: APIResponse<any> = {
      success: true,
      data: levels,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (error) {
    const response: APIResponse<any> = {
      success: false,
      error: 'Failed to fetch congestion levels',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

// 인기 장소 혼잡도 조회 (특정 라우트를 먼저 정의)
app.get('/api/congestion/popular', async (req, res) => {
  try {
    const { category, limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 5;
    
    const results = await locationService.getPopularLocationsCongestion(
      category as any, 
      limitNum
    );
    
    const response: APIResponse<any> = {
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (error) {
    const response: APIResponse<any> = {
      success: false,
      error: 'Failed to fetch popular locations congestion',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

// 혼잡도 조회 (지역 코드) - 동적 라우트는 마지막에
app.get('/api/congestion/:areaCode', validateAreaCode, asyncHandler(async (req, res) => {
  const { areaCode } = req.params;
  
  try {
    const congestionData = await locationService.getCongestionByAreaCode(areaCode);
    res.json(successResponse(congestionData));
  } catch (error) {
    const { statusCode, message } = handleSeoulAPIError(error);
    const errorResp = errorResponse('CONGESTION_FETCH_FAILED', message, statusCode);
    res.status(statusCode).json(errorResp);
  }
}));

// 자연어 질의를 통한 혼잡도 조회 (메인 엔드포인트)
app.post('/api/congestion/query', validateCongestionQuery, asyncHandler(async (req, res) => {
  const { query, serviceType } = req.body as CongestionQueryRequest;
  
  logger.info('Congestion Query Request', { 
    query, 
    serviceType,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  try {
    const result = await locationService.getCongestionByQuery(query);
    
    // 에러가 있는 경우
    if (result.error) {
      const errorResp = errorResponse(
        'CONGESTION_QUERY_FAILED', 
        result.error, 
        400,
        { 
          suggestions: result.nlpResult.suggestedLocations,
          recommendations: result.recommendations
        }
      );
      logger.debug('Sending error response with suggestions', { errorResp });
      return res.status(400).json(errorResp);
    }

    // 성공적인 응답 형식으로 변환
    const response: CongestionQueryResponse = {
      location: result.congestionData?.areaName || result.nlpResult.matchedAreaName,
      crowdLevel: result.congestionData?.congestionLevel || '정보없음',
      message: result.congestionData?.congestionMessage || '혼잡도 정보를 가져올 수 없습니다.',
      timestamp: new Date().toISOString(),
      updateTime: result.congestionData?.updateTime,
      success: true,
      confidence: result.nlpResult.confidence,
      suggestions: result.nlpResult.suggestedLocations,
      recommendations: result.recommendations
    };

    logger.info('Congestion Query Success', { 
      query,
      location: response.location,
      crowdLevel: response.crowdLevel,
      confidence: response.confidence
    });

    logger.debug('Sending successful response:', { response });
    res.json(successResponse(response));
  } catch (error) {
    const { statusCode, message } = handleSeoulAPIError(error);
    
    logger.error('Congestion Query Error', { 
      query,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });

    const errorResp = errorResponse('CONGESTION_QUERY_FAILED', message, statusCode);
    res.status(statusCode).json(errorResp);
  }
}));

// 인기 장소 혼잡도 조회 (특정 라우트를 먼저 정의)
app.get('/api/congestion/popular', async (req, res) => {
  try {
    const { category, limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 5;
    
    const results = await locationService.getPopularLocationsCongestion(
      category as any, 
      limitNum
    );
    
    const response: APIResponse<any> = {
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (error) {
    const response: APIResponse<any> = {
      success: false,
      error: 'Failed to fetch popular locations congestion',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

// 서울시 API 상태 확인
app.get('/api/seoul-api/status', async (req, res) => {
  try {
    const status = await locationService.checkSeoulAPIStatus();
    const response: APIResponse<any> = {
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    };
    res.json(response);
  } catch (error) {
    const response: APIResponse<any> = {
      success: false,
      error: 'Failed to check Seoul API status',
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});



// 특정 장소 조회 (지역 코드)
app.get('/api/locations/:areaCode', validateAreaCode, asyncHandler(async (req, res) => {
  const { areaCode } = req.params;
  const location = locationService.getLocationByCode(areaCode);
  
  if (!location) {
    const errorResp = errorResponse('LOCATION_NOT_FOUND', 'Location not found', 404);
    return res.status(404).json(errorResp);
  }
  
  res.json(successResponse(location));
}));

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Seoul Congestion Service API',
    version: '1.0.0',
    features: [
      '🏢 120개 서울시 주요 장소 데이터',
      '🔍 키워드 기반 장소 검색',
      '🧠 자연어 처리 (NLP)',
      '📊 퍼지 매칭 알고리즘',
      '🎯 지능형 장소 추천'
    ],
    endpoints: [
      'GET /api/health - Health check',
      'GET /api/locations - All locations',
      'GET /api/locations/category/:category - Locations by category',
      'GET /api/locations/search?q=keyword - Search locations',
      'GET /api/locations/fuzzy-search?q=keyword&threshold=0.6 - Fuzzy search',
      'GET /api/categories - Category information',
      'GET /api/locations/:areaCode - Specific location',
      'POST /api/nlp/query - Natural language query processing',
      'POST /api/nlp/intelligent-search - Intelligent location search',
      'POST /api/nlp/extract-keywords - Extract keywords from query',
      'GET /api/congestion/:areaCode - Get congestion data by area code',
      'POST /api/congestion/query - Get congestion data by natural language query',
      'GET /api/congestion/popular?category=&limit= - Get popular locations congestion',
      'GET /api/seoul-api/status - Check Seoul API status',
      'GET /api/congestion/levels - Get supported congestion levels'
    ]
  });
});

// 404 에러 처리 (모든 라우트 이후에 위치)
app.use(notFoundHandler);

// 글로벌 에러 처리 미들웨어 (가장 마지막에 위치)
app.use(globalErrorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info('Server Started', {
    port: PORT,
    environment: process.env.NODE_ENV,
    locationsCount: locationService.getAllLocations().length
  });
  
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📍 Loaded ${locationService.getAllLocations().length} Seoul locations`);
});