import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '3002', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Seoul API Configuration
  seoulAPI: {
    key: process.env.SEOUL_API_KEY || '',
    baseURL: process.env.SEOUL_API_BASE_URL || 'http://openapi.seoul.go.kr:8088',
    timeout: 10000, // 10 seconds
    retries: 3
  },
  
  // Cache Configuration
  cache: {
    ttlMinutes: parseInt(process.env.CACHE_TTL_MINUTES || '1', 10) // 1분으로 단축
  },
  
  // CORS Configuration
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5174']
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },
  
  // Service Information
  service: {
    name: 'comparison-service',
    version: '1.0.0'
  }
};

// Validate required configuration
export const validateConfig = (): void => {
  const requiredEnvVars = ['SEOUL_API_KEY'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Required environment variable ${envVar} is not set`);
    }
  }
  
  if (config.port < 1 || config.port > 65535) {
    throw new Error(`Invalid port number: ${config.port}`);
  }
};