/**
 * 서울시 API 응답 타입 정의
 */

// 서울시 API 원본 응답 구조
export interface SeoulAPIResponse {
  CITYDATA?: {
    AREA_NM?: string;
    AREA_CD?: string;
    LIVE_PPLTN_STTS?: LivePopulationStatus | LivePopulationStatus[];
    [key: string]: any;
  };
  [key: string]: any;
}

// 실시간 인구 현황 데이터
export interface LivePopulationStatus {
  AREA_CONGEST_LVL?: string;  // 혼잡도 레벨
  AREA_CONGEST_MSG?: string;  // 혼잡도 메시지
  AREA_PPLTN_MIN?: string;    // 최소 인구수
  AREA_PPLTN_MAX?: string;    // 최대 인구수
  MALE_PPLTN_RATE?: string;   // 남성 인구 비율
  FEMALE_PPLTN_RATE?: string; // 여성 인구 비율
  PPLTN_RATE_0?: string;      // 0-10대 인구 비율
  PPLTN_RATE_10?: string;     // 10-20대 인구 비율
  PPLTN_RATE_20?: string;     // 20-30대 인구 비율
  PPLTN_RATE_30?: string;     // 30-40대 인구 비율
  PPLTN_RATE_40?: string;     // 40-50대 인구 비율
  PPLTN_RATE_50?: string;     // 50-60대 인구 비율
  PPLTN_RATE_60?: string;     // 60-70대 인구 비율
  PPLTN_RATE_70?: string;     // 70대 이상 인구 비율
  RESNT_PPLTN_RATE?: string;  // 상주인구 비율
  NON_RESNT_PPLTN_RATE?: string; // 비상주인구 비율
  REPLACE_YN?: string;        // 대체 여부
  PPLTN_TIME?: string;        // 인구 집계 시간
  [key: string]: any;
}

// 가공된 혼잡도 데이터
export interface CongestionData {
  areaName: string;           // 지역명
  congestionLevel: string;    // 정규화된 혼잡도 레벨
  congestionMessage: string;  // 혼잡도 메시지
  timestamp: Date;            // 조회 시간
  updateTime?: string;        // 데이터 업데이트 시간
  rawData?: {                 // 원본 데이터 (디버깅용)
    areaCode?: string;
    originalLevel?: string;
    originalMessage?: string;
    apiResponse?: any;
    error?: string;
    fallback?: boolean;
  };
}

// API 응답 래퍼
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// 자연어 처리 결과
export interface NLPResult {
  extractedLocation: string;
  matchedAreaName: string;
  confidence: number;
  originalQuery: string;
  suggestedLocations?: string[];
}

// 혼잡도 조회 요청
export interface CongestionQueryRequest {
  query: string;
  serviceType?: 'realtime' | 'prediction';
}

// 혼잡도 조회 응답
export interface CongestionQueryResponse {
  location: string;
  crowdLevel: string;
  message: string;
  timestamp: string;
  updateTime?: string;
  success: boolean;
  confidence?: number;
  suggestions?: string[];
  recommendations?: SupportedLocation[];
}

// 에러 응답
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  details?: any;
}

// 서울시 장소 데이터
export interface SupportedLocation {
  areaCode: string;
  areaName: string;
  displayName: string;
  engName: string;
  category: string;
  keywords: string[];
}

// 장소 카테고리 타입
export type LocationCategory = '관광특구' | '인구밀집지역' | '발달상권' | '공원' | '고궁·문화유산';

// 카테고리 정보
export interface CategoryInfo {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
}

// API 상태 체크 결과
export interface APIStatusResult {
  available: boolean;
  responseTime: number;
  error?: string;
}

// 혼잡도 레벨 정보
export interface CongestionLevelInfo {
  level: string;
  description: string;
  color: string;
}