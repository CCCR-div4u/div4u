import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Div4u Comparison Service API',
      version: '1.0.0',
      description: 'MSA 기반 서울시 혼잡도 비교 분석 서비스',
      contact: {
        name: 'Div4u Team',
        email: 'dev@div4u.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/comparison`,
        description: 'Development server'
      },
      {
        url: 'https://api.div4u.com/comparison',
        description: 'Production server'
      }
    ],
    components: {
      schemas: {
        ComparisonRequest: {
          type: 'object',
          required: ['locations'],
          properties: {
            locations: {
              type: 'array',
              items: {
                type: 'string'
              },
              minItems: 1,
              maxItems: 10,
              description: '비교할 장소명 배열',
              example: ['홍대', '강남역', '명동']
            },
            options: {
              type: 'object',
              properties: {
                includeRecommendation: {
                  type: 'boolean',
                  description: '추천 정보 포함 여부',
                  default: true
                },
                sortBy: {
                  type: 'string',
                  enum: ['crowdLevel', 'location'],
                  description: '정렬 기준',
                  default: 'crowdLevel'
                },
                maxLocations: {
                  type: 'number',
                  minimum: 1,
                  maximum: 10,
                  description: '최대 처리 장소 수',
                  default: 10
                }
              }
            }
          }
        },
        ComparisonResult: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: '원본 장소명',
              example: '홍대 관광특구'
            },
            displayName: {
              type: 'string',
              description: 'UI 표시용 장소명',
              example: '홍대 관광특구 일대'
            },
            crowdLevel: {
              type: 'string',
              enum: ['여유', '보통', '약간 붐빔', '붐빔', '정보없음'],
              description: '혼잡도 레벨',
              example: '여유'
            },
            message: {
              type: 'string',
              description: '혼잡도 상세 메시지',
              example: '사람이 몰려있을 가능성이 낮고 붐빔은 거의 느껴지지 않아요.'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: '데이터 조회 시간',
              example: '2025-08-16T18:00:00.000Z'
            },
            rank: {
              type: 'number',
              description: '혼잡도 순위 (1부터 시작)',
              example: 1
            }
          }
        },
        ComparisonAnalysis: {
          type: 'object',
          properties: {
            mostCrowded: {
              type: 'object',
              properties: {
                location: { type: 'string', example: '강남역' },
                crowdLevel: { type: 'string', example: '붐빔' }
              }
            },
            leastCrowded: {
              type: 'object',
              properties: {
                location: { type: 'string', example: '홍대 관광특구' },
                crowdLevel: { type: 'string', example: '여유' }
              }
            },
            averageCrowdLevel: {
              type: 'object',
              properties: {
                level: { type: 'string', example: '보통' },
                score: { type: 'number', example: 2.3 }
              }
            },
            recommendation: {
              type: 'object',
              properties: {
                bestChoice: { type: 'string', example: '홍대 관광특구' },
                reason: { type: 'string', example: '현재 가장 여유로워서 편안하게 이용할 수 있습니다' },
                alternativeOptions: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['명동 관광특구']
                }
              }
            },
            statistics: {
              type: 'object',
              properties: {
                totalLocations: { type: 'number', example: 3 },
                crowdLevelDistribution: {
                  type: 'object',
                  properties: {
                    여유: { type: 'number', example: 1 },
                    보통: { type: 'number', example: 1 },
                    약간붐빔: { type: 'number', example: 0 },
                    붐빔: { type: 'number', example: 1 }
                  }
                }
              }
            }
          }
        },
        ComparisonResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: '요청 성공 여부',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                comparisons: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ComparisonResult' }
                },
                analysis: { $ref: '#/components/schemas/ComparisonAnalysis' }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: '응답 생성 시간',
              example: '2025-08-16T18:00:00.000Z'
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'unhealthy'],
              example: 'healthy'
            },
            service: {
              type: 'string',
              example: 'comparison-service'
            },
            version: {
              type: 'string',
              example: '1.0.0'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-08-16T18:00:00.000Z'
            },
            uptime: {
              type: 'number',
              description: '서비스 실행 시간 (초)',
              example: 123.456
            },
            memory: {
              type: 'object',
              properties: {
                used: { type: 'number', description: '사용 중인 메모리 (MB)' },
                total: { type: 'number', description: '전체 메모리 (MB)' },
                percentage: { type: 'number', description: '메모리 사용률 (%)' }
              }
            },
            dependencies: {
              type: 'object',
              properties: {
                seoulAPI: { type: 'string', enum: ['healthy', 'unhealthy'] },
                cache: { type: 'string', enum: ['healthy', 'unhealthy'] }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: '에러 메시지',
              example: 'Validation failed'
            },
            code: {
              type: 'string',
              description: '에러 코드',
              example: 'VALIDATION_ERROR'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-08-16T18:00:00.000Z'
            }
          }
        }
      },
      responses: {
        ValidationError: {
          description: '요청 데이터 유효성 검사 실패',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                error: 'Validation failed: locations array is required',
                code: 'VALIDATION_ERROR',
                timestamp: '2025-08-16T18:00:00.000Z'
              }
            }
          }
        },
        TooManyLocations: {
          description: '최대 장소 수 초과',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                error: 'Too many locations provided. Maximum 10 locations allowed.',
                code: 'TOO_MANY_LOCATIONS',
                timestamp: '2025-08-16T18:00:00.000Z'
              }
            }
          }
        },
        RateLimitExceeded: {
          description: '요청 한도 초과',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                error: 'Rate limit exceeded. Try again later.',
                code: 'RATE_LIMIT_EXCEEDED',
                timestamp: '2025-08-16T18:00:00.000Z'
              }
            }
          }
        },
        InternalError: {
          description: '내부 서버 오류',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                error: 'Internal server error',
                code: 'INTERNAL_ERROR',
                timestamp: '2025-08-16T18:00:00.000Z'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: '서비스 상태 확인'
      },
      {
        name: 'Comparison',
        description: '혼잡도 비교 및 분석'
      },
      {
        name: 'Development',
        description: '개발 및 테스트용 엔드포인트'
      }
    ]
  },
  apis: [
    './src/routes/*.ts', // API 라우트 파일들
    './src/types/*.ts'   // 타입 정의 파일들
  ],
};

export const swaggerSpec = swaggerJsdoc(options);