import axios, { AxiosResponse } from 'axios';
import { parseStringPromise } from 'xml2js';
import { config } from '../config';
import { SeoulAPIResponse } from '../types';
import { CacheService } from './cacheService';

/**
 * 서울시 실시간 도시데이터 API 연동 서비스
 */
export class SeoulAPIService {
  private readonly apiKey: string;
  private readonly baseURL: string;
  private readonly timeout: number = 10000;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000;
  private cache: CacheService;

  constructor() {
    this.apiKey = config.seoulAPI.key;
    this.baseURL = config.seoulAPI.baseURL;
    this.cache = new CacheService();
    
    if (!this.apiKey) {
      console.warn('⚠️ SEOUL_API_KEY가 설정되지 않았습니다.');
    }
    
    console.log(`🌐 Seoul API Service initialized: ${this.baseURL}`);
  }

  /**
   * 캐시 초기화
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Seoul API Service cache cleared');
  }

  /**
   * 특정 장소의 실시간 혼잡도 조회 (캐싱 적용)
   */
  async getCongestionData(areaName: string): Promise<{
    areaName: string;
    congestionLevel: string;
    congestionMessage: string;
    timestamp: string;
    success: boolean;
    cached?: boolean;
  }> {
    // 캐시 키 생성
    const cacheKey = CacheService.generateKey('congestion', areaName);
    
    // 캐시에서 먼저 확인
    const cachedData = this.cache.get<{
      areaName: string;
      congestionLevel: string;
      congestionMessage: string;
      timestamp: string;
      success: boolean;
    }>(cacheKey);
    
    if (cachedData) {
      console.log(`⚡ Using cached data for: ${areaName}`, {
        congestionLevel: cachedData.congestionLevel,
        timestamp: cachedData.timestamp,
        age: Math.round((Date.now() - new Date(cachedData.timestamp).getTime()) / 1000) + 's'
      });
      return { ...cachedData, cached: true };
    }

    // 캐시에 없으면 API 호출
    const url = this.buildAPIURL(areaName);
    
    try {
      console.log(`🔍 Fetching congestion data for: ${areaName}`);
      const response = await this.makeRequestWithRetry(url);
      const parsedData = await this.parseXMLResponse(response.data);
      
      const result = this.transformToCongestionData(areaName, parsedData);
      
      // 디버깅: 결과 로깅
      console.log(`🔍 API Result for ${areaName}:`, {
        congestionLevel: result.congestionLevel,
        congestionMessage: result.congestionMessage,
        success: result.success,
        timestamp: result.timestamp
      });
      
      // 성공한 경우에만 캐시에 저장
      if (result.success) {
        this.cache.set(cacheKey, result);
      }
      
      return { ...result, cached: false };
    } catch (error) {
      console.error(`❌ Error fetching congestion data for ${areaName}:`, error);
      const fallbackData = this.createFallbackData(areaName, error);
      
      // 실패 데이터는 짧은 시간만 캐시 (1분)
      this.cache.set(cacheKey, fallbackData, 60 * 1000);
      
      return { ...fallbackData, cached: false };
    }
  }

  /**
   * 여러 장소의 혼잡도 데이터 병렬 조회 (캐싱 최적화)
   */
  async getBatchCongestionData(areaNames: string[]): Promise<Array<{
    areaName: string;
    congestionLevel: string;
    congestionMessage: string;
    timestamp: string;
    success: boolean;
    cached?: boolean;
  }>> {
    console.log(`🔄 Batch fetching congestion data for ${areaNames.length} locations`);
    
    const startTime = Date.now();
    
    // 병렬 처리로 성능 최적화
    const promises = areaNames.map(areaName => 
      this.getCongestionData(areaName).catch(error => {
        console.warn(`⚠️ Failed to fetch data for ${areaName}:`, error.message);
        return { ...this.createFallbackData(areaName, error), cached: false };
      })
    );

    const results = await Promise.all(promises);
    
    const successCount = results.filter(r => r.success).length;
    const cachedCount = results.filter(r => r.cached).length;
    const duration = Date.now() - startTime;
    
    console.log(`✅ Batch fetch completed in ${duration}ms:`, {
      total: areaNames.length,
      successful: successCount,
      cached: cachedCount,
      fresh: areaNames.length - cachedCount,
      avgResponseTime: Math.round(duration / areaNames.length)
    });
    
    return results;
  }

  /**
   * API URL 생성
   */
  private buildAPIURL(areaName: string): string {
    // 서울시 실시간 도시데이터 API 엔드포인트
    // 형식: http://openapi.seoul.go.kr:8088/{API_KEY}/xml/citydata/1/5/{AREA_NM}
    return `${this.baseURL}/${this.apiKey}/xml/citydata/1/5/${encodeURIComponent(areaName)}`;
  }

  /**
   * 재시도 로직이 포함된 HTTP 요청
   */
  private async makeRequestWithRetry(url: string, retryCount: number = 0): Promise<AxiosResponse> {
    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Div4u-Comparison-Service/1.0.0',
          'Accept': 'application/xml, text/xml, */*'
        }
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        const delay = this.retryDelay * (retryCount + 1);
        console.warn(`⚠️ API 호출 실패 (${retryCount + 1}/${this.maxRetries + 1}), ${delay}ms 후 재시도...`);
        await this.delay(delay);
        return this.makeRequestWithRetry(url, retryCount + 1);
      }
      
      throw error;
    }
  }

  /**
   * XML 응답 파싱
   */
  private async parseXMLResponse(xmlData: string): Promise<any> {
    try {
      const result = await parseStringPromise(xmlData, {
        explicitArray: false,
        ignoreAttrs: false,
        trim: true
      });

      if (!result) {
        throw new Error('Invalid XML: No parsed result');
      }

      // 가능한 루트 요소들 확인
      const possibleRoots = ['SeoulRtd', 'citydata', 'CITYDATA', 'response', 'result'];
      let rootData = null;
      
      for (const rootKey of possibleRoots) {
        if (result[rootKey]) {
          rootData = result[rootKey];
          break;
        }
      }
      
      if (!rootData) {
        const firstKey = Object.keys(result)[0];
        if (firstKey) {
          rootData = result[firstKey];
        } else {
          throw new Error('No valid root element found in XML response');
        }
      }

      return rootData;
    } catch (error) {
      console.error('❌ XML parsing error:', error);
      throw new Error(`XML 파싱 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 서울시 API 응답을 표준 형태로 변환
   */
  private transformToCongestionData(areaName: string, apiData: any): {
    areaName: string;
    congestionLevel: string;
    congestionMessage: string;
    timestamp: string;
    success: boolean;
  } {
    try {
      const cityData = apiData.CITYDATA || apiData;
      
      let livePopulationData = null;
      
      if (cityData.LIVE_PPLTN_STTS) {
        const livePopulation = cityData.LIVE_PPLTN_STTS;
        
        if (livePopulation.LIVE_PPLTN_STTS) {
          if (Array.isArray(livePopulation.LIVE_PPLTN_STTS)) {
            livePopulationData = livePopulation.LIVE_PPLTN_STTS[0];
          } else {
            livePopulationData = livePopulation.LIVE_PPLTN_STTS;
          }
        } else {
          livePopulationData = livePopulation;
        }
      }
      
      let congestionLevel = '정보없음';
      let congestionMessage = '혼잡도 정보를 가져올 수 없습니다.';
      
      if (livePopulationData) {
        congestionLevel = livePopulationData.AREA_CONGEST_LVL || '정보없음';
        congestionMessage = livePopulationData.AREA_CONGEST_MSG || '혼잡도 정보를 가져올 수 없습니다.';
        
        // 디버깅: 원본 데이터 로깅
        console.log(`🔍 Raw API data for ${areaName}:`, {
          originalLevel: livePopulationData.AREA_CONGEST_LVL,
          originalMessage: livePopulationData.AREA_CONGEST_MSG,
          normalizedLevel: this.normalizeCongestionLevel(congestionLevel)
        });
      }

      return {
        areaName: cityData.AREA_NM || areaName,
        congestionLevel: this.normalizeCongestionLevel(congestionLevel),
        congestionMessage: this.cleanCongestionMessage(congestionMessage),
        timestamp: new Date().toISOString(),
        success: true
      };
    } catch (error) {
      console.error('❌ Data transformation error:', error);
      return this.createFallbackData(areaName, error);
    }
  }

  /**
   * 혼잡도 레벨 정규화
   */
  private normalizeCongestionLevel(level: string): string {
    const levelMap: Record<string, string> = {
      '붐빔': '붐빔',
      '약간 붐빔': '약간 붐빔',
      '보통': '보통',
      '여유': '여유',
      '매우붐빔': '붐빔',
      '조금붐빔': '약간 붐빔',
      '한산함': '여유',
      '정보없음': '정보없음',
      '': '정보없음'
    };

    return levelMap[level] || level || '정보없음';
  }

  /**
   * 혼잡도 메시지 정리
   */
  private cleanCongestionMessage(message: string): string {
    if (!message || message.trim() === '') {
      return '혼잡도 정보를 확인할 수 없습니다.';
    }

    // HTML 태그 제거
    const cleanMessage = message.replace(/<[^>]*>/g, '').trim();
    
    if (cleanMessage === '' || cleanMessage === 'null' || cleanMessage === 'undefined') {
      return '혼잡도 정보를 확인할 수 있습니다.';
    }

    return cleanMessage;
  }

  /**
   * 폴백 데이터 생성 (API 실패 시)
   */
  private createFallbackData(areaName: string, error: any): {
    areaName: string;
    congestionLevel: string;
    congestionMessage: string;
    timestamp: string;
    success: boolean;
  } {
    return {
      areaName,
      congestionLevel: '정보없음',
      congestionMessage: `현재 혼잡도 정보를 가져올 수 없습니다. (${error instanceof Error ? error.message : 'Unknown error'})`,
      timestamp: new Date().toISOString(),
      success: false
    };
  }

  /**
   * 지연 함수
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * API 상태 확인
   */
  async checkAPIStatus(): Promise<{
    available: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      // 테스트용 지역 (강남역)
      await this.getCongestionData('강남역');
      
      return {
        available: true,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        available: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}