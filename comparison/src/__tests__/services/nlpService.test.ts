import { NLPService } from '../../services/nlpService';

describe('NLPService', () => {
  let nlpService: NLPService;
  const mockSeoulPlaces = [
    {
      areaCode: 'POI001',
      areaName: '홍대 관광특구',
      displayName: '홍대 일대',
      engName: 'Hongdae Special Tourist Zone',
      category: '관광특구',
      keywords: ['홍대', '홍익대', '홍대입구']
    },
    {
      areaCode: 'POI002',
      areaName: '명동 관광특구',
      displayName: '명동 일대',
      engName: 'Myeongdong Special Tourist Zone',
      category: '관광특구',
      keywords: ['명동', '남대문']
    },
    {
      areaCode: 'POI003',
      areaName: '강남역',
      displayName: '강남역 일대',
      engName: 'Gangnam Station',
      category: '인구밀집지역',
      keywords: ['강남역', '강남', '테헤란로']
    }
  ];

  beforeEach(() => {
    nlpService = new NLPService();
  });

  describe('processNaturalLanguageQuery', () => {
    it('should match exact area name', () => {
      const result = nlpService.processNaturalLanguageQuery('홍대 관광특구', mockSeoulPlaces);
      
      expect(result.matchedAreaName).toBe('홍대 관광특구');
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('should match by keyword', () => {
      const result = nlpService.processNaturalLanguageQuery('홍대', mockSeoulPlaces);
      
      expect(result.matchedAreaName).toBe('홍대 관광특구');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should match by partial string', () => {
      const result = nlpService.processNaturalLanguageQuery('강남', mockSeoulPlaces);
      
      expect(result.matchedAreaName).toBe('강남역');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should handle case insensitive matching', () => {
      const result = nlpService.processNaturalLanguageQuery('HONGDAE', mockSeoulPlaces);
      
      expect(result.matchedAreaName).toBe('홍대 관광특구');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should return low confidence for no match', () => {
      const result = nlpService.processNaturalLanguageQuery('존재하지않는장소', mockSeoulPlaces);
      
      expect(result.confidence).toBe(0);
      expect(result.matchedAreaName).toBe('');
    });

    it('should handle empty query', () => {
      const result = nlpService.processNaturalLanguageQuery('', mockSeoulPlaces);
      
      expect(result.confidence).toBe(0);
      expect(result.matchedAreaName).toBe('');
    });

    it('should handle whitespace in query', () => {
      const result = nlpService.processNaturalLanguageQuery('  홍대  ', mockSeoulPlaces);
      
      expect(result.matchedAreaName).toBe('홍대 관광특구');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should prefer exact matches over partial matches', () => {
      const placesWithSimilarNames = [
        ...mockSeoulPlaces,
        {
          areaCode: 'POI004',
          areaName: '홍대입구역',
          displayName: '홍대입구역',
          engName: 'Hongik University Station',
          category: '인구밀집지역',
          keywords: ['홍대입구역', '홍대입구']
        }
      ];

      const result = nlpService.processNaturalLanguageQuery('홍대입구역', placesWithSimilarNames);
      
      expect(result.matchedAreaName).toBe('홍대입구역');
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    });
  });
});