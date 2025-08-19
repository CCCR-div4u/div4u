import fs from 'fs';
import path from 'path';
import { SupportedLocation, LocationCategory, CategoryInfo, NLPResult, CongestionData } from '../types';
import { NLPService } from './NLPService';
import { SeoulAPIService } from './SeoulAPIService';

/**
 * 서울시 120개 장소 데이터 관리 서비스
 */
export class LocationService {
  private locations: SupportedLocation[] = [];
  private locationMap: Map<string, SupportedLocation> = new Map();
  private categoryMap: Map<LocationCategory, SupportedLocation[]> = new Map();
  private nlpService: NLPService;
  private seoulAPIService: SeoulAPIService;
  
  constructor() {
    this.nlpService = new NLPService();
    this.seoulAPIService = new SeoulAPIService();
    this.loadLocations();
    this.buildIndexes();
  }
  
  /**
   * JSON 파일에서 장소 데이터 로드
   */
  private loadLocations(): void {
    try {
      const dataPath = path.resolve(__dirname, '../data/seoulPlaces.json');
      
      if (!fs.existsSync(dataPath)) {
        console.warn('⚠️ seoulPlaces.json 파일이 없습니다. 데이터 생성 스크립트를 실행해주세요.');
        return;
      }
      
      const jsonData = fs.readFileSync(dataPath, 'utf-8');
      this.locations = JSON.parse(jsonData);
      
      console.log(`📍 ${this.locations.length}개의 서울시 장소 데이터 로드 완료`);
    } catch (error) {
      console.error('❌ 장소 데이터 로드 실패:', error);
      this.locations = [];
    }
  }
  
  /**
   * 빠른 검색을 위한 인덱스 구축
   */
  private buildIndexes(): void {
    // 지역 코드별 맵 구축
    this.locationMap.clear();
    this.locations.forEach(location => {
      this.locationMap.set(location.areaCode, location);
    });
    
    // 카테고리별 맵 구축
    this.categoryMap.clear();
    this.locations.forEach(location => {
      const category = location.category as LocationCategory;
      if (!this.categoryMap.has(category)) {
        this.categoryMap.set(category, []);
      }
      this.categoryMap.get(category)!.push(location);
    });
    
    console.log(`🔍 검색 인덱스 구축 완료 (${this.locationMap.size}개 장소, ${this.categoryMap.size}개 카테고리)`);
  }
  
  /**
   * 모든 장소 반환
   */
  getAllLocations(): SupportedLocation[] {
    return [...this.locations];
  }
  
  /**
   * 지역 코드로 장소 검색
   */
  getLocationByCode(areaCode: string): SupportedLocation | undefined {
    return this.locationMap.get(areaCode);
  }
  
  /**
   * 카테고리별 장소 목록 반환
   */
  getLocationsByCategory(category: LocationCategory): SupportedLocation[] {
    return this.categoryMap.get(category) || [];
  }
  
  /**
   * 키워드로 장소 검색 (부분 일치)
   */
  searchLocationsByKeyword(keyword: string): SupportedLocation[] {
    if (!keyword || keyword.trim().length === 0) {
      return [];
    }
    
    const searchTerm = keyword.trim().toLowerCase();
    const results: SupportedLocation[] = [];
    
    for (const location of this.locations) {
      // 장소명에서 검색
      if (location.areaName.toLowerCase().includes(searchTerm) ||
          location.engName.toLowerCase().includes(searchTerm)) {
        results.push(location);
        continue;
      }
      
      // 키워드에서 검색
      const hasMatchingKeyword = location.keywords.some(kw => 
        kw.toLowerCase().includes(searchTerm)
      );
      
      if (hasMatchingKeyword) {
        results.push(location);
      }
    }
    
    return results;
  }
  
  /**
   * 퍼지 매칭으로 장소 검색 (유사도 기반)
   */
  fuzzySearchLocations(query: string, threshold: number = 0.6): Array<{location: SupportedLocation, score: number}> {
    if (!query || query.trim().length === 0) {
      return [];
    }
    
    const searchTerm = query.trim().toLowerCase();
    const results: Array<{location: SupportedLocation, score: number}> = [];
    
    for (const location of this.locations) {
      let maxScore = 0;
      
      // 장소명과의 유사도 계산
      const nameScore = this.calculateSimilarity(searchTerm, location.areaName.toLowerCase());
      maxScore = Math.max(maxScore, nameScore);
      
      // 영문명과의 유사도 계산
      if (location.engName) {
        const engScore = this.calculateSimilarity(searchTerm, location.engName.toLowerCase());
        maxScore = Math.max(maxScore, engScore);
      }
      
      // 키워드와의 유사도 계산
      for (const keyword of location.keywords) {
        const keywordScore = this.calculateSimilarity(searchTerm, keyword.toLowerCase());
        maxScore = Math.max(maxScore, keywordScore);
      }
      
      if (maxScore >= threshold) {
        results.push({ location, score: maxScore });
      }
    }
    
    // 점수 순으로 정렬
    return results.sort((a, b) => b.score - a.score);
  }
  
  /**
   * Jaccard 유사도 계산
   */
  private calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    
    // 문자열을 2-gram으로 분할
    const bigrams1 = this.getBigrams(str1);
    const bigrams2 = this.getBigrams(str2);
    
    if (bigrams1.size === 0 && bigrams2.size === 0) return 1.0;
    if (bigrams1.size === 0 || bigrams2.size === 0) return 0.0;
    
    // 교집합 계산
    const intersection = new Set([...bigrams1].filter(x => bigrams2.has(x)));
    
    // 합집합 계산
    const union = new Set([...bigrams1, ...bigrams2]);
    
    return intersection.size / union.size;
  }
  
  /**
   * 문자열을 2-gram으로 분할
   */
  private getBigrams(str: string): Set<string> {
    const bigrams = new Set<string>();
    
    if (str.length < 2) {
      bigrams.add(str);
      return bigrams;
    }
    
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.substring(i, i + 2));
    }
    
    return bigrams;
  }
  
  /**
   * 카테고리 정보 반환
   */
  getCategoryInfo(): CategoryInfo[] {
    return [
      {
        name: '관광특구',
        displayName: '관광특구',
        description: '서울의 대표적인 관광 명소들',
        icon: '🏛️',
        color: '#3B82F6'
      },
      {
        name: '고궁·문화유산',
        displayName: '고궁·문화유산',
        description: '전통 문화와 역사가 살아있는 곳',
        icon: '🏯',
        color: '#8B5CF6'
      },
      {
        name: '인구밀집지역',
        displayName: '인구밀집지역',
        description: '지하철역 주변 번화가',
        icon: '🚇',
        color: '#EF4444'
      },
      {
        name: '발달상권',
        displayName: '발달상권',
        description: '쇼핑과 먹거리가 풍부한 상권',
        icon: '🛍️',
        color: '#F59E0B'
      },
      {
        name: '공원',
        displayName: '공원',
        description: '자연과 휴식을 즐길 수 있는 공간',
        icon: '🌳',
        color: '#10B981'
      }
    ];
  }
  
  /**
   * 자연어 질의 처리 (NLP 기반)
   */
  processNaturalLanguageQuery(query: string): NLPResult {
    return this.nlpService.processNaturalLanguageQuery(query, this.locations);
  }

  /**
   * 자연어에서 장소 키워드 추출
   */
  extractLocationKeywords(query: string): string[] {
    return this.nlpService.extractLocationKeywords(query);
  }

  /**
   * 혼잡도 질의 의도 분석
   */
  analyzeCongestionIntent(query: string): {
    isCongestionQuery: boolean;
    intentType: 'realtime' | 'prediction' | 'general';
    confidence: number;
  } {
    return this.nlpService.analyzeCongestionIntent(query);
  }

  /**
   * 고급 장소 검색 (NLP + 퍼지 매칭 결합)
   */
  intelligentLocationSearch(query: string): {
    nlpResult: NLPResult;
    fuzzyResults: Array<{location: SupportedLocation, score: number}>;
    intentAnalysis: {
      isCongestionQuery: boolean;
      intentType: 'realtime' | 'prediction' | 'general';
      confidence: number;
    };
    recommendations: SupportedLocation[];
  } {
    // NLP 분석
    const nlpResult = this.processNaturalLanguageQuery(query);
    
    // 의도 분석
    const intentAnalysis = this.analyzeCongestionIntent(query);
    
    // 퍼지 검색 (낮은 임계값으로 더 많은 결과)
    const fuzzyResults = this.fuzzySearchLocations(query, 0.2);
    
    // 추천 장소 생성
    const recommendations = this.generateRecommendations(nlpResult, intentAnalysis);
    
    return {
      nlpResult,
      fuzzyResults,
      intentAnalysis,
      recommendations
    };
  }

  /**
   * 상황별 추천 장소 생성 (개선된 버전)
   */
  private generateRecommendations(
    nlpResult: NLPResult, 
    intentAnalysis: { intentType: 'realtime' | 'prediction' | 'general' }
  ): SupportedLocation[] {
    console.log(`🔍 추천 시스템 시작 - 매칭된 장소: ${nlpResult.matchedAreaName}, 신뢰도: ${nlpResult.confidence}`);
    
    const recommendations: SupportedLocation[] = [];
    
    // 매칭된 장소가 있으면 스마트 추천 로직 적용
    if (nlpResult.confidence > 0.5) {
      const matchedLocation = this.locations.find(loc => loc.areaName === nlpResult.matchedAreaName);
      console.log(`📍 매칭된 장소 찾기 결과: ${matchedLocation ? matchedLocation.areaName : '없음'}`);
      
      if (matchedLocation) {
        console.log(`🎯 타겟 장소: ${matchedLocation.areaName} (카테고리: ${matchedLocation.category})`);
        
        // 1. 지역 기반 직접 추천 (우선순위 높음)
        const regionBasedRecommendations = this.getRegionBasedRecommendations(matchedLocation, 4);
        console.log(`🏘️ 지역 기반 추천 (${regionBasedRecommendations.length}개):`, regionBasedRecommendations.map(r => r.areaName));
        recommendations.push(...regionBasedRecommendations);
        
        // 2. 키워드 기반 유사 장소 추천 (카테고리 무관)
        const keywordBasedRecommendations = this.getKeywordBasedRecommendations(matchedLocation, 3);
        const filteredKeywordRecommendations = keywordBasedRecommendations
          .filter(loc => !recommendations.some(r => r.areaCode === loc.areaCode));
        console.log(`🔑 키워드 기반 추천 (${filteredKeywordRecommendations.length}개):`, filteredKeywordRecommendations.map(r => r.areaName));
        recommendations.push(...filteredKeywordRecommendations);
        
        // 3. 같은 카테고리의 다른 장소들 추천 - 부족할 때만
        if (recommendations.length < 4) {
          const sameCategory = this.getLocationsByCategory(matchedLocation.category as LocationCategory);
          const sameCategoryFiltered = sameCategory
            .filter(loc => loc.areaCode !== matchedLocation.areaCode)
            .filter(loc => !recommendations.some(r => r.areaCode === loc.areaCode))
            .slice(0, 2);
          console.log(`📂 같은 카테고리 추천 (${sameCategoryFiltered.length}개):`, sameCategoryFiltered.map(r => r.areaName));
          recommendations.push(...sameCategoryFiltered);
        }
      }
    } else {
      console.log(`⚠️ 신뢰도가 낮아서 키워드 기반 추천 건너뜀 (${nlpResult.confidence})`);
    }
    
    // 의도에 따른 추천
    if (intentAnalysis.intentType === 'realtime') {
      // 실시간 혼잡도 조회에 적합한 인기 장소들
      const popularAreas = ['강남역', '홍대입구역', '명동 관광특구', '이태원역'];
      popularAreas.forEach(name => {
        const found = this.locations.find(loc => loc.areaName.includes(name));
        if (found && !recommendations.some(r => r.areaCode === found.areaCode)) {
          recommendations.push(found);
        }
      });
    } else if (intentAnalysis.intentType === 'prediction') {
      // 예측에 적합한 관광지나 공원
      const predictionAreas = this.getLocationsByCategory('관광특구')
        .concat(this.getLocationsByCategory('공원'))
        .slice(0, 4);
      predictionAreas.forEach(area => {
        if (!recommendations.some(r => r.areaCode === area.areaCode)) {
          recommendations.push(area);
        }
      });
    }
    
    // 매칭된 장소 찾기 (전체 과정에서 제외하기 위해)
    const matchedLocation = this.locations.find(loc => loc.areaName === nlpResult.matchedAreaName);
    
    // 부족한 경우 인기 장소로 채우기
    if (recommendations.length < 6) {
      const popularLocations = this.locations
        .filter(loc => ['관광특구', '인구밀집지역'].includes(loc.category))
        .filter(loc => !recommendations.some(r => r.areaCode === loc.areaCode))
        .filter(loc => !matchedLocation || loc.areaCode !== matchedLocation.areaCode) // 매칭된 장소 제외
        .slice(0, 6 - recommendations.length);
      
      console.log(`🔥 인기 장소로 채우기 (${popularLocations.length}개):`, popularLocations.map(r => r.areaName));
      recommendations.push(...popularLocations);
    }
    
    // 최종 결과에서도 매칭된 장소 제외 확인
    const finalRecommendations = recommendations
      .filter(rec => !matchedLocation || rec.areaCode !== matchedLocation.areaCode)
      .slice(0, 6);
    console.log(`✅ 최종 추천 결과 (${finalRecommendations.length}개):`, finalRecommendations.map(r => r.areaName));
    
    return finalRecommendations;
  }

  /**
   * 지역 기반 직접 추천 (같은 지역의 다른 장소들)
   */
  private getRegionBasedRecommendations(targetLocation: SupportedLocation, limit: number): SupportedLocation[] {
    console.log(`🏘️ 지역 기반 추천 시작 - 타겟: ${targetLocation.areaName}`);
    
    const recommendations: Array<{location: SupportedLocation, score: number}> = [];
    
    // 지역명 추출 (첫 번째 단어 또는 특정 패턴)
    const targetRegion = this.extractRegionName(targetLocation.areaName);
    console.log(`📍 추출된 지역명: ${targetRegion}`);
    
    if (!targetRegion) {
      return [];
    }
    
    for (const location of this.locations) {
      // 자기 자신은 제외
      if (location.areaCode === targetLocation.areaCode) continue;
      
      // 같은 지역명이 포함된 장소들 찾기
      let score = 0;
      
      // 장소명에 지역명이 포함된 경우
      if (location.areaName.includes(targetRegion)) {
        score += 1.0; // 높은 점수
      }
      
      // 키워드에 지역명이 포함된 경우
      const hasRegionKeyword = location.keywords.some(keyword => 
        keyword.toLowerCase().includes(targetRegion.toLowerCase())
      );
      if (hasRegionKeyword) {
        score += 0.5;
      }
      
      if (score > 0) {
        recommendations.push({ location, score });
        console.log(`   ${location.areaName}: ${score.toFixed(1)}점`);
      }
    }
    
    // 점수 순으로 정렬하여 상위 N개 반환
    let result = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.location);
    
    // 지역 기반 추천이 부족한 경우 주변 지역 추천 추가
    if (result.length < 2 && targetRegion) {
      const nearbyRecommendations = this.getNearbyRegionRecommendations(targetRegion, limit - result.length);
      result = [...result, ...nearbyRecommendations];
    }
    
    console.log(`✅ 지역 기반 추천 결과 (${result.length}개):`, result.map(r => r.areaName));
    return result;
  }

  /**
   * 장소명에서 지역명 추출
   */
  private extractRegionName(areaName: string): string | null {
    // 주요 지역명 패턴 매칭
    const regionPatterns = [
      '강남', '홍대', '명동', '이태원', '신촌', '건대', '잠실', '동대문', '종로', '청계',
      '가로수길', '인사동', '압구정', '신사', '논현', '역삼', '선릉', '삼성', '서초',
      '여의도', '마포', '용산', '성수', '왕십리', '을지로', '충무로', '동묘앞',
      '경복궁', '창덕궁', '덕수궁', '남산', '한강', '반포', '서울숲', '올림픽공원'
    ];
    
    for (const region of regionPatterns) {
      if (areaName.includes(region)) {
        return region;
      }
    }
    
    // 패턴에 없으면 첫 번째 단어 사용 (공백이나 특수문자 기준)
    const firstWord = areaName.split(/[\s·()]/)[0];
    if (firstWord && firstWord.length > 1) {
      return firstWord;
    }
    
    return null;
  }

  /**
   * 주변 지역 추천 (지역 기반 추천이 부족할 때)
   */
  private getNearbyRegionRecommendations(targetRegion: string, limit: number): SupportedLocation[] {
    // 지역별 주변 지역 매핑
    const nearbyRegions: Record<string, string[]> = {
      '명동': ['을지로', '충무로', '종로', '남대문', '중구', '회현', '시청'],
      '이태원': ['용산', '한남', '남산', '회현'],
      '홍대': ['신촌', '마포', '연남', '상수'],
      '강남': ['역삼', '논현', '신사', '압구정', '선릉', '삼성'],
      '동대문': ['을지로', '종로', '청계', '동묘앞'],
      '잠실': ['송파', '석촌', '올림픽공원'],
      '신촌': ['홍대', '마포', '연남', '이대']
    };
    
    const nearbyKeywords = nearbyRegions[targetRegion] || [];
    if (nearbyKeywords.length === 0) {
      return [];
    }
    
    console.log(`🗺️ ${targetRegion} 주변 지역 키워드:`, nearbyKeywords);
    
    const recommendations: SupportedLocation[] = [];
    
    for (const location of this.locations) {
      // 장소명이나 키워드에 주변 지역이 포함된 경우
      const hasNearbyKeyword = nearbyKeywords.some(keyword => 
        location.areaName.includes(keyword) || 
        location.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase()))
      );
      
      if (hasNearbyKeyword && recommendations.length < limit) {
        recommendations.push(location);
        console.log(`   주변 지역 추천: ${location.areaName}`);
      }
    }
    
    return recommendations;
  }

  /**
   * 키워드 기반 유사 장소 추천 (카테고리 무관)
   */
  private getKeywordBasedRecommendations(targetLocation: SupportedLocation, limit: number): SupportedLocation[] {
    console.log(`🔍 키워드 기반 추천 시작 - 타겟: ${targetLocation.areaName}`);
    console.log(`📝 타겟 키워드: ${targetLocation.keywords.join(', ')}`);
    
    const recommendations: Array<{location: SupportedLocation, score: number}> = [];
    
    // 타겟 장소의 키워드들
    const targetKeywords = new Set(targetLocation.keywords.map(k => k.toLowerCase()));
    
    for (const location of this.locations) {
      // 자기 자신은 제외
      if (location.areaCode === targetLocation.areaCode) continue;
      
      // 키워드 유사도 계산
      const locationKeywords = new Set(location.keywords.map(k => k.toLowerCase()));
      const commonKeywords = new Set([...targetKeywords].filter(k => locationKeywords.has(k)));
      
      // Jaccard 유사도 계산
      const union = new Set([...targetKeywords, ...locationKeywords]);
      const similarity = commonKeywords.size / union.size;
      
      // 지역명 기반 추가 점수 (예: "강남"이 공통으로 포함된 경우)
      let nameBonus = 0;
      const targetAreaWords = targetLocation.areaName.split(/[\s·]/);
      const locationAreaWords = location.areaName.split(/[\s·]/);
      
      for (const targetWord of targetAreaWords) {
        for (const locationWord of locationAreaWords) {
          if (targetWord.length > 1 && locationWord.length > 1 && 
              (targetWord.includes(locationWord) || locationWord.includes(targetWord))) {
            nameBonus += 0.5; // 지역명 유사성에 대한 보너스 점수 증가
          }
        }
      }
      
      // 특별 케이스: 같은 지역명이 포함된 장소들 간의 추가 보너스
      const commonRegions = ['강남', '홍대', '명동', '이태원', '신촌', '건대', '잠실'];
      for (const region of commonRegions) {
        if (targetLocation.areaName.includes(region) && location.areaName.includes(region)) {
          nameBonus += 0.4; // 같은 지역 특별 보너스
          break; // 중복 보너스 방지
        }
      }
      
      const finalScore = similarity + nameBonus;
      
      // 동대문 관련 장소들 특별히 로깅
      if (targetLocation.areaName.includes('동대문') && 
          (location.areaName.includes('동대문') || location.areaName.includes('DDP'))) {
        console.log(`🎯 ${location.areaName} 분석:`);
        console.log(`   공통 키워드: ${Array.from(commonKeywords).join(', ')}`);
        console.log(`   유사도: ${similarity.toFixed(3)}`);
        console.log(`   지역명 보너스: ${nameBonus.toFixed(3)}`);
        console.log(`   최종 점수: ${finalScore.toFixed(3)}`);
        console.log(`   임계값 통과: ${finalScore > 0.05 ? '✅' : '❌'}`);
      }
      
      // 임계값 이상인 경우만 추천 목록에 추가 (임계값을 낮춤)
      if (finalScore > 0.05) {
        recommendations.push({ location, score: finalScore });
      }
    }
    
    // 점수 순으로 정렬하여 상위 N개 반환
    const result = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.location);
    
    console.log(`✅ 키워드 기반 추천 결과 (${result.length}개):`);
    result.forEach((loc, idx) => {
      const score = recommendations.find(r => r.location.areaCode === loc.areaCode)?.score || 0;
      console.log(`   ${idx + 1}. ${loc.areaName} (점수: ${score.toFixed(3)})`);
    });
    
    return result;
  }

  /**
   * 특정 장소의 실시간 혼잡도 조회
   */
  async getCongestionByAreaCode(areaCode: string): Promise<CongestionData> {
    const location = this.getLocationByCode(areaCode);
    if (!location) {
      throw new Error(`Location not found: ${areaCode}`);
    }

    try {
      const congestionData = await this.seoulAPIService.getCongestionData(areaCode);
      // 장소명을 우리 데이터베이스의 이름으로 업데이트
      congestionData.areaName = location.areaName;
      return congestionData;
    } catch (error) {
      console.error(`Error getting congestion for ${areaCode}:`, error);
      throw error;
    }
  }

  /**
   * 자연어 질의를 통한 혼잡도 조회 (추천 기능 포함)
   */
  async getCongestionByQuery(query: string): Promise<{
    nlpResult: NLPResult;
    congestionData?: CongestionData;
    recommendations?: SupportedLocation[];
    error?: string;
  }> {
    // 고급 장소 검색으로 NLP 결과와 추천 장소 모두 가져오기
    const intelligentResult = this.intelligentLocationSearch(query);
    const nlpResult = intelligentResult.nlpResult;
    const recommendations = intelligentResult.recommendations;

    // 매칭된 장소의 지역 코드 찾기
    const matchedLocation = this.locations.find(loc => 
      loc.areaName === nlpResult.matchedAreaName
    );

    if (!matchedLocation) {
      return {
        nlpResult,
        recommendations,
        error: '해당 장소의 혼잡도 정보를 제공하지 않습니다.'
      };
    }

    try {
      const congestionData = await this.getCongestionByAreaCode(matchedLocation.areaCode);
      return {
        nlpResult,
        congestionData,
        recommendations
      };
    } catch (error) {
      return {
        nlpResult,
        recommendations,
        error: error instanceof Error ? error.message : '혼잡도 정보를 가져오는데 실패했습니다.'
      };
    }
  }

  /**
   * 여러 장소의 혼잡도 일괄 조회
   */
  async getBatchCongestionData(areaCodes: string[]): Promise<Array<{
    location: SupportedLocation;
    congestionData?: CongestionData;
    error?: string;
  }>> {
    const results = await Promise.allSettled(
      areaCodes.map(async (areaCode) => {
        const location = this.getLocationByCode(areaCode);
        if (!location) {
          throw new Error(`Location not found: ${areaCode}`);
        }

        const congestionData = await this.getCongestionByAreaCode(areaCode);
        return { location, congestionData };
      })
    );

    return results.map((result, index) => {
      const areaCode = areaCodes[index];
      const location = this.getLocationByCode(areaCode)!;

      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          location,
          error: result.reason instanceof Error ? result.reason.message : '알 수 없는 오류'
        };
      }
    });
  }

  /**
   * 카테고리별 인기 장소의 혼잡도 조회
   */
  async getPopularLocationsCongestion(category?: LocationCategory, limit: number = 5): Promise<Array<{
    location: SupportedLocation;
    congestionData?: CongestionData;
    error?: string;
  }>> {
    let targetLocations: SupportedLocation[];

    if (category) {
      targetLocations = this.getLocationsByCategory(category).slice(0, limit);
    } else {
      // 인기 장소들 (각 카테고리에서 대표적인 곳들)
      const popularAreaCodes = [
        'POI014', // 강남역
        'POI055', // 홍대입구역
        'POI003', // 명동 관광특구
        'POI047', // 이태원역
        'POI091'  // 남산공원
      ];
      targetLocations = popularAreaCodes
        .map(code => this.getLocationByCode(code))
        .filter(loc => loc !== undefined) as SupportedLocation[];
    }

    return this.getBatchCongestionData(targetLocations.map(loc => loc.areaCode));
  }

  /**
   * 서울시 API 상태 확인
   */
  async checkSeoulAPIStatus(): Promise<{
    available: boolean;
    responseTime: number;
    error?: string;
  }> {
    return this.seoulAPIService.checkAPIStatus();
  }

  /**
   * 지원되는 혼잡도 레벨 정보
   */
  getSupportedCongestionLevels(): Array<{level: string, description: string, color: string}> {
    return this.seoulAPIService.getSupportedCongestionLevels();
  }

  /**
   * 통계 정보 반환
   */
  getStats(): Record<string, any> {
    const categoryStats: Record<string, number> = {};
    
    this.locations.forEach(location => {
      categoryStats[location.category] = (categoryStats[location.category] || 0) + 1;
    });
    
    return {
      totalLocations: this.locations.length,
      categoryStats,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 테스트용: 강남역과 강남 MICE 관광특구 간 유사도 계산
   */
  testGangnamSimilarity(): void {
    const gangnamStation = this.locations.find(loc => loc.areaName === '강남역');
    const gangnamMICE = this.locations.find(loc => loc.areaName === '강남 MICE 관광특구');
    
    if (!gangnamStation || !gangnamMICE) {
      console.log('❌ 장소를 찾을 수 없습니다.');
      return;
    }
    
    console.log('🧪 강남역 ↔ 강남 MICE 관광특구 유사도 테스트');
    console.log(`강남역 키워드: ${gangnamStation.keywords.join(', ')}`);
    console.log(`강남 MICE 키워드: ${gangnamMICE.keywords.join(', ')}`);
    
    const targetKeywords = new Set(gangnamStation.keywords.map(k => k.toLowerCase()));
    const locationKeywords = new Set(gangnamMICE.keywords.map(k => k.toLowerCase()));
    const commonKeywords = new Set([...targetKeywords].filter(k => locationKeywords.has(k)));
    
    const union = new Set([...targetKeywords, ...locationKeywords]);
    const similarity = commonKeywords.size / union.size;
    
    // 지역명 기반 추가 점수
    let nameBonus = 0;
    const targetAreaWords = gangnamStation.areaName.split(/[\s·]/);
    const locationAreaWords = gangnamMICE.areaName.split(/[\s·]/);
    
    for (const targetWord of targetAreaWords) {
      for (const locationWord of locationAreaWords) {
        if (targetWord.length > 1 && locationWord.length > 1 && 
            (targetWord.includes(locationWord) || locationWord.includes(targetWord))) {
          nameBonus += 0.3;
        }
      }
    }
    
    const finalScore = similarity + nameBonus;
    
    console.log(`공통 키워드 (${commonKeywords.size}개): ${Array.from(commonKeywords).join(', ')}`);
    console.log(`전체 키워드 (${union.size}개)`);
    console.log(`Jaccard 유사도: ${similarity.toFixed(3)}`);
    console.log(`지역명 보너스: ${nameBonus.toFixed(3)}`);
    console.log(`최종 점수: ${finalScore.toFixed(3)}`);
    console.log(`임계값 통과: ${finalScore > 0.1 ? '✅' : '❌'}`);
  }
}