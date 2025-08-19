# Comparison Service API Documentation

## Overview

Div4u Comparison Service provides RESTful APIs for comparing congestion levels across multiple locations in Seoul and recommending optimal choices.

**Base URL**: `http://localhost:3002/api/comparison`

**Version**: 1.0.0

## Authentication

Currently, no authentication is required for API access.

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-08-16T18:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-08-16T18:00:00.000Z"
}
```

## Endpoints

### Health Check

#### `GET /health`

Check service health status.

**Response**: `200 OK`
```json
{
  "status": "healthy",
  "service": "comparison-service",
  "version": "1.0.0",
  "timestamp": "2025-08-16T18:00:00.000Z",
  "uptime": 123.456,
  "memory": {
    "used": 45.2,
    "total": 128.0,
    "percentage": 35.3
  },
  "dependencies": {
    "seoulAPI": "healthy",
    "cache": "healthy"
  }
}
```

**Status Codes**:
- `200`: Service is healthy
- `503`: Service is unhealthy

---

### Service Information

#### `GET /info`

Get service information and available features.

**Response**: `200 OK`
```json
{
  "service": "comparison-service",
  "version": "1.0.0",
  "description": "MSA 기반 혼잡도 비교 분석 서비스",
  "endpoints": [
    "/health",
    "/info", 
    "/compare",
    "/test",
    "/cache/clear"
  ],
  "features": [
    "multi-location-comparison",
    "smart-recommendation", 
    "nlp-processing",
    "caching",
    "fallback-mechanism"
  ],
  "limits": {
    "maxLocations": 10,
    "rateLimit": "100/min",
    "cacheTTL": "1min"
  }
}
```

---

### Compare Locations

#### `POST /compare`

Compare congestion levels across multiple locations and get recommendations.

**Request Body**:
```json
{
  "locations": ["홍대", "강남역", "명동"],
  "options": {
    "includeRecommendation": true,
    "sortBy": "crowdLevel",
    "maxLocations": 10
  }
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `locations` | `string[]` | ✅ | Array of location names (max 10) |
| `options.includeRecommendation` | `boolean` | ❌ | Include recommendation analysis (default: true) |
| `options.sortBy` | `string` | ❌ | Sort order: "crowdLevel" or "location" |
| `options.maxLocations` | `number` | ❌ | Maximum locations to process (default: 10) |

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "comparisons": [
      {
        "location": "홍대 관광특구",
        "displayName": "홍대 관광특구 일대",
        "crowdLevel": "여유",
        "message": "사람이 몰려있을 가능성이 낮고 붐빔은 거의 느껴지지 않아요. 도보 이동이 자유로워요.",
        "timestamp": "2025-08-16T18:00:00.000Z",
        "rank": 1
      },
      {
        "location": "명동 관광특구",
        "displayName": "명동 관광특구 일대", 
        "crowdLevel": "보통",
        "message": "사람이 몰려있을 수 있지만 크게 붐비지는 않아요. 도보 이동에 큰 제약이 없어요.",
        "timestamp": "2025-08-16T18:00:00.000Z",
        "rank": 2
      },
      {
        "location": "강남역",
        "displayName": "강남역 일대",
        "crowdLevel": "붐빔", 
        "message": "사람이 매우 많이 몰려있어 붐빈다고 느낄 수 있어요. 도보 이동시 부딪힘이 발생할 수 있어요.",
        "timestamp": "2025-08-16T18:00:00.000Z",
        "rank": 3
      }
    ],
    "analysis": {
      "mostCrowded": {
        "location": "강남역",
        "crowdLevel": "붐빔"
      },
      "leastCrowded": {
        "location": "홍대 관광특구", 
        "crowdLevel": "여유"
      },
      "averageCrowdLevel": {
        "level": "보통",
        "score": 2.3
      },
      "recommendation": {
        "bestChoice": "홍대 관광특구",
        "reason": "현재 가장 여유로워서 편안하게 이용할 수 있습니다. 다양한 혼잡도 옵션이 있어 취향에 맞게 선택할 수 있습니다.",
        "alternativeOptions": ["명동 관광특구"]
      },
      "statistics": {
        "totalLocations": 3,
        "crowdLevelDistribution": {
          "여유": 1,
          "보통": 1, 
          "약간붐빔": 0,
          "붐빔": 1
        }
      }
    }
  },
  "timestamp": "2025-08-16T18:00:00.000Z"
}
```

**Crowd Levels**:
- `여유`: Very comfortable, free movement
- `보통`: Moderate, some people but manageable  
- `약간 붐빔`: Somewhat crowded, may feel busy
- `붐빔`: Very crowded, movement restrictions
- `정보없음`: No data available

**Error Responses**:

`400 Bad Request` - Invalid request
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "locations",
    "message": "locations array is required"
  }
}
```

`400 Bad Request` - Too many locations
```json
{
  "success": false,
  "error": "Too many locations provided. Maximum 10 locations allowed.",
  "code": "TOO_MANY_LOCATIONS"
}
```

`400 Bad Request` - Empty locations
```json
{
  "success": false,
  "error": "At least one location is required",
  "code": "EMPTY_LOCATIONS"
}
```

`429 Too Many Requests` - Rate limit exceeded
```json
{
  "success": false,
  "error": "Rate limit exceeded. Try again later.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

`500 Internal Server Error` - Server error
```json
{
  "success": false,
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

### Test Endpoint

#### `POST /test`

Generate test data with various crowd levels for development and testing.

**Request Body**:
```json
{
  "locations": ["장소1", "장소2", "장소3", "장소4"]
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "comparisons": [
      {
        "location": "장소1",
        "displayName": "장소1 일대",
        "crowdLevel": "약간 붐빔",
        "message": "테스트 데이터: 약간 붐빔 상태입니다.",
        "timestamp": "2025-08-16T18:00:00.000Z",
        "rank": 1
      },
      {
        "location": "장소2", 
        "displayName": "장소2 일대",
        "crowdLevel": "여유",
        "message": "테스트 데이터: 여유 상태입니다.",
        "timestamp": "2025-08-16T18:00:00.000Z",
        "rank": 2
      }
    ],
    "analysis": {
      "recommendation": {
        "bestChoice": "장소2",
        "reason": "현재 가장 여유로워서 편안하게 이용할 수 있습니다",
        "alternativeOptions": ["장소1"]
      }
    }
  }
}
```

**Note**: Test endpoint cycles through crowd levels: 약간 붐빔 → 여유 → 보통 → 붐빔

---

### Cache Management

#### `POST /cache/clear`

Clear service cache (development use only).

**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Cache cleared successfully",
  "timestamp": "2025-08-16T18:00:00.000Z"
}
```

---

## Data Models

### ComparisonResult
```typescript
interface ComparisonResult {
  location: string;           // Original location name
  displayName: string;        // Display name for UI
  crowdLevel: CrowdLevel;     // Congestion level
  message: string;            // Descriptive message
  timestamp: string;          // ISO timestamp
  rank: number;              // Ranking (1-based)
}
```

### ComparisonAnalysis
```typescript
interface ComparisonAnalysis {
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
```

### CrowdLevel
```typescript
type CrowdLevel = "여유" | "보통" | "약간 붐빔" | "붐빔" | "정보없음";
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `TOO_MANY_LOCATIONS` | Exceeded maximum location limit |
| `EMPTY_LOCATIONS` | No locations provided |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Internal server error |
| `SERVICE_UNAVAILABLE` | External service unavailable |

## Examples

### cURL Examples

**Health Check**:
```bash
curl -X GET http://localhost:3002/api/comparison/health
```

**Compare Locations**:
```bash
curl -X POST http://localhost:3002/api/comparison/compare \
  -H "Content-Type: application/json" \
  -d '{
    "locations": ["홍대", "강남역", "명동"],
    "options": {
      "includeRecommendation": true,
      "sortBy": "crowdLevel"
    }
  }'
```

**Test Data**:
```bash
curl -X POST http://localhost:3002/api/comparison/test \
  -H "Content-Type: application/json" \
  -d '{"locations": ["테스트1", "테스트2"]}'
```

### JavaScript Examples

**Using fetch**:
```javascript
// Compare locations
const response = await fetch('http://localhost:3002/api/comparison/compare', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    locations: ['홍대', '강남역', '명동'],
    options: {
      includeRecommendation: true,
      sortBy: 'crowdLevel'
    }
  })
});

const data = await response.json();
console.log(data);
```

**Using axios**:
```javascript
import axios from 'axios';

const compareLocations = async (locations) => {
  try {
    const response = await axios.post('http://localhost:3002/api/comparison/compare', {
      locations,
      options: {
        includeRecommendation: true,
        sortBy: 'crowdLevel'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Usage
const result = await compareLocations(['홍대', '강남역', '명동']);
```

## SDK Support

Currently, no official SDKs are available. The service provides standard REST APIs that can be consumed by any HTTP client.

## Changelog

### v1.0.0 (2025-08-16)
- Initial release
- Multi-location comparison
- Smart recommendation algorithm
- NLP processing for location names
- Caching support
- Rate limiting
- Comprehensive error handling

---

For more information, see the [README](../README.md) or contact the development team.