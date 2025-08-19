import { Request, Response, NextFunction } from 'express';
import { APIResponse, ErrorResponse } from '../types';
import winston from 'winston';

/**
 * 구조화된 로깅 시스템
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level,
        message,
        stack,
        ...meta
      });
    })
  ),
  defaultMeta: { service: 'div4u-api' },
  transports: [
    // 콘솔 출력
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} [${level}]: ${message}${stack ? '\n' + stack : ''}`;
        })
      )
    }),
    
    // 파일 로깅 (에러)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // 파일 로깅 (전체)
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

/**
 * 요청 로깅 미들웨어
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // 응답 완료 시 로깅
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      body: req.method === 'POST' ? req.body : undefined
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

/**
 * 글로벌 에러 처리 미들웨어
 */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 에러 로깅
  logger.error('Unhandled Error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    headers: req.headers
  });

  // 에러 타입별 처리
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Invalid ID format';
  } else if (err.code === 'ECONNABORTED') {
    statusCode = 408;
    errorCode = 'REQUEST_TIMEOUT';
    message = 'Request timeout';
  } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    statusCode = 503;
    errorCode = 'SERVICE_UNAVAILABLE';
    message = 'External service unavailable';
  } else if (err.message) {
    message = err.message;
  }

  const errorResponse: ErrorResponse = {
    error: errorCode,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    details: process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      originalError: err
    } : undefined
  };

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 에러 처리 미들웨어
 */
export const notFoundHandler = (req: Request, res: Response) => {
  const response: APIResponse = {
    success: false,
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString()
  };

  logger.warn('Route Not Found', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json(response);
};

/**
 * 비동기 에러 처리 래퍼
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 서울시 API 에러 처리
 */
export const handleSeoulAPIError = (error: any): { statusCode: number; message: string } => {
  if (error.message?.includes('API 호출 실패')) {
    return {
      statusCode: 503,
      message: '서울시 API 서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.'
    };
  }
  
  if (error.message?.includes('요청 시간 초과')) {
    return {
      statusCode: 408,
      message: '서울시 API 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
    };
  }
  
  if (error.message?.includes('네트워크 연결 실패')) {
    return {
      statusCode: 503,
      message: '네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.'
    };
  }

  return {
    statusCode: 500,
    message: '혼잡도 정보를 가져오는 중 오류가 발생했습니다.'
  };
};

/**
 * 성공 응답 헬퍼
 */
export const successResponse = <T>(data: T, message?: string): APIResponse<T> => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
};

/**
 * 에러 응답 헬퍼
 */
export const errorResponse = (
  error: string,
  message: string,
  statusCode: number = 500,
  details?: any
): ErrorResponse => {
  return {
    error,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    details
  };
};