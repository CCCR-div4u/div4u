import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from '../config';

// CORS Configuration
export const corsMiddleware = cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Service-Token']
});

// Security Middleware
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
});

// Logging Middleware
export const loggingMiddleware = morgan(
  config.nodeEnv === 'production' ? 'combined' : 'dev'
);

// JSON Parser Middleware
export const jsonMiddleware = express.json({ limit: '10mb' });

// URL Encoded Middleware
export const urlencodedMiddleware = express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
});

// Error Handling Middleware
export const errorHandler = (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  console.error('❌ Error occurred:', {
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error response
  const errorResponse = {
    success: false,
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    service: config.service.name
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    res.status(400).json({
      ...errorResponse,
      error: 'Validation Error',
      message: err.message
    });
    return;
  }

  if (err.code === 'SEOUL_API_ERROR') {
    res.status(502).json({
      ...errorResponse,
      error: 'External API Error',
      message: '서울시 API 연결에 실패했습니다',
      details: config.nodeEnv === 'development' ? err.details : undefined
    });
    return;
  }

  if (err.code === 'LOCATION_NOT_FOUND') {
    res.status(404).json({
      ...errorResponse,
      error: 'Location Not Found',
      message: err.message
    });
    return;
  }

  if (err.code === 'SERVICE_OVERLOAD') {
    res.status(503).json({
      ...errorResponse,
      error: 'Service Temporarily Unavailable',
      message: '서비스가 일시적으로 과부하 상태입니다. 잠시 후 다시 시도해주세요'
    });
    return;
  }

  if (err.code === 'TIMEOUT_ERROR') {
    res.status(504).json({
      ...errorResponse,
      error: 'Gateway Timeout',
      message: '요청 처리 시간이 초과되었습니다'
    });
    return;
  }

  // Default 500 error
  res.status(500).json(errorResponse);
};

// 404 Handler
export const notFoundHandler = (
  req: express.Request,
  res: express.Response
): void => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
    service: config.service.name
  });
};