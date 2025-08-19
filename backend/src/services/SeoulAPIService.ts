import axios, { AxiosResponse } from 'axios';
import { parseStringPromise } from 'xml2js';
import { CongestionData } from '../types';

/**
 * 서울시 실시간 도시데이터 API 연동 서비스
 */
export class SeoulAPIService {
  private readonly apiKey: string;
  private readonly baseURL: string;
  private readonly timeout: number = 10000;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000;

  constructor() {
    this.apiKey = process.env.SEOUL_API_KEY || '';
    this.baseURL = process.env.SEOUL_API_BASE_URL || 'http://openapi.seoul.go.kr:8088';
    
    if (!this.apiKey) {
      console.warn('⚠️ SEOUL_API_KEY가 설정되지 않았습니다.');
    }
    
    console.log(`🌐 Seoul API Service initialized: ${this.baseURL}`);
  }

  /**
   * 특정 장소의 실시간 혼잡도 조회
   */
  async getCongestionData(areaCode: string): Promise<CongestionData> {
    const url = this.buildAPIURL(areaCode);
    
    try {
      const response = await this.makeRequestWithRetry(url);
      const parsedData = await this.parseXMLResponse(response.data);
      
      return this.transformToCongestionData(areaCode, parsedData);
    } catch (error) {
      console.error(`Error fetching congestion data for ${areaCode}:`, error);
      throw this.createAPIError(error, areaCode);
    }
  }

  /**
   * 여러 장소의 혼잡도 데이터 일괄 조회
   */
  async getBatchCongestionData(areaCodes: string[]): Promise<CongestionData[]> {
    const promises = areaCodes.map(areaCode => 
      this.getCongestionData(areaCode).catch(error => {
        console.warn(`Failed to fetch data for ${areaCode}:`, error.message);
        return this.createFallbackCongestionData(areaCode, error);
      })
    );

    return Promise.all(promises);
  }

  /**
   * API URL 생성
   */
  private buildAPIURL(areaCode: string): string {
    // 서울시 실시간 도시데이터 API 엔드포인트
    // 형식: http://openapi.seoul.go.kr:8088/{API_KEY}/xml/citydata/1/5/{AREA_CD}
    return `${this.baseURL}/${this.apiKey}/xml/citydata/1/5/${areaCode}`;
  }

  /**
   * 재시도 로직이 포함된 HTTP 요청
   */
  private async makeRequestWithRetry(url: string, retryCount: number = 0): Promise<AxiosResponse> {
    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Div4u-Service/1.0.0',
          'Accept': 'application/xml, text/xml, */*'
        }
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        console.warn(`API 호출 실패 (${retryCount + 1}/${this.maxRetries + 1}), ${this.retryDelay}ms 후 재시도...`);
        await this.delay(this.retryDelay * (retryCount + 1)); // 지수 백오프
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
      // 디버깅용 로그 (필요시 활성화)
      // console.log('Raw XML response length:', xmlData.length);
      // console.log('Raw XML response preview:', xmlData.substring(0, 500));
      
      const result = await parseStringPromise(xmlData, {
        explicitArray: false,
        ignoreAttrs: false,
        trim: true
      });

      // console.log('Parsed XML structure keys:', Object.keys(result || {}));
      
      // 서울시 API 응답 구조 확인 - 다양한 가능한 루트 요소 체크
      if (!result) {
        throw new Error('Invalid XML: No parsed result');
      }

      // 가능한 루트 요소들 확인
      const possibleRoots = ['SeoulRtd', 'citydata', 'CITYDATA', 'response', 'result'];
      let rootData = null;
      
      for (const rootKey of possibleRoots) {
        if (result[rootKey]) {
          rootData = result[rootKey];
          // console.log(`Found root element: ${rootKey}`);
          break;
        }
      }
      
      if (!rootData) {
        // 첫 번째 키를 루트로 사용
        const firstKey = Object.keys(result)[0];
        if (firstKey) {
          rootData = result[firstKey];
          // console.log(`Using first key as root: ${firstKey}`);
        } else {
          throw new Error('No valid root element found in XML response');
        }
      }

      return rootData;
    } catch (error) {
      console.error('XML parsing error:', error);
      console.error('XML data that failed to parse:', xmlData.substring(0, 1000));
      throw new Error(`XML 파싱 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 서울시 API 응답을 CongestionData로 변환
   */
  private transformToCongestionData(areaCode: string, apiData: any): CongestionData {
    try {
      // 서울시 API 응답에서 혼잡도 정보 추출
      const cityData = apiData.CITYDATA || apiData;
      
      // 디버깅용 로그 (필요시 활성화)
      // console.log('🔍 CITYDATA 구조 분석:');
      // console.log('  - AREA_NM:', cityData.AREA_NM);
      // console.log('  - LIVE_PPLTN_STTS 타입:', typeof cityData.LIVE_PPLTN_STTS);
      
      let livePopulationData = null;
      
      // LIVE_PPLTN_STTS 구조 파악 및 데이터 추출
      if (cityData.LIVE_PPLTN_STTS) {
        const livePopulation = cityData.LIVE_PPLTN_STTS;
        
        // 중첩된 LIVE_PPLTN_STTS 구조 처리
        if (livePopulation.LIVE_PPLTN_STTS) {
          if (Array.isArray(livePopulation.LIVE_PPLTN_STTS)) {
            // 배열인 경우 첫 번째 요소 사용
            livePopulationData = livePopulation.LIVE_PPLTN_STTS[0];
            // console.log('  - 배열 형태의 LIVE_PPLTN_STTS 사용');
          } else {
            // 객체인 경우 직접 사용
            livePopulationData = livePopulation.LIVE_PPLTN_STTS;
            // console.log('  - 객체 형태의 LIVE_PPLTN_STTS 사용');
          }
        } else {
          // 직접 LIVE_PPLTN_STTS에 데이터가 있는 경우
          livePopulationData = livePopulation;
          // console.log('  - 직접 LIVE_PPLTN_STTS 사용');
        }
      }
      
      // 혼잡도 레벨과 메시지 추출
      let congestionLevel = '정보없음';
      let congestionMessage = '혼잡도 정보를 가져올 수 없습니다.';
      let updateTime = '';
      
      if (livePopulationData) {
        congestionLevel = (livePopulationData as any).AREA_CONGEST_LVL || '정보없음';
        congestionMessage = (livePopulationData as any).AREA_CONGEST_MSG || '혼잡도 정보를 가져올 수 없습니다.';
        updateTime = (livePopulationData as any).PPLTN_TIME || '';
        
        // console.log('  - 추출된 혼잡도 레벨:', congestionLevel);
        // console.log('  - 추출된 혼잡도 메시지:', congestionMessage.substring(0, 50) + '...');
      }

      // 지역명 추출
      const areaName = cityData.AREA_NM || areaCode;

      return {
        areaName,
        congestionLevel: this.normalizeCongestionLevel(congestionLevel),
        congestionMessage: this.cleanCongestionMessage(congestionMessage),
        timestamp: new Date(),
        updateTime: updateTime,
        rawData: {
          areaCode,
          originalLevel: congestionLevel,
          originalMessage: congestionMessage,
          apiResponse: apiData
        }
      };
    } catch (error) {
      console.error('Data transformation error:', error);
      throw new Error(`데이터 변환 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    
    // 기본 메시지 처리
    if (cleanMessage === '' || cleanMessage === 'null' || cleanMessage === 'undefined') {
      return '혼잡도 정보를 확인할 수 없습니다.';
    }

    return cleanMessage;
  }

  /**
   * API 에러 생성
   */
  private createAPIError(error: any, areaCode: string): Error {
    let message = `서울시 API 호출 실패 (${areaCode})`;
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        message += ': 요청 시간 초과';
      } else if (error.response) {
        message += `: HTTP ${error.response.status} - ${error.response.statusText}`;
      } else if (error.request) {
        message += ': 네트워크 연결 실패';
      } else {
        message += `: ${error.message}`;
      }
    } else if (error instanceof Error) {
      message += `: ${error.message}`;
    }

    const apiError = new Error(message);
    (apiError as any).areaCode = areaCode;
    (apiError as any).originalError = error;
    
    return apiError;
  }

  /**
   * 폴백 혼잡도 데이터 생성 (API 실패 시)
   */
  private createFallbackCongestionData(areaCode: string, error: Error): CongestionData {
    return {
      areaName: areaCode,
      congestionLevel: '정보없음',
      congestionMessage: `현재 혼잡도 정보를 가져올 수 없습니다. (${error.message})`,
      timestamp: new Date(),
      rawData: {
        areaCode,
        error: error.message,
        fallback: true
      }
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
      // 테스트용 지역 코드 (강남역)
      const testAreaCode = 'POI014';
      await this.getCongestionData(testAreaCode);
      
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

  /**
   * 지원되는 혼잡도 레벨 목록
   */
  getSupportedCongestionLevels(): Array<{level: string, description: string, color: string}> {
    return [
      { level: '붐빔', description: '매우 혼잡한 상태', color: '#EF4444' },
      { level: '약간 붐빔', description: '다소 혼잡한 상태', color: '#F59E0B' },
      { level: '보통', description: '보통 수준의 혼잡도', color: '#3B82F6' },
      { level: '여유', description: '여유로운 상태', color: '#10B981' },
      { level: '정보없음', description: '혼잡도 정보 없음', color: '#6B7280' }
    ];
  }
}