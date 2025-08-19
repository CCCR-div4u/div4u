import { comparisonApiService } from '../comparisonApiService';
import { apiClient } from '../apiClient';

// apiClient 모킹
jest.mock('../apiClient');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('ComparisonApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('compareLocations', () => {
    it('should successfully compare locations', async () => {
      const mockResponse = {
        success: true,
        data: {
          comparisons: [
            {
              location: '홍대 관광특구',
              displayName: '홍대 관광특구 일대',
              crowdLevel: '여유',
              message: '여유로움',
              timestamp: '2025-08-16T18:00:00.000Z',
              rank: 1
            },
            {
              location: '명동 관광특구',
              displayName: '명동 관광특구 일대',
              crowdLevel: '보통',
              message: '보통',
              timestamp: '2025-08-16T18:00:00.000Z',
              rank: 2
            }
          ],
          analysis: {
            mostCrowded: { location: '명동 관광특구', crowdLevel: '보통' },
            leastCrowded: { location: '홍대 관광특구', crowdLevel: '여유' },
            averageCrowdLevel: { level: '보통', score: 1.5 },
            recommendation: {
              bestChoice: '홍대 관광특구',
              reason: '가장 여유로운 곳입니다',
              alternativeOptions: ['명동 관광특구']
            },
            statistics: {
              totalLocations: 2,
              crowdLevelDistribution: { 여유: 1, 보통: 1, 약간붐빔: 0, 붐빔: 0 }
            }
          }
        }
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await comparisonApiService.compareLocations({
        locations: ['홍대', '명동']
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.comparisons).toHaveLength(2);
      expect(result.data!.analysis.recommendation.bestChoice).toBe('홍대 관광특구');
      
      expect(mockedApiClient.post).toHaveBeenCalledWith('/comparison/compare', {
        locations: ['홍대', '명동']
      });
    });

    it('should handle API errors gracefully', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('Network Error'));

      const result = await comparisonApiService.compareLocations({
        locations: ['홍대']
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network Error');
    });

    it('should handle invalid response format', async () => {
      mockedApiClient.post.mockResolvedValue({
        success: false,
        message: 'Invalid request'
      });

      const result = await comparisonApiService.compareLocations({
        locations: ['홍대']
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid request');
    });

    it('should pass options correctly', async () => {
      const mockResponse = {
        success: true,
        data: {
          comparisons: [],
          analysis: {
            mostCrowded: { location: '', crowdLevel: '' },
            leastCrowded: { location: '', crowdLevel: '' },
            averageCrowdLevel: { level: '', score: 0 },
            recommendation: {
              bestChoice: '',
              reason: '',
              alternativeOptions: []
            },
            statistics: {
              totalLocations: 0,
              crowdLevelDistribution: { 여유: 0, 보통: 0, 약간붐빔: 0, 붐빔: 0 }
            }
          }
        }
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      await comparisonApiService.compareLocations({
        locations: ['홍대'],
        options: {
          includeRecommendation: true,
          sortBy: 'crowdLevel',
          maxLocations: 5
        }
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith('/comparison/compare', {
        locations: ['홍대'],
        options: {
          includeRecommendation: true,
          sortBy: 'crowdLevel',
          maxLocations: 5
        }
      });
    });
  });

  describe('checkHealth', () => {
    it('should check service health successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          status: 'healthy',
          timestamp: '2025-08-16T18:00:00.000Z'
        }
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await comparisonApiService.checkHealth();

      expect(result.success).toBe(true);
      expect(result.data!.status).toBe('healthy');
      expect(mockedApiClient.get).toHaveBeenCalledWith('/comparison/health');
    });

    it('should handle health check failures', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Service Unavailable'));

      const result = await comparisonApiService.checkHealth();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Service Unavailable');
    });
  });
});