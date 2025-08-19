// Request/Response Types
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

export interface ComparisonResponse {
  success: boolean;
  data?: {
    comparisons: ComparisonResult[];
    analysis: ComparisonAnalysis;
    timestamp: string;
  };
  error?: string;
}

// Seoul API Types
export interface SeoulAPIResponse {
  AREA_NM: string;
  AREA_CONGEST_LVL: string;
  AREA_CONGEST_MSG: string;
  PPLTN_TIME: string;
}

export interface LocationQuery {
  originalQuery: string;
  extractedLocation: string;
  matchedAreaName: string;
  confidence: number;
}

// Error Types
export interface ComparisonServiceError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Health Check Types
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  service: string;
  version: string;
  timestamp: string;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  dependencies: {
    seoulAPI: 'healthy' | 'unhealthy';
    cache: 'healthy' | 'unhealthy';
  };
}