import request from 'supertest';
import express from 'express';
import comparisonRoutes from '../../routes/comparison';
import { errorHandler } from '../../middleware';
import axios from 'axios';

// axios 모킹
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Comparison API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/comparison', comparisonRoutes);
    app.use(errorHandler);
    jest.clearAllMocks();
  });

  describe('POST /api/comparison/compare', () => {
    it('should successfully compare locations', async () => {
      // Mock Core API responses
      mockedAxios.post
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              location: '홍대 관광특구',
              crowdLevel: '여유',
              message: '여유로움',
              timestamp: '2025-08-16T18:00:00.000Z'
            }
          }
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              location: '명동 관광특구',
              crowdLevel: '보통',
              message: '보통',
              timestamp: '2025-08-16T18:00:00.000Z'
            }
          }
        });

      const response = await request(app)
        .post('/api/comparison/compare')
        .send({
          locations: ['홍대', '명동']
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.comparisons).toHaveLength(2);
      expect(response.body.data.analysis).toBeDefined();
      expect(response.body.data.analysis.recommendation).toBeDefined();
    });

    it('should return 400 for invalid request', async () => {
      const response = await request(app)
        .post('/api/comparison/compare')
        .send({
          // locations 필드 누락
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for empty locations array', async () => {
      const response = await request(app)
        .post('/api/comparison/compare')
        .send({
          locations: []
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for too many locations', async () => {
      const manyLocations = Array.from({ length: 11 }, (_, i) => `장소${i + 1}`);
      
      const response = await request(app)
        .post('/api/comparison/compare')
        .send({
          locations: manyLocations
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle Core API failures gracefully', async () => {
      // Mock Core API failure
      mockedAxios.post.mockRejectedValue(new Error('Core API Error'));

      const response = await request(app)
        .post('/api/comparison/compare')
        .send({
          locations: ['홍대']
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.comparisons[0].crowdLevel).toBe('정보없음');
    });
  });

  describe('POST /api/comparison/test', () => {
    it('should return test data with various crowd levels', async () => {
      const response = await request(app)
        .post('/api/comparison/test')
        .send({
          locations: ['장소1', '장소2', '장소3', '장소4']
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.comparisons).toHaveLength(4);
      
      // 테스트 데이터는 순서대로 약간붐빔, 여유, 보통, 붐빔이어야 함
      const comparisons = response.body.data.comparisons;
      expect(comparisons[0].crowdLevel).toBe('약간 붐빔');
      expect(comparisons[1].crowdLevel).toBe('여유');
      expect(comparisons[2].crowdLevel).toBe('보통');
      expect(comparisons[3].crowdLevel).toBe('붐빔');
      
      // 추천은 여유한 곳이어야 함
      expect(response.body.data.analysis.recommendation.bestChoice).toBe('장소2');
    });
  });

  describe('POST /api/comparison/cache/clear', () => {
    it('should clear cache successfully', async () => {
      const response = await request(app)
        .post('/api/comparison/cache/clear')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Cache cleared successfully');
    });
  });
});