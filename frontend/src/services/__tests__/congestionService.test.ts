import { describe, it, expect, vi, beforeEach } from 'vitest'
import { congestionService } from '../congestionService'
import { apiClient } from '../apiClient'

// Mock the apiClient
vi.mock('../apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}))

const mockedApiClient = vi.mocked(apiClient)

describe('congestionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('queryCongestion', () => {
    it('should query congestion successfully', async () => {
      const mockData = {
        location: '홍대입구역',
        crowdLevel: '보통',
        message: '적당한 수준입니다',
        timestamp: '2025-08-13T12:00:00Z',
        confidence: 0.9
      }

      const mockResponse = {
        success: true,
        data: mockData,
        message: 'Success'
      }

      mockedApiClient.post.mockResolvedValueOnce(mockResponse)

      const request = {
        query: '홍대 혼잡도',
        serviceType: 'realtime' as const
      }

      const result = await congestionService.queryCongestion(request)

      expect(mockedApiClient.post).toHaveBeenCalledWith('/congestion/query', request)
      expect(result).toEqual(mockData)
    })

    it('should handle API errors', async () => {
      const mockResponse = {
        success: false,
        data: null,
        message: '장소를 찾을 수 없습니다'
      }

      mockedApiClient.post.mockResolvedValueOnce(mockResponse)

      const request = {
        query: '존재하지않는장소',
        serviceType: 'realtime' as const
      }

      await expect(
        congestionService.queryCongestion(request)
      ).rejects.toThrow('장소를 찾을 수 없습니다')
    })

    it('should handle network errors', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Network Error'))

      const request = {
        query: '홍대',
        serviceType: 'realtime' as const
      }

      await expect(
        congestionService.queryCongestion(request)
      ).rejects.toThrow('Network Error')
    })
  })

  describe('getCongestionByAreaCode', () => {
    it('should get congestion by area code successfully', async () => {
      const mockCongestionData = {
        areaCode: 'POI001',
        areaName: '강남 MICE 관광특구',
        congestionLevel: '보통',
        congestionMessage: '적당한 수준입니다',
        timestamp: '2025-08-13T12:00:00Z'
      }

      const mockResponse = {
        success: true,
        data: mockCongestionData,
        message: 'Success'
      }

      mockedApiClient.get.mockResolvedValueOnce(mockResponse)

      const result = await congestionService.getCongestionByAreaCode('POI001')

      expect(mockedApiClient.get).toHaveBeenCalledWith('/congestion/POI001')
      expect(result).toEqual(mockCongestionData)
    })

    it('should handle area code not found', async () => {
      const mockResponse = {
        success: false,
        data: null,
        message: '지역 코드를 찾을 수 없습니다'
      }

      mockedApiClient.get.mockResolvedValueOnce(mockResponse)

      await expect(
        congestionService.getCongestionByAreaCode('INVALID')
      ).rejects.toThrow('지역 코드를 찾을 수 없습니다')
    })
  })

  describe('getPopularLocationsCongestion', () => {
    it('should get popular locations congestion successfully', async () => {
      const mockPopularData = [
        {
          location: {
            areaCode: 'POI001',
            areaName: '강남 MICE 관광특구',
            displayName: '강남 MICE 일대',
            category: '관광특구'
          },
          congestionData: {
            areaCode: 'POI001',
            congestionLevel: '보통',
            congestionMessage: '적당한 수준입니다'
          }
        }
      ]

      const mockResponse = {
        success: true,
        data: mockPopularData,
        message: 'Success'
      }

      mockedApiClient.get.mockResolvedValueOnce(mockResponse)

      const result = await congestionService.getPopularLocationsCongestion('관광특구', 5)

      expect(mockedApiClient.get).toHaveBeenCalledWith('/congestion/popular?category=%EA%B4%80%EA%B4%91%ED%8A%B9%EA%B5%AC&limit=5')
      expect(result).toEqual(mockPopularData)
    })
  })

  describe('getCongestionLevels', () => {
    it('should get congestion levels successfully', async () => {
      const mockLevels = [
        { level: '붐빔', description: '매우 혼잡', color: 'red' },
        { level: '보통', description: '적당함', color: 'yellow' },
        { level: '여유', description: '한산함', color: 'green' }
      ]

      const mockResponse = {
        success: true,
        data: mockLevels,
        message: 'Success'
      }

      mockedApiClient.get.mockResolvedValueOnce(mockResponse)

      const result = await congestionService.getCongestionLevels()

      expect(mockedApiClient.get).toHaveBeenCalledWith('/congestion/levels')
      expect(result).toEqual(mockLevels)
    })

    it('should handle levels fetch error', async () => {
      const mockResponse = {
        success: false,
        data: null,
        message: '레벨 정보를 가져올 수 없습니다'
      }

      mockedApiClient.get.mockResolvedValueOnce(mockResponse)

      await expect(
        congestionService.getCongestionLevels()
      ).rejects.toThrow('레벨 정보를 가져올 수 없습니다')
    })
  })

  describe('error handling', () => {
    it('should handle timeout errors', async () => {
      const timeoutError = new Error('timeout of 30000ms exceeded')
      timeoutError.name = 'TimeoutError'

      mockedApiClient.post.mockRejectedValueOnce(timeoutError)

      const request = {
        query: '홍대',
        serviceType: 'realtime' as const
      }

      await expect(
        congestionService.queryCongestion(request)
      ).rejects.toThrow('timeout of 30000ms exceeded')
    })

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error')

      mockedApiClient.post.mockRejectedValueOnce(serverError)

      const request = {
        query: '홍대',
        serviceType: 'realtime' as const
      }

      await expect(
        congestionService.queryCongestion(request)
      ).rejects.toThrow('Internal server error')
    })
  })
})