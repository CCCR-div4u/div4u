// Page types
export type Page = "home" | "prediction" | "realtime" | "comparison" | "other";

// Search result types
export interface SearchResult {
  location: string;
  crowdLevel: "붐빔" | "약간 붐빔" | "보통" | "여유";
  message: string;
  time: string;
}

// Service item types
export interface ServiceItem {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

// Character state types
export interface CharacterState {
  crowdLevel: "붐빔" | "약간 붐빔" | "보통" | "여유";
  expression: "stressed" | "worried" | "normal" | "happy";
  animation: "shake" | "pulse" | "bounce" | "scale" | "float" | "wiggle";
  aura: "red" | "orange" | "blue" | "green";
  particles: "sweat" | "sparkles" | "hearts" | "stress";
  transition: "smooth" | "bounce" | "elastic";
}

// Animation sequence types
export interface AnimationSequence {
  phases: CharacterState[];
  duration: number;
  loop: boolean;
}

// API request/response types
export interface CongestionQueryRequest {
  query: string;
  serviceType: "realtime" | "prediction";
}

export interface CongestionQueryResponse {
  location: string;
  crowdLevel: string;
  message: string;
  timestamp: string;
  success: boolean;
}

// Location types (백엔드와 동일)
export interface SupportedLocation {
  areaCode: string;        // POI001, POI002 등
  areaName: string;        // 강남 MICE 관광특구
  displayName: string;     // 사용자에게 표시될 이름
  engName: string;         // Gangnam MICE Special Tourist Zone
  category: string;        // 관광특구, 인구밀집지역, 발달상권, 공원, 고궁·문화유산
  keywords: string[];      // 검색용 키워드 배열
}

// 카테고리 타입 정의
export type LocationCategory = 
  | '관광특구' 
  | '고궁·문화유산' 
  | '인구밀집지역' 
  | '발달상권' 
  | '공원';

// 카테고리별 정보
export interface CategoryInfo {
  name: LocationCategory;
  displayName: string;
  description: string;
  icon: string;
  color: string;
}

// API 응답 타입
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// 퍼지 검색 결과 타입
export interface FuzzySearchResult {
  location: SupportedLocation;
  score: number;
}

// NLP 결과 타입 (백엔드와 동일)
export interface NLPResult {
  extractedLocation: string;
  matchedAreaName: string;
  confidence: number;
  originalQuery: string;
  suggestedLocations: string[];
}

// 지능형 검색 결과 타입
export interface IntelligentSearchResult {
  nlpResult: NLPResult;
  fuzzyResults: FuzzySearchResult[];
  intentAnalysis: {
    isCongestionQuery: boolean;
    intentType: 'realtime' | 'prediction' | 'general';
    confidence: number;
  };
  recommendations: SupportedLocation[];
}

// 키워드 추출 결과 타입
export interface KeywordExtractionResult {
  keywords: string[];
  intentAnalysis: {
    isCongestionQuery: boolean;
    intentType: 'realtime' | 'prediction' | 'general';
    confidence: number;
  };
  originalQuery: string;
}

// 혼잡도 데이터 타입 (백엔드와 동일)
export interface CongestionData {
  areaName: string;
  congestionLevel: string;
  congestionMessage: string;
  timestamp: Date;
  rawData?: any;
}

// 혼잡도 질의 결과 타입
export interface CongestionQueryResult {
  nlpResult: NLPResult;
  congestionData?: CongestionData;
  error?: string;
}

// 인기 장소 혼잡도 결과 타입
export interface PopularLocationCongestion {
  location: SupportedLocation;
  congestionData?: CongestionData;
  error?: string;
}

// 서울시 API 상태 타입
export interface SeoulAPIStatus {
  available: boolean;
  responseTime: number;
  error?: string;
}

// 혼잡도 레벨 정보 타입
export interface CongestionLevel {
  level: string;
  description: string;
  color: string;
}