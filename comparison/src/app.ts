import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { swaggerSpec } from './config/swagger';
import {
  corsMiddleware,
  securityMiddleware,
  loggingMiddleware,
  jsonMiddleware,
  urlencodedMiddleware,
  errorHandler,
  notFoundHandler
} from './middleware';
import { requestLogger } from './middleware/validation';
import { defaultRateLimiter } from './middleware/rateLimiter';
import routes from './routes';

// Create Express application
const app = express();

// Apply middleware
app.use(corsMiddleware);
app.use(securityMiddleware);
app.use(loggingMiddleware);
app.use(jsonMiddleware);
app.use(urlencodedMiddleware);
app.use(requestLogger);

// Swagger UI 설정
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Div4u Comparison Service API',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// Swagger JSON 엔드포인트
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Rate limiting (API 경로에만 적용)
app.use('/api', defaultRateLimiter.middleware());

// Mount API routes
app.use('/api', routes);

// Root endpoint - API 문서로 리다이렉트
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Apply error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;