import { SupportedLocation, NLPResult } from '../types';
import { logger } from '../middleware/errorHandler';

/**
 * 자연어 처리 및 장소 매칭 서비스
 */
export class NLPService {
  // 한국어 불용어 목록
  private readonly stopWords = new Set([
    '이', '가', '을', '를', '에', '에서', '으로', '로', '와', '과', '의', '은', '는',
    '이다', '있다', '없다', '하다', '되다', '같다', '다른', '많다', '적다',
    '좋다', '나쁘다', '크다', '작다', '높다', '낮다', '길다', '짧다',
    '그', '그것', '이것', '저것', '여기', '거기', '저기', '어디', '언제', '누구',
    '무엇', '어떻게', '왜', '어떤', '몇', '얼마', '어느', '모든', '각각',
    '지금', '오늘', '어제', '내일', '요즘', '최근', '예전', '앞으로', '나중에',
    '혼잡도', '혼잡', '붐빔', '사람', '많이', '적게', '어떻게', '어떤지',
    '알려줘', '알려주세요', '궁금해', '궁금합니다', '보여줘', '보여주세요',
    '찾아줘', '찾아주세요', '검색', '조회', '확인', '체크', '알아보기',
    '정도', '상황', '상태', '현재', '지금', '실시간', '예측', '예상'
  ]);

  // 장소 관련 키워드 패턴
  private readonly locationPatterns = [
    /(\w+)역/g,           // ~역
    /(\w+)공원/g,         // ~공원
    /(\w+)시장/g,         // ~시장
    /(\w+)거리/g,         // ~거리
    /(\w+)광장/g,         // ~광장
    /(\w+)궁/g,           // ~궁
    /(\w+)동/g,           // ~동
    /(\w+)구/g,           // ~구
    /(\w+)로/g,           // ~로
    /(\w+)길/g,           // ~길
    /(\w+)타워/g,         // ~타워
    /(\w+)센터/g,         // ~센터
    /(\w+)몰/g,           // ~몰
    /(\w+)플라자/g,       // ~플라자
  ];

  /**
   * 자연어 질의에서 장소 키워드 추출
   */
  extractLocationKeywords(query: string): string[] {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const cleanQuery = query.trim().toLowerCase();
    const keywords = new Set<string>();

    // 1. 패턴 기반 키워드 추출
    for (const pattern of this.locationPatterns) {
      const matches = cleanQuery.matchAll(pattern);
      for (const match of matches) {
        if (match[0] && match[0].length >= 2) {
          keywords.add(match[0]);
          // 접미사 제거된 키워드도 추가
          if (match[1] && match[1].length >= 2) {
            keywords.add(match[1]);
          }
        }
      }
    }

    // 2. 공백 및 특수문자로 분리된 단어 추출
    const words = cleanQuery
      .split(/[\s,.\-·&()]+/)
      .filter(word => word.length > 0)
      .filter(word => !this.stopWords.has(word))
      .filter(word => !/^\d+$/.test(word)); // 숫자만 있는 단어 제외

    // 2.5 N-gram 생성 (2-gram, 3-gram)
    for (let i = 0; i < words.length; i++) {
        keywords.add(words[i]);
        if (i + 1 < words.length) {
            keywords.add(words[i] + words[i+1]);
        }
        if (i + 2 < words.length) {
            keywords.add(words[i] + words[i+1] + words[i+2]);
        }
    }

    // 3. 연속된 한글 단어 추출 (2글자 이상)
    const koreanWords = cleanQuery.match(/[가-힣]{2,}/g) || [];
    koreanWords
      .filter(word => !this.stopWords.has(word))
      .forEach(word => keywords.add(word));

    // 4. 영문 단어 추출
    const englishWords = cleanQuery.match(/[a-zA-Z]{2,}/g) || [];
    englishWords.forEach(word => {
      keywords.add(word.toLowerCase());
      keywords.add(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
    });

    return Array.from(keywords).filter(keyword => keyword.length >= 2);
  }

  /**
   * 자연어 질의를 분석하여 장소 매칭 수행
   */
  processNaturalLanguageQuery(
    query: string, 
    locations: SupportedLocation[]
  ): NLPResult {
    const extractedKeywords = this.extractLocationKeywords(query);
    
    if (extractedKeywords.length === 0) {
      return {
        extractedLocation: '',
        matchedAreaName: '',
        confidence: 0,
        originalQuery: query,
        suggestedLocations: []
      };
    }

    // 각 키워드에 대해 장소 매칭 수행
    const matchResults: Array<{location: SupportedLocation, score: number, matchedKeyword: string}> = [];

    for (const keyword of extractedKeywords) {
      for (const location of locations) {
        const score = this.calculateLocationMatchScore(keyword, location);
        if (score > 0.3) { // 최소 임계값
          matchResults.push({
            location,
            score,
            matchedKeyword: keyword
          });
        }
      }
    }

    // 점수 순으로 정렬
    matchResults.sort((a, b) => b.score - a.score);

    // 중복 제거 (같은 장소는 최고 점수만 유지)
    const uniqueResults = new Map<string, typeof matchResults[0]>();
    for (const result of matchResults) {
      const key = result.location.areaCode;
      if (!uniqueResults.has(key) || uniqueResults.get(key)!.score < result.score) {
        uniqueResults.set(key, result);
      }
    }

    const finalResults = Array.from(uniqueResults.values()).slice(0, 10);

    const bestMatch = finalResults.length > 0 ? finalResults[0] : null;
    
    const allSuggestions = new Set<string>();

    // 1. 최종 매칭된 장소와 동일 카테고리의 다른 장소들을 우선적으로 추가
    if (bestMatch) {
      const matchedLocationCategory = bestMatch.location.category;
      const sameCategoryLocations = locations.filter(loc => 
        loc.category === matchedLocationCategory && loc.areaName !== bestMatch.location.areaName
      );
      sameCategoryLocations.slice(0, 3).forEach(loc => allSuggestions.add(loc.areaName));
    }

    // 2. 최종 매칭 결과 중 상위 5개 (주 검색 결과 제외)
    finalResults.slice(0, 5).forEach(r => {
      if (bestMatch && r.location.areaName !== bestMatch.location.areaName) {
        allSuggestions.add(r.location.areaName);
      }
    });

    // 3. 인기 장소 중 아직 포함되지 않은 장소 추가 (최대 5개)
    const popularLocations = [
      '강남역', '홍대입구역', '명동 관광특구', '이태원 관광특구',
      '남산공원', '한강공원', '경복궁', '동대문 관광특구'
    ];
    popularLocations.forEach(name => {
      if (bestMatch && name !== bestMatch.location.areaName) { // 주 검색 결과와 중복 방지
        const found = locations.find(loc => loc.areaName.includes(name));
        if (found) {
          allSuggestions.add(found.areaName);
        }
      }
    });

    // 최종 제안 목록 (최대 5개)
    const finalSuggestedLocations = Array.from(allSuggestions).filter(s => s !== bestMatch?.location.areaName).slice(0, 5);

    logger.debug('NLP Result:', { nlpResult: {
      extractedLocation: bestMatch?.matchedKeyword || extractedKeywords[0] || '',
      matchedAreaName: bestMatch?.location.areaName || '',
      confidence: bestMatch?.score || 0,
      originalQuery: query,
      suggestedLocations: finalSuggestedLocations
    } });

    return {
      extractedLocation: bestMatch?.matchedKeyword || extractedKeywords[0] || '',
      matchedAreaName: bestMatch?.location.areaName || '',
      confidence: bestMatch?.score || 0,
      originalQuery: query,
      suggestedLocations: finalSuggestedLocations
    };
  }

  /**
   * 키워드와 장소 간의 매칭 점수 계산
   */
  private calculateLocationMatchScore(keyword: string, location: SupportedLocation): number {
    // 0. 완전 일치 (가장 높은 점수)
    if (location.areaName.toLowerCase() === keyword.toLowerCase()) {
      return 1.0;
    }

    let maxScore = 0;

    // 1. 장소명과의 직접 매칭
    if (location.areaName.toLowerCase().includes(keyword.toLowerCase())) {
      maxScore = Math.max(maxScore, 0.9);
    }

    // 2. 영문명과의 매칭
    if (location.engName && location.engName.toLowerCase().includes(keyword.toLowerCase())) {
      maxScore = Math.max(maxScore, 0.8);
    }

    // 3. 키워드 배열과의 매칭
    for (const locationKeyword of location.keywords) {
      if (locationKeyword.toLowerCase() === keyword.toLowerCase()) {
        maxScore = Math.max(maxScore, 0.95); // 키워드 배열 내 완전 일치
      } else if (locationKeyword.toLowerCase().includes(keyword.toLowerCase())) {
        maxScore = Math.max(maxScore, 0.85); // 키워드 배열 내 부분 일치
      }
    }

    // 4. Levenshtein 거리 기반 유사도
    const nameScore = this.calculateLevenshteinSimilarity(keyword, location.areaName);
    maxScore = Math.max(maxScore, nameScore * 0.6);

    if (location.engName) {
      const engScore = this.calculateLevenshteinSimilarity(keyword, location.engName);
      maxScore = Math.max(maxScore, engScore * 0.5);
    }

    // 5. 키워드와의 Levenshtein 유사도
    for (const locationKeyword of location.keywords) {
      const keywordScore = this.calculateLevenshteinSimilarity(keyword, locationKeyword);
      maxScore = Math.max(maxScore, keywordScore * 0.4);
    }

    // 6. 키워드 길이에 따른 보너스
    if (maxScore > 0.7) { // 높은 점수를 받은 경우에만 길이 보너스 적용
        maxScore += (keyword.length / 20); // 키워드 길이에 비례한 보너스 (최대 0.5)
    }

    return Math.min(maxScore, 1.0); // 점수가 1.0을 넘지 않도록
  }

  /**
   * Levenshtein 거리 기반 유사도 계산
   */
  private calculateLevenshteinSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    if (s1 === s2) return 1.0;
    if (s1.length === 0 || s2.length === 0) return 0.0;

    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    
    return 1 - (distance / maxLength);
  }

  /**
   * Levenshtein 거리 계산
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * 매칭 실패 시 유사한 장소 제안
   */
  private getSuggestedLocations(keywords: string[], locations: SupportedLocation[]): string[] {
    const suggestions = new Set<string>();
    
    // 키워드와 부분적으로 일치하는 장소들 찾기
    for (const keyword of keywords) {
      for (const location of locations) {
        // 부분 문자열 매칭
        if (location.areaName.includes(keyword) || 
            location.keywords.some(kw => kw.includes(keyword))) {
          suggestions.add(location.areaName);
        }
        
        // 유사한 시작 문자
        if (location.areaName.startsWith(keyword.charAt(0))) {
          suggestions.add(location.areaName);
        }
      }
    }

    // 인기 장소들도 추가 (카테고리별 대표 장소)
    const popularLocations = [
      '강남역', '홍대입구역', '명동 관광특구', '이태원 관광특구',
      '남산공원', '한강공원', '경복궁', '동대문 관광특구'
    ];

    popularLocations.forEach(name => {
      const found = locations.find(loc => loc.areaName.includes(name));
      if (found) {
        suggestions.add(found.areaName);
      }
    });

    return Array.from(suggestions).slice(0, 8);
  }

  /**
   * 질의 의도 분석 (혼잡도 관련 키워드 감지)
   */
  analyzeCongestionIntent(query: string): {
    isCongestionQuery: boolean;
    intentType: 'realtime' | 'prediction' | 'general';
    confidence: number;
  } {
    const realtimeKeywords = ['지금', '현재', '실시간', '요즘', '오늘'];
    const predictionKeywords = ['예측', '예상', '앞으로', '나중에', '미래', '내일'];
    const congestionKeywords = ['혼잡', '붐빔', '사람', '많이', '적게', '여유', '복잡'];

    const lowerQuery = query.toLowerCase();
    
    let realtimeScore = 0;
    let predictionScore = 0;
    let congestionScore = 0;

    // 키워드 매칭 점수 계산
    realtimeKeywords.forEach(keyword => {
      if (lowerQuery.includes(keyword)) realtimeScore += 1;
    });

    predictionKeywords.forEach(keyword => {
      if (lowerQuery.includes(keyword)) predictionScore += 1;
    });

    congestionKeywords.forEach(keyword => {
      if (lowerQuery.includes(keyword)) congestionScore += 1;
    });

    const isCongestionQuery = congestionScore > 0 || realtimeScore > 0 || predictionScore > 0;
    
    let intentType: 'realtime' | 'prediction' | 'general' = 'general';
    if (realtimeScore > predictionScore) {
      intentType = 'realtime';
    } else if (predictionScore > 0) {
      intentType = 'prediction';
    }

    const totalScore = realtimeScore + predictionScore + congestionScore;
    const confidence = Math.min(totalScore / 3, 1.0);

    return {
      isCongestionQuery,
      intentType,
      confidence
    };
  }
}