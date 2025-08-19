// 이 파일은 새로운 API 서비스로 대체되었습니다.
// 새로운 서비스들을 사용하세요:
// - congestionService: 혼잡도 관련 API
// - locationService: 장소 관련 API  
// - nlpService: 자연어 처리 API
// - systemService: 시스템 관련 API

export { 
  congestionService, 
  locationService, 
  nlpService, 
  systemService 
} from './congestionService';

// 하위 호환성을 위한 레거시 클래스 (deprecated)
export class LocationAPIService {
  
  /**
   * 모든 장소 목록 조회
   */
  async getAllLocations(): Promise<SupportedLocation[]> {
    try {
      const response = await api.get<APIResponse<SupportedLocation[]>>('/api/locations');
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch locations');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching all locations:', error);
      throw error;
    }
  }
  
  /**
   * 카테고리별 장소 목록 조회
   */
  async getLocationsByCategory(category: LocationCategory): Promise<SupportedLocation[]> {
    try {
      const response = await api.get<APIResponse<SupportedLocation[]>>(`/api/locations/category/${category}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch locations by category');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching locations for category ${category}:`, error);
      throw error;
    }
  }
  
  /**
   * 키워드로 장소 검색
   */
  async searchLocations(query: string): Promise<SupportedLocation[]> {
    try {
      const response = await api.get<APIResponse<SupportedLocation[]>>('/api/locations/search', {
        params: { q: query }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to search locations');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error searching locations:', error);
      throw error;
    }
  }
  
  /**
   * 퍼지 검색 (유사도 기반)
   */
  async fuzzySearchLocations(query: string, threshold: number = 0.6): Promise<FuzzySearchResult[]> {
    try {
      const response = await api.get<APIResponse<FuzzySearchResult[]>>('/api/locations/fuzzy-search', {
        params: { q: query, threshold }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to perform fuzzy search');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error performing fuzzy search:', error);
      throw error;
    }
  }
  
  /**
   * 특정 장소 조회 (지역 코드)
   */
  async getLocationByCode(areaCode: string): Promise<SupportedLocation | null> {
    try {
      const response = await api.get<APIResponse<SupportedLocation>>(`/api/locations/${areaCode}`);
      
      if (!response.data.success) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(response.data.error || 'Failed to fetch location');
      }
      
      return response.data.data || null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error(`Error fetching location ${areaCode}:`, error);
      throw error;
    }
  }
  
  /**
   * 카테고리 정보 조회
   */
  async getCategories(): Promise<CategoryInfo[]> {
    try {
      const response = await api.get<APIResponse<CategoryInfo[]>>('/api/categories');
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch categories');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
  
  /**
   * 자연어 질의 처리 (NLP)
   */
  async processNaturalLanguageQuery(query: string): Promise<NLPResult> {
    try {
      const response = await api.post<APIResponse<NLPResult>>('/api/nlp/query', { query });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to process natural language query');
      }
      
      return response.data.data!;
    } catch (error) {
      console.error('Error processing natural language query:', error);
      throw error;
    }
  }

  /**
   * 지능형 장소 검색 (NLP + 퍼지 매칭 결합)
   */
  async intelligentLocationSearch(query: string): Promise<IntelligentSearchResult> {
    try {
      const response = await api.post<APIResponse<IntelligentSearchResult>>('/api/nlp/intelligent-search', { query });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to perform intelligent search');
      }
      
      return response.data.data!;
    } catch (error) {
      console.error('Error performing intelligent search:', error);
      throw error;
    }
  }

  /**
   * 키워드 추출
   */
  async extractKeywords(query: string): Promise<KeywordExtractionResult> {
    try {
      const response = await api.post<APIResponse<KeywordExtractionResult>>('/api/nlp/extract-keywords', { query });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to extract keywords');
      }
      
      return response.data.data!;
    } catch (error) {
      console.error('Error extracting keywords:', error);
      throw error;
    }
  }

  /**
   * 특정 장소의 혼잡도 조회 (지역 코드)
   */
  async getCongestionByAreaCode(areaCode: string): Promise<CongestionData> {
    try {
      const response = await api.get<APIResponse<CongestionData>>(`/api/congestion/${areaCode}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch congestion data');
      }
      
      return response.data.data!;
    } catch (error) {
      console.error(`Error fetching congestion for ${areaCode}:`, error);
      throw error;
    }
  }

  /**
   * 자연어 질의를 통한 혼잡도 조회
   */
  async getCongestionByQuery(query: string): Promise<CongestionQueryResult> {
    try {
      const response = await api.post<APIResponse<CongestionQueryResult>>('/api/congestion/query', { query });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to process congestion query');
      }
      
      return response.data.data!;
    } catch (error) {
      console.error('Error processing congestion query:', error);
      throw error;
    }
  }

  /**
   * 인기 장소 혼잡도 조회
   */
  async getPopularLocationsCongestion(category?: LocationCategory, limit?: number): Promise<PopularLocationCongestion[]> {
    try {
      const params: any = {};
      if (category) params.category = category;
      if (limit) params.limit = limit;

      const response = await api.get<APIResponse<PopularLocationCongestion[]>>('/api/congestion/popular', { params });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch popular locations congestion');
      }
      
      return response.data.data!;
    } catch (error) {
      console.error('Error fetching popular locations congestion:', error);
      throw error;
    }
  }

  /**
   * 서울시 API 상태 확인
   */
  async checkSeoulAPIStatus(): Promise<SeoulAPIStatus> {
    try {
      const response = await api.get<APIResponse<SeoulAPIStatus>>('/api/seoul-api/status');
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to check Seoul API status');
      }
      
      return response.data.data!;
    } catch (error) {
      console.error('Error checking Seoul API status:', error);
      throw error;
    }
  }

  /**
   * 지원되는 혼잡도 레벨 정보 조회
   */
  async getCongestionLevels(): Promise<CongestionLevel[]> {
    try {
      const response = await api.get<APIResponse<CongestionLevel[]>>('/api/congestion/levels');
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch congestion levels');
      }
      
      return response.data.data!;
    } catch (error) {
      console.error('Error fetching congestion levels:', error);
      throw error;
    }
  }

  /**
   * 헬스체크
   */
  async healthCheck(): Promise<any> {
    try {
      const response = await api.get<APIResponse<any>>('/api/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
export const locationAPI = new LocationAPIService();