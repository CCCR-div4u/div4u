import { apiClient } from './apiClient';
import { 
  CongestionQueryRequest, 
  CongestionQueryResponse, 
  Location, 
  CongestionData,
  NLPResult,
  APIResponse 
} from '../types/api';

/**
 * 혼잡도 서비스 API 클래스
 */
export class CongestionService {
  /**
   * 자연어 질의를 통한 혼잡도 조회
   */
  async queryCongestion(request: CongestionQueryRequest): Promise<CongestionQueryResponse> {
    const response = await apiClient.post<CongestionQueryResponse>('/congestion/query', request);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || '혼잡도 정보를 가져올 수 없습니다.');
    }
    
    return response.data;
  }

  /**
   * 지역 코드로 혼잡도 조회
   */
  async getCongestionByAreaCode(areaCode: string): Promise<CongestionData> {
    const response = await apiClient.get<CongestionData>(`/congestion/${areaCode}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || '혼잡도 정보를 가져올 수 없습니다.');
    }
    
    return response.data;
  }

  /**
   * 인기 장소 혼잡도 조회
   */
  async getPopularLocationsCongestion(category?: string, limit: number = 5): Promise<Array<{
    location: Location;
    congestionData?: CongestionData;
    error?: string;
  }>> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('limit', limit.toString());

    const response = await apiClient.get<Array<{
      location: Location;
      congestionData?: CongestionData;
      error?: string;
    }>>(`/congestion/popular?${params.toString()}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || '인기 장소 혼잡도 정보를 가져올 수 없습니다.');
    }
    
    return response.data;
  }

  /**
   * 혼잡도 레벨 정보 조회
   */
  async getCongestionLevels(): Promise<Array<{level: string, description: string, color: string}>> {
    const response = await apiClient.get<Array<{level: string, description: string, color: string}>>('/congestion/levels');
    
    if (!response.success || !response.data) {
      throw new Error(response.message || '혼잡도 레벨 정보를 가져올 수 없습니다.');
    }
    
    return response.data;
  }
}

/**
 * 장소 서비스 API 클래스
 */
export class LocationService {
  /**
   * 모든 장소 목록 조회
   */
  async getAllLocations(): Promise<Location[]> {
    const response = await apiClient.get<Location[]>('/locations');
    
    if (!response.success || !response.data) {
      throw new Error(response.message || '장소 목록을 가져올 수 없습니다.');
    }
    
    return response.data;
  }

  /**
   * 카테고리별 장소 목록 조회
   */
  async getLocationsByCategory(category: string): Promise<Location[]> {
    const response = await apiClient.get<Location[]>(`/locations/category/${category}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || '카테고리별 장소 목록을 가져올 수 없습니다.');
    }
    
    return response.data;
  }

  /**
   * 키워드로 장소 검색
   */
  async searchLocations(query: string): Promise<Location[]> {
    const response = await apiClient.get<Location[]>(`/locations/search?q=${encodeURIComponent(query)}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || '장소 검색 결과를 가져올 수 없습니다.');
    }
    
    return response.data;
  }

  /**
   * 퍼지 검색 (유사도 기반)
   */
  async fuzzySearchLocations(query: string, threshold: number = 0.6): Promise<Array<{
    location: Location;
    score: number;
  }>> {
    const response = await apiClient.get<Array<{
      location: Location;
      score: number;
    }>>(`/locations/fuzzy-search?q=${encodeURIComponent(query)}&threshold=${threshold}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || '퍼지 검색 결과를 가져올 수 없습니다.');
    }
    
    return response.data;
  }

  /**
   * 특정 장소 조회
   */
  async getLocationByCode(areaCode: string): Promise<Location> {
    const response = await apiClient.get<Location>(`/locations/${areaCode}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || '장소 정보를 가져올 수 없습니다.');
    }
    
    return response.data;
  }

  /**
   * 카테고리 정보 조회
   */
  async getCategories(): Promise<Array<{
    name: string;
    displayName: string;
    description: string;
    icon: string;
    color: string;
  }>> {
    const response = await apiClient.get<Array<{
      name: string;
      displayName: string;
      description: string;
      icon: string;
      color: string;
    }>>('/categories');
    
    if (!response.success || !response.data) {
      throw new Error(response.message || '카테고리 정보를 가져올 수 없습니다.');
    }
    
    return response.data;
  }
}

/**
 * NLP 서비스 API 클래스
 */
export class NLPService {
  /**
   * 자연어 질의 처리
   */
  async processQuery(query: string): Promise<NLPResult> {
    const response = await apiClient.post<NLPResult>('/nlp/query', { query });
    
    if (!response.success || !response.data) {
      throw new Error(response.message || '자연어 처리 결과를 가져올 수 없습니다.');
    }
    
    return response.data;
  }

  /**
   * 지능형 장소 검색
   */
  async intelligentSearch(query: string): Promise<{
    nlpResult: NLPResult;
    fuzzyResults: Array<{location: Location, score: number}>;
    intentAnalysis: {
      isCongestionQuery: boolean;
      intentType: 'realtime' | 'prediction' | 'general';
      confidence: number;
    };
  }> {
    const response = await apiClient.post<{
      nlpResult: NLPResult;
      fuzzyResults: Array<{location: Location, score: number}>;
      intentAnalysis: {
        isCongestionQuery: boolean;
        intentType: 'realtime' | 'prediction' | 'general';
        confidence: number;
      };
    }>('/nlp/intelligent-search', { query });
    
    if (!response.success || !response.data) {
      throw new Error(response.message || '지능형 검색 결과를 가져올 수 없습니다.');
    }
    
    return response.data;
  }

  /**
   * 키워드 추출
   */
  async extractKeywords(query: string): Promise<{
    keywords: string[];
    intentAnalysis: {
      isCongestionQuery: boolean;
      intentType: 'realtime' | 'prediction' | 'general';
      confidence: number;
    };
    originalQuery: string;
  }> {
    const response = await apiClient.post<{
      keywords: string[];
      intentAnalysis: {
        isCongestionQuery: boolean;
        intentType: 'realtime' | 'prediction' | 'general';
        confidence: number;
      };
      originalQuery: string;
    }>('/nlp/extract-keywords', { query });
    
    if (!response.success || !response.data) {
      throw new Error(response.message || '키워드 추출 결과를 가져올 수 없습니다.');
    }
    
    return response.data;
  }
}

/**
 * 시스템 서비스 API 클래스
 */
export class SystemService {
  /**
   * 헬스체크
   */
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    locationStats: any;
    uptime: number;
    memory: any;
    version: string;
  }> {
    const response = await apiClient.get<{
      status: string;
      timestamp: string;
      locationStats: any;
      uptime: number;
      memory: any;
      version: string;
    }>('/health');
    
    if (!response.success || !response.data) {
      throw new Error(response.message || '헬스체크 정보를 가져올 수 없습니다.');
    }
    
    return response.data;
  }

  /**
   * 서울시 API 상태 확인
   */
  async checkSeoulAPIStatus(): Promise<{
    available: boolean;
    responseTime: number;
    error?: string;
  }> {
    const response = await apiClient.get<{
      available: boolean;
      responseTime: number;
      error?: string;
    }>('/seoul-api/status');
    
    if (!response.success || !response.data) {
      throw new Error(response.message || '서울시 API 상태를 확인할 수 없습니다.');
    }
    
    return response.data;
  }
}

// 서비스 인스턴스 생성 및 내보내기
export const congestionService = new CongestionService();
export const locationService = new LocationService();
export const nlpService = new NLPService();
export const systemService = new SystemService();