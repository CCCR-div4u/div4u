import { ComparisonService } from '../../services/comparisonService';
import { ComparisonRequest } from '../../types';
import axios from 'axios';

// axios 모킹
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ComparisonService', () => {
  let comparisonService: ComparisonService;

  beforeEach(() => {
    comparisonService = new ComparisonService();
    jest.clearAllMocks();
  });

  describe('compareLocations', () => {
    it('should successfully compare locations with Core API data', async () => {
      // Mock Core API responses
      mockedAxios.post
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              location: '홍대 관광특구',
              crowdLevel: '여유',
              message: '사람이 몰려있을 가능성이 낮고 붐빔은 거의 느껴지지 않아요.',
              timestamp: '2025-08-16T18:00:00.000Z'
            }
          }
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              location: '이태원 관광특구',
              crowdLevel: '약간 붐빔',
              message: '사람들이 몰려있을 가능성이 크고 붐빈다고 느낄 수 있어요.',
              timestamp: '2025-08-16T18:00:00.000Z'
            }
          }
        });

      const request: ComparisonRequest = {
        locations: ['홍대', '이태원']
      };

      const result = await comparisonService.compareLocations(request);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.comparisons).toHaveLength(2);
      
      // 추천 알고리즘 검증: 여유한 곳이 우선 추천되어야 함
      expect(result.data!.analysis.recommendation.bestChoice).toBe('홍대 관광특구');
      expect(result.data!.analysis.leastCrowded.location).toBe('홍대 관광특구');
      expect(result.data!.analysis.mostCrowded.location).toBe('이태원 관광특구');
    });

    it('should handle Core API failures gracefully', async () => {
      // Mock Core API failure
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      const request: ComparisonRequest = {
        locations: ['홍대']
      };

      const result = await comparisonService.compareLocations(request);

      expect(result.success).toBe(true);
      expect(result.data?.comparisons[0]?.crowdLevel).toBe('정보없음');
    });

    it('should correctly sort locations by crowd level', async () => {
      // Mock responses with different crowd levels
      mockedAxios.post
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              location: '장소1',
              crowdLevel: '붐빔',
              message: '매우 붐빔',
              timestamp: '2025-08-16T18:00:00.000Z'
            }
          }
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              location: '장소2',
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
              location: '장소3',
              crowdLevel: '보통',
              message: '보통',
              timestamp: '2025-08-16T18:00:00.000Z'
            }
          }
        });

      const request: ComparisonRequest = {
        locations: ['장소1', '장소2', '장소3'],
        options: { sortBy: 'crowdLevel' }
      };

      const result = await comparisonService.compareLocations(request);

      expect(result.success).toBe(true);
      
      // 혼잡도 순으로 정렬되어야 함: 여유 -> 보통 -> 붐빔
      const comparisons = result.data?.comparisons;
      expect(comparisons?.[0]?.crowdLevel).toBe('여유');
      expect(comparisons?.[1]?.crowdLevel).toBe('보통');
      expect(comparisons?.[2]?.crowdLevel).toBe('붐빔');
    });

    it('should recommend the least crowded location', async () => {
      // Mock responses
      mockedAxios.post
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              location: '붐비는곳',
              crowdLevel: '약간 붐빔',
              message: '약간 붐빔',
              timestamp: '2025-08-16T18:00:00.000Z'
            }
          }
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              location: '여유로운곳',
              crowdLevel: '여유',
              message: '여유로움',
              timestamp: '2025-08-16T18:00:00.000Z'
            }
          }
        });

      const request: ComparisonRequest = {
        locations: ['붐비는곳', '여유로운곳']
      };

      const result = await comparisonService.compareLocations(request);

      expect(result.success).toBe(true);
      expect(result.data!.analysis.recommendation.bestChoice).toBe('여유로운곳');
      expect(result.data!.analysis.recommendation.alternativeOptions).toContain('붐비는곳');
    });

    it('should handle empty locations array', async () => {
      const request: ComparisonRequest = {
        locations: []
      };

      const result = await comparisonService.compareLocations(request);

      expect(result.success).toBe(true);
      expect(result.data!.comparisons).toHaveLength(0);
      expect(result.data!.analysis.recommendation.bestChoice).toBe('알 수 없음');
    });
  });
});