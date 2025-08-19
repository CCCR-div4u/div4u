import { Request, Response, NextFunction } from 'express';
import { APIResponse } from '../types';

/**
 * 요청 데이터 검증 미들웨어
 */

// 자연어 질의 검증
export const validateCongestionQuery = (req: Request, res: Response, next: NextFunction) => {
  const { query, serviceType } = req.body;

  // 필수 필드 검증
  if (!query) {
    const response: APIResponse = {
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Query is required',
      timestamp: new Date().toISOString()
    };
    return res.status(400).json(response);
  }

  // 타입 검증
  if (typeof query !== 'string') {
    const response: APIResponse = {
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Query must be a string',
      timestamp: new Date().toISOString()
    };
    return res.status(400).json(response);
  }

  // 길이 검증
  if (query.trim().length === 0) {
    const response: APIResponse = {
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Query cannot be empty',
      timestamp: new Date().toISOString()
    };
    return res.status(400).json(response);
  }

  if (query.length > 200) {
    const response: APIResponse = {
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Query is too long (max 200 characters)',
      timestamp: new Date().toISOString()
    };
    return res.status(400).json(response);
  }

  // serviceType 검증 (선택사항)
  if (serviceType && !['realtime', 'prediction'].includes(serviceType)) {
    const response: APIResponse = {
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'ServiceType must be either "realtime" or "prediction"',
      timestamp: new Date().toISOString()
    };
    return res.status(400).json(response);
  }

  // 정리된 데이터를 req.body에 다시 할당
  req.body.query = query.trim();
  req.body.serviceType = serviceType || 'realtime';

  next();
};

// 검색 쿼리 검증
export const validateSearchQuery = (req: Request, res: Response, next: NextFunction) => {
  const { q: query } = req.query;

  if (!query) {
    const response: APIResponse = {
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Query parameter "q" is required',
      timestamp: new Date().toISOString()
    };
    return res.status(400).json(response);
  }

  if (typeof query !== 'string') {
    const response: APIResponse = {
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Query parameter must be a string',
      timestamp: new Date().toISOString()
    };
    return res.status(400).json(response);
  }

  if (query.trim().length === 0) {
    const response: APIResponse = {
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Query parameter cannot be empty',
      timestamp: new Date().toISOString()
    };
    return res.status(400).json(response);
  }

  next();
};

// 지역 코드 검증
export const validateAreaCode = (req: Request, res: Response, next: NextFunction) => {
  const { areaCode } = req.params;

  if (!areaCode) {
    const response: APIResponse = {
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Area code is required',
      timestamp: new Date().toISOString()
    };
    return res.status(400).json(response);
  }

  // 서울시 지역 코드 형식 검증 (POI001, POI002 등)
  const areaCodePattern = /^POI\d{3}$/;
  if (!areaCodePattern.test(areaCode)) {
    const response: APIResponse = {
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Invalid area code format. Expected format: POI001, POI002, etc.',
      timestamp: new Date().toISOString()
    };
    return res.status(400).json(response);
  }

  next();
};

// 카테고리 검증
export const validateCategory = (req: Request, res: Response, next: NextFunction) => {
  const { category } = req.params;
  
  const validCategories = [
    '관광특구',
    '인구밀집지역', 
    '발달상권',
    '공원',
    '고궁·문화유산'
  ];

  if (!validCategories.includes(category)) {
    const response: APIResponse = {
      success: false,
      error: 'VALIDATION_ERROR',
      message: `Invalid category. Valid categories: ${validCategories.join(', ')}`,
      timestamp: new Date().toISOString()
    };
    return res.status(400).json(response);
  }

  next();
};

// 페이지네이션 검증
export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  const { page, limit } = req.query;

  if (page) {
    const pageNum = parseInt(page as string);
    if (isNaN(pageNum) || pageNum < 1) {
      const response: APIResponse = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Page must be a positive integer',
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(response);
    }
  }

  if (limit) {
    const limitNum = parseInt(limit as string);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      const response: APIResponse = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Limit must be a positive integer between 1 and 100',
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(response);
    }
  }

  next();
};

// 임계값 검증 (퍼지 검색용)
export const validateThreshold = (req: Request, res: Response, next: NextFunction) => {
  const { threshold } = req.query;

  if (threshold) {
    const thresholdNum = parseFloat(threshold as string);
    if (isNaN(thresholdNum) || thresholdNum < 0 || thresholdNum > 1) {
      const response: APIResponse = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Threshold must be a number between 0 and 1',
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(response);
    }
  }

  next();
};

// JSON 파싱 에러 처리
export const validateJSON = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    const response: APIResponse = {
      success: false,
      error: 'JSON_PARSE_ERROR',
      message: 'Invalid JSON format in request body',
      timestamp: new Date().toISOString()
    };
    return res.status(400).json(response);
  }
  next(err);
};