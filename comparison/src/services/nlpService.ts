import { LocationQuery } from '../types';

interface SupportedLocation {
  areaCode: string;
  areaName: string;
  displayName: string;
  engName: string;
  category: string;
  keywords: string[];
}

/**
 * 자연어 처리 및 장소 매칭 서비스
 */
export class NLPService {
  // 한국어 불용어 목록
  private readonly stopWords = new Set([
    '이', '가', '을', '를', '에', '에서', '으로', '로', '와', '과', '의', '은', '는',
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
          if (match[1] && match[1].length >= 2) {
            keywords.add(match[1]);
          }
        }
      }
    }

    // 2. 공백으로 분리된 단어 추출
    const words = cleanQuery
      .split(/[\s,.\-·&()]+/)
      .filter(word => word.length > 0)
      .filter(word => !this.stopWords.has(word))
      .filter(word => !/^\d+$/.test(word));

    words.forEach(word => keywords.add(word));

    // 3. 연속된 한글 단어 추출 (2글자 이상)
    const koreanWords = cleanQuery.match(/[가-힣]{2,}/g) || [];
    koreanWords
      .filter(word => !this.stopWords.has(word))
      .forEach(word => keywords.add(word));

    // 4. 영문 단어 추출
    const englishWords = cleanQuery.match(/[a-zA-Z]{2,}/g) || [];
    englishWords.forEach(word => {
      keywords.add(word.toLowerCase());
    });

    return Array.from(keywords).filter(keyword => keyword.length >= 2);
  }

  /**
   * 자연어 질의를 분석하여 장소 매칭 수행
   */
  processNaturalLanguageQuery(
    query: string, 
    locations: SupportedLocation[]
  ): LocationQuery {
    const extractedKeywords = this.extractLocationKeywords(query);
    
    if (extractedKeywords.length === 0) {
      return {
        originalQuery: query,
        extractedLocation: '',
        matchedAreaName: '',
        confidence: 0
      };
    }

    // 각 키워드에 대해 장소 매칭 수행
    const matchResults: Array<{location: SupportedLocation, score: number, matchedKeyword: string}> = [];

    for (const keyword of extractedKeywords) {
      for (const location of locations) {
        const score = this.calculateLocationMatchScore(keyword, location);
        if (score > 0.3) {
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

    const finalResults = Array.from(uniqueResults.values());
    const bestMatch = finalResults.length > 0 ? finalResults[0] : null;

    console.log(`🔍 NLP Processing: "${query}" -> "${bestMatch?.location.areaName || 'No match'}" (confidence: ${bestMatch?.score || 0})`);

    return {
      originalQuery: query,
      extractedLocation: bestMatch?.matchedKeyword || extractedKeywords[0] || '',
      matchedAreaName: bestMatch?.location.areaName || '',
      confidence: bestMatch?.score || 0
    };
  }

  /**
   * 키워드와 장소 간의 매칭 점수 계산
   */
  private calculateLocationMatchScore(keyword: string, location: SupportedLocation): number {
    // 완전 일치 (가장 높은 점수)
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
        maxScore = Math.max(maxScore, 0.95);
      } else if (locationKeyword.toLowerCase().includes(keyword.toLowerCase())) {
        maxScore = Math.max(maxScore, 0.85);
      }
    }

    // 4. Levenshtein 거리 기반 유사도
    const nameScore = this.calculateLevenshteinSimilarity(keyword, location.areaName);
    maxScore = Math.max(maxScore, nameScore * 0.6);

    return Math.min(maxScore, 1.0);
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
    const matrix: number[][] = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(0));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0]![i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j]![0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j]![i] = Math.min(
          matrix[j]![i - 1]! + 1,
          matrix[j - 1]![i]! + 1,
          matrix[j - 1]![i - 1]! + indicator
        );
      }
    }

    return matrix[str2.length]![str1.length]!;
  }
}