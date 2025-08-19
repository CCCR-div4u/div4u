import { APIClient } from './apiClient';
import { APIResponse } from '../types/api';

// Comparison Service 전용 타입 정의
export interface ComparisonRequest {
  locations: string[];
  options?: {
    includeRecommendation?: boolean;
    sortBy?: 'crowdLevel' | 'location';
    maxLocations?: number;
  };
}

export interface ComparisonResult {
  location: string;
  displayName: string;
  crowdLevel: "붐빔" | "약간 붐빔" | "보통" | "여유" | "정보없음";
  message: string;
  timestamp: string;
  rank: number;
}

export interface ComparisonAnalysis {
  mostCrowded: {
    location: string;
    crowdLevel: string;
  };
  leastCrowded: {
    location: string;
    crowdLevel: string;
  };
  averageCrowdLevel: {
    level: string;
    score: number;
  };
  recommendation: {
    bestChoice: string;
    reason: string;
    alternativeOptions: string[];
  };
  statistics: {
    totalLocations: number;
    crowdLevelDistribution: {
      여유: number;
      보통: number;
      약간붐빔: number;
      붐빔: number;
    };
  };
}

export interface ComparisonServiceResponse {
  success: boolean;
  data?: {
    comparisons: ComparisonResult[];
    analysis: ComparisonAnalysis;
    timestamp: string;
  };
  error?: string;
}

/**
 * Comparison Service API 클라이언트
 */
export class ComparisonApiService {
  private client: APIClient;
  private baseURL: string;

  constructor() {
    // Comparison Service 전용 클라이언트 생성
    this.baseURL = import.meta.env.VITE_COMPARISON_API_URL || 'http://localhost:3002';
    
    this.client = new APIClient({
      baseURL: this.baseURL,
      timeout: 15000, // 15초 (여러 장소 조회 시 시간이 더 걸릴 수 있음)
      retryConfig: {
        maxRetries: 2, // 비교 서비스는 재시도 횟수를 줄임
        retryDelay: 1000,
      },
    });

    console.log(`🔗 Comparison API Service initialized: ${this.baseURL}`);
  }

  /**
   * 여러 장소의 혼잡도 비교
   */
  async compareLocations(request: ComparisonRequest): Promise<ComparisonServiceResponse> {
    try {
      console.log(`🔍 Comparing ${request.locations.length} locations:`, request.locations);
      
      const startTime = Date.now();
      
      const response = await this.client.post<{
        comparisons: ComparisonResult[];
        analysis: ComparisonAnalysis;
        timestamp: string;
      }>('/api/comparison/compare', request);

      const duration = Date.now() - startTime;
      
      console.log(`✅ Comparison completed in ${duration}ms:`, {
        locations: request.locations.length,
        successful: response.success,
        bestChoice: response.data?.analysis.recommendation.bestChoice
      });

      return {
        success: response.success,
        data: response.data,
        error: response.error
      };

    } catch (error: any) {
      console.error('❌ Comparison API error:', error);
      
      return {
        success: false,
        error: error.message || 'Comparison service is temporarily unavailable'
      };
    }
  }

  /**
   * Comparison Service 헬스체크
   */
  async checkHealth(): Promise<{
    available: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      await this.client.get('/api/comparison/health');
      
      return {
        available: true,
        responseTime: Date.now() - startTime
      };
    } catch (error: any) {
      return {
        available: false,
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  /**
   * 캐시 통계 조회
   */
  async getCacheStats(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const response = await this.client.get('/api/comparison/cache-stats');
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 서비스 정보 조회
   */
  async getServiceInfo(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const response = await this.client.get('/api/comparison/info');
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// 기본 인스턴스 생성 및 내보내기
export const comparisonApiService = new ComparisonApiService();