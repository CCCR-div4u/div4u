// API 요청/응답 타입 정의

// 기본 API 응답 래퍼
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// 에러 응답
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  details?: any;
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
  success: boolean;
  confidence?: number;
  suggestions?: string[];
  recommendations?: Location[];
}

// 장소 정보
export interface Location {
  areaCode: string;
  areaName: string;
  displayName: string;
  engName: string;
  category: string;
  keywords: string[];
}

// 혼잡도 데이터
export interface CongestionData {
  areaName: string;
  congestionLevel: string;
  congestionMessage: string;
  timestamp: Date;
  updateTime?: string;
  rawData?: any;
}

// NLP 결과
export interface NLPResult {
  extractedLocation: string;
  matchedAreaName: string;
  confidence: number;
  originalQuery: string;
  suggestedLocations?: string[];
}

// API 에러 타입
export interface APIError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

// 채팅 메시지 타입
export interface ChatMessage {
  id: string;
  type: 'user' | 'foru';
  content: string;
  timestamp: string;
  location?: string;
  congestionLevel?: string;
  congestionMessage?: string;
  updateTime?: string;
  reliability?: string;
}

// 포유 캐릭터 상태
export type ForuState = 'default' | 'loading' | 'happy' | 'worried' | 'stressed' | 'confused';

// 재시도 설정
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryCondition?: (error: any) => boolean;
}

// API 클라이언트 설정
export interface APIClientConfig {
  baseURL: string;
  timeout: number;
  retryConfig: RetryConfig;
}