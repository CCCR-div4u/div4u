import { Request, Response, NextFunction } from 'express';
import { ComparisonRequest } from '../types';

// 비교 요청 검증 미들웨어
export const validateComparisonRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { locations, options }: ComparisonRequest = req.body;

    // 필수 필드 검증
    if (!locations) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'locations 필드는 필수입니다',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // locations 타입 검증
    if (!Array.isArray(locations)) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'locations는 배열이어야 합니다',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // 빈 배열 검증
    if (locations.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: '최소 1개 이상의 장소를 입력해주세요',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // 최대 개수 제한 (10개)
    if (locations.length > 10) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: '최대 10개까지만 비교할 수 있습니다',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // 각 location이 문자열인지 검증
    const invalidLocations = locations.filter(loc => typeof loc !== 'string' || loc.trim() === '');
    if (invalidLocations.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: '모든 장소명은 비어있지 않은 문자열이어야 합니다',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // 중복 제거
    const uniqueLocations = [...new Set(locations.map(loc => loc.trim()))];
    if (uniqueLocations.length !== locations.length) {
      console.log('⚠️  Duplicate locations detected, removing duplicates');
      req.body.locations = uniqueLocations;
    }

    // options 검증 (선택사항)
    if (options) {
      if (options.maxLocations && (typeof options.maxLocations !== 'number' || options.maxLocations < 1)) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'maxLocations는 1 이상의 숫자여야 합니다',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (options.sortBy && !['crowdLevel', 'location'].includes(options.sortBy)) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'sortBy는 "crowdLevel" 또는 "location"이어야 합니다',
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    console.log(`✅ Validation passed for ${uniqueLocations.length} locations:`, uniqueLocations);
    next();

  } catch (error) {
    console.error('❌ Validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: '요청 검증 중 오류가 발생했습니다',
      timestamp: new Date().toISOString()
    });
  }
};

// 일반적인 요청 로깅 미들웨어
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`📝 ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};