import { ComparisonResult, ComparisonAnalysis, ComparisonRequest, ComparisonResponse } from '../types';
import { SeoulAPIService } from './seoulApiService';
import { NLPService } from './nlpService';
import seoulPlaces from '../data/seoulPlaces.json';
import axios from 'axios';

/**
 * 혼잡도 비교 분석 서비스
 */
export class ComparisonService {
  private seoulAPI: SeoulAPIService;
  private nlpService: NLPService;
  private cache = new Map<string, any>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5분
  private readonly CORE_API_URL = process.env.CORE_API_URL || 'http://div4u-backend-service:3001/api';

  constructor() {
    this.seoulAPI = new SeoulAPIService();
    this.nlpService = new NLPService();
    console.log('🔧 Comparison Service initialized');
  }

  /**
   * 여러 장소의 혼잡도를 비교하고 분석 (성능 최적화)
   */
  async compareLocations(request: ComparisonRequest): Promise<ComparisonResponse> {
    const { locations, options = {} } = request;
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Starting comparison for ${locations.length} locations:`, locations);

      // 성능 측정 시작
      const performanceMetrics = {
        nlpTime: 0,
        apiTime: 0,
        analysisTime: 0,
        totalTime: 0
      };

      // 1. Core API를 통한 혼잡도 데이터 조회 (데이터 일관성 보장)
      const apiStart = Date.now();
      const congestionData = await Promise.all(
        locations.map(location => this.getCongestionFromCoreAPI(location))
      );
      performanceMetrics.apiTime = Date.now() - apiStart;

      // 2. 비교 결과 생성
      const comparisons = this.createComparisonResultsFromCoreAPI(congestionData);
      
      // 3. 비교 분석 수행
      const analysisStart = Date.now();
      const analysis = this.analyzeComparison(comparisons);
      performanceMetrics.analysisTime = Date.now() - analysisStart;

      // 4. 정렬 (옵션에 따라)
      const sortedComparisons = this.sortComparisons(comparisons, options.sortBy);

      performanceMetrics.totalTime = Date.now() - startTime;

      // 성능 통계 로깅
      console.log(`⚡ Performance metrics:`, {
        ...performanceMetrics,
        locations: locations.length,
        successful: congestionData.filter(d => d.success).length,
        avgPerLocation: Math.round(performanceMetrics.totalTime / locations.length)
      });

      const response: ComparisonResponse = {
        success: true,
        data: {
          comparisons: sortedComparisons,
          analysis,
          timestamp: new Date().toISOString()
        }
      };

      console.log(`✅ Comparison completed successfully for ${comparisons.length} locations in ${performanceMetrics.totalTime}ms`);
      return response;

    } catch (error) {
      const errorTime = Date.now() - startTime;
      console.error(`❌ Error in comparison service after ${errorTime}ms:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Core API를 통한 혼잡도 조회 (데이터 일관성 보장)
   */
  private async getCongestionFromCoreAPI(location: string): Promise<{
    location: string;
    crowdLevel: string;
    message: string;
    timestamp: string;
    success: boolean;
  }> {
    try {
      console.log(`🔗 Calling Core API for: ${location}`);
      
      const response = await axios.post(`${this.CORE_API_URL}/congestion/query`, {
        query: location,
        serviceType: 'realtime'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        console.log(`✅ Core API response for ${location}: ${data.crowdLevel}`);
        
        return {
          location: data.location,
          crowdLevel: data.crowdLevel,
          message: data.message,
          timestamp: data.timestamp,
          success: true
        };
      } else {
        console.warn(`⚠️ Core API failed for ${location}:`, response.data.message);
        return {
          location,
          crowdLevel: '정보없음',
          message: '혼잡도 정보를 가져올 수 없습니다.',
          timestamp: new Date().toISOString(),
          success: false
        };
      }
    } catch (error) {
      console.error(`❌ Core API error for ${location}:`, error);
      return {
        location,
        crowdLevel: '정보없음',
        message: '혼잡도 정보를 가져올 수 없습니다.',
        timestamp: new Date().toISOString(),
        success: false
      };
    }
  }

  /**
   * 자연어 장소명을 실제 API 호출용 장소명으로 매칭
   */
  private async matchLocationsToAreaNames(locations: string[]): Promise<Array<{
    originalLocation: string;
    matchedAreaName: string;
    confidence: number;
  }>> {
    const results = [];

    for (const location of locations) {
      const nlpResult = this.nlpService.processNaturalLanguageQuery(location, seoulPlaces);
      
      results.push({
        originalLocation: location,
        matchedAreaName: nlpResult.matchedAreaName || location, // 매칭 실패 시 원본 사용
        confidence: nlpResult.confidence
      });
    }

    return results;
  }

  /**
   * Core API 데이터로부터 비교 결과 생성
   */
  private createComparisonResultsFromCoreAPI(
    congestionData: Array<{location: string; crowdLevel: string; message: string; timestamp: string; success: boolean}>
  ): ComparisonResult[] {
    const results: ComparisonResult[] = [];

    congestionData.forEach((data, index) => {
      results.push({
        location: data.location,
        displayName: `${data.location} 일대`,
        crowdLevel: data.crowdLevel as "붐빔" | "약간 붐빔" | "보통" | "여유" | "정보없음",
        message: data.message,
        timestamp: data.timestamp,
        rank: index + 1 // 임시 순위, 나중에 정렬 후 재계산
      });
    });

    console.log(`📊 Created ${results.length} comparison results from Core API`);
    return results;
  }

  /**
   * 비교 결과 생성 (기존 방식 - 폴백용)
   */
  private createComparisonResults(
    matchedLocations: Array<{originalLocation: string; matchedAreaName: string; confidence: number}>,
    congestionData: Array<{areaName: string; congestionLevel: string; congestionMessage: string; timestamp: string; success: boolean}>
  ): ComparisonResult[] {
    const results: ComparisonResult[] = [];

    for (let i = 0; i < matchedLocations.length; i++) {
      const matched = matchedLocations[i];
      if (!matched) continue;
      
      const congestion = congestionData.find(c => c.areaName === matched.matchedAreaName) || 
                        congestionData[i]; // 인덱스 기반 매칭 (fallback)

      if (congestion) {
        results.push({
          location: matched.originalLocation,
          displayName: `${matched.originalLocation} 일대`,
          crowdLevel: congestion.congestionLevel as "붐빔" | "약간 붐빔" | "보통" | "여유" | "정보없음",
          message: congestion.congestionMessage,
          timestamp: congestion.timestamp,
          rank: i + 1 // 임시 순위, 나중에 정렬 후 재계산
        });
      }
    }

    return results;
  }

  /**
   * 혼잡도 비교 분석 수행
   */
  private analyzeComparison(results: ComparisonResult[]): ComparisonAnalysis {
    if (results.length === 0) {
      return this.createEmptyAnalysis();
    }

    console.log(`📊 Starting analysis for ${results.length} locations`);

    // 혼잡도 점수 매핑 (1-4 스케일)
    const crowdScores: Record<string, number> = {
      '여유': 1,
      '보통': 2,
      '약간 붐빔': 3,
      '붐빔': 4,
      '정보없음': 2.5
    };

    // 유효한 결과 필터링 (정보없음 제외)
    const validResults = results.filter(r => r.crowdLevel && r.crowdLevel !== '정보없음');
    const hasValidData = validResults.length > 0;

    // 평균 혼잡도 계산
    const totalScore = hasValidData 
      ? validResults.reduce((sum, result) => sum + (crowdScores[result.crowdLevel] || 2.5), 0)
      : results.reduce((sum, result) => sum + (crowdScores[result.crowdLevel] || 2.5), 0);
    
    const averageScore = hasValidData 
      ? totalScore / validResults.length 
      : totalScore / results.length;

    // 평균 혼잡도 레벨 결정
    const averageLevel = this.getAverageCrowdLevel(averageScore);

    // 혼잡도별 분포 계산
    const distribution = {
      여유: results.filter(r => r.crowdLevel === '여유').length,
      보통: results.filter(r => r.crowdLevel === '보통').length,
      약간붐빔: results.filter(r => r.crowdLevel === '약간 붐빔').length,
      붐빔: results.filter(r => r.crowdLevel === '붐빔').length
    };

    // 분석 통계 로깅
    console.log(`📈 Analysis Statistics:`, {
      totalLocations: results.length,
      validDataCount: validResults.length,
      averageScore: Math.round(averageScore * 10) / 10,
      averageLevel,
      distribution
    });

    // 최적 선택지 추천 (향상된 로직)
    const bestChoice = this.getBestRecommendation(results);
    const alternatives = this.getAlternativeOptions(results, bestChoice.location);

    // 혼잡도 트렌드 분석
    const trendAnalysis = this.analyzeCrowdTrend(results);

    const analysis = {
      mostCrowded: this.getMostCrowded(results),
      leastCrowded: this.getLeastCrowded(results),
      averageCrowdLevel: {
        level: averageLevel,
        score: Math.round(averageScore * 10) / 10
      },
      recommendation: {
        bestChoice: bestChoice.location,
        reason: this.generateDetailedReason(bestChoice, results, trendAnalysis),
        alternativeOptions: alternatives
      },
      statistics: {
        totalLocations: results.length,
        crowdLevelDistribution: distribution
      }
    };

    console.log(`✅ Analysis completed - Best choice: ${analysis.recommendation.bestChoice}`);
    return analysis;
  }

  /**
   * 평균 혼잡도 레벨 결정
   */
  private getAverageCrowdLevel(score: number): string {
    if (score <= 1.5) return '여유';
    if (score <= 2.5) return '보통';
    if (score <= 3.5) return '약간 붐빔';
    return '붐빔';
  }

  /**
   * 가장 혼잡한 장소 찾기
   */
  private getMostCrowded(results: ComparisonResult[]): {location: string; crowdLevel: string} {
    const crowdOrder = ['붐빔', '약간 붐빔', '보통', '여유', '정보없음'];
    
    for (const level of crowdOrder) {
      const found = results.find(r => r.crowdLevel === level);
      if (found) {
        return { location: found.location, crowdLevel: found.crowdLevel };
      }
    }
    
    return { location: results[0]?.location || '알 수 없음', crowdLevel: '정보없음' };
  }

  /**
   * 가장 여유로운 장소 찾기
   */
  private getLeastCrowded(results: ComparisonResult[]): {location: string; crowdLevel: string} {
    const crowdOrder = ['여유', '보통', '약간 붐빔', '붐빔', '정보없음'];
    
    for (const level of crowdOrder) {
      const found = results.find(r => r.crowdLevel === level);
      if (found) {
        return { location: found.location, crowdLevel: found.crowdLevel };
      }
    }
    
    return { location: results[0]?.location || '알 수 없음', crowdLevel: '정보없음' };
  }

  /**
   * 최적 선택지 추천 (향상된 로직)
   */
  private getBestRecommendation(results: ComparisonResult[]): {location: string; reason: string} {
    console.log(`🎯 Starting recommendation analysis for ${results.length} locations:`, 
      results.map(r => `${r.location}(${r.crowdLevel})`));

    // 1. 혼잡도 우선순위로 정렬
    const crowdOrder = { '여유': 1, '보통': 2, '약간 붐빔': 3, '붐빔': 4, '정보없음': 5 };
    const sortedByLevel = [...results].sort((a, b) => 
      (crowdOrder[a.crowdLevel] || 5) - (crowdOrder[b.crowdLevel] || 5)
    );

    console.log(`📊 Sorted by crowd level:`, 
      sortedByLevel.map(r => `${r.location}(${r.crowdLevel}, score: ${crowdOrder[r.crowdLevel] || 5})`));

    // 2. 추천 가능한 장소만 필터링 (여유, 보통만 추천)
    const recommendableOptions = results.filter(r => 
      r.crowdLevel === '여유' || r.crowdLevel === '보통'
    );

    console.log(`✅ Recommendable options (여유/보통):`, 
      recommendableOptions.map(r => `${r.location}(${r.crowdLevel})`));

    // 3. 추천 가능한 장소가 있으면 그 중 최고 선택
    if (recommendableOptions.length > 0) {
      const bestRecommendable = recommendableOptions.sort((a, b) => 
        (crowdOrder[a.crowdLevel] || 5) - (crowdOrder[b.crowdLevel] || 5)
      )[0];
      
      if (bestRecommendable) {
        console.log(`🏆 Best recommendable choice: ${bestRecommendable.location}(${bestRecommendable.crowdLevel})`);
        
        return {
          location: bestRecommendable.location,
          reason: this.getBasicReason(bestRecommendable.crowdLevel)
        };
      }
    }

    // 4. 모든 곳이 붐비는 경우, 상대적으로 덜 붐비는 곳을 추천하되 경고 메시지 포함
    const bestLevel = sortedByLevel[0]?.crowdLevel || '정보없음';
    const bestChoice = sortedByLevel[0] || results[0];

    console.log(`⚠️ No ideal options available. Selecting least crowded: ${bestChoice?.location}(${bestLevel})`);

    return {
      location: bestChoice?.location || '알 수 없음',
      reason: this.getCrowdedAreaReason(bestLevel)
    };
  }

  /**
   * 기본 추천 이유 생성 (여유, 보통인 경우)
   */
  private getBasicReason(crowdLevel: string): string {
    const reasons = {
      '여유': '현재 가장 여유로워서 편안하게 이용할 수 있습니다',
      '보통': '적당한 혼잡도로 무난하게 이용할 수 있습니다'
    };

    return reasons[crowdLevel as keyof typeof reasons] || '이용하기 좋은 상태입니다';
  }

  /**
   * 붐비는 지역 추천 이유 생성 (경고 포함)
   */
  private getCrowdedAreaReason(crowdLevel: string): string {
    const reasons = {
      '약간 붐빔': '⚠️ 모든 곳이 붐비는 상황입니다. 이 곳이 상대적으로 덜 붐비지만, 시간을 바꿔서 방문하는 것을 권장합니다',
      '붐빔': '⚠️ 모든 곳이 매우 붐비는 상황입니다. 가능하면 다른 시간대에 방문하시기 바랍니다',
      '정보없음': '⚠️ 혼잡도 정보가 부족한 상황입니다. 방문 전 현장 상황을 확인해보세요'
    };

    return reasons[crowdLevel as keyof typeof reasons] || '⚠️ 현재 모든 곳이 붐비는 상황입니다';
  }

  /**
   * 상세한 추천 이유 생성 (트렌드 분석 포함)
   */
  private generateDetailedReason(
    bestChoice: {location: string; reason: string}, 
    results: ComparisonResult[], 
    trendAnalysis: {diversity: string; pattern: string}
  ): string {
    const baseReason = bestChoice.reason;
    const totalLocations = results.length;
    const bestLevel = results.find(r => r.location === bestChoice.location)?.crowdLevel;

    // 컨텍스트 분석
    const contextAnalysis = this.analyzeContext(results, trendAnalysis);
    
    // 시간대별 패턴 분석
    const timePattern = this.analyzeTimePattern();
    
    // 추가 컨텍스트 생성
    let additionalContext = '';

    // 1. 동일 혼잡도 분석
    if (totalLocations >= 3) {
      const sameLevel = results.filter(r => r.crowdLevel === bestLevel).length;
      if (sameLevel > 1) {
        additionalContext += ` (${sameLevel}개 장소가 동일한 혼잡도)`;
      }
    }

    // 2. 다양성 기반 추천
    if (trendAnalysis.diversity === 'uniform' && bestLevel === '여유') {
      additionalContext += ' 전체적으로 여유로운 시간대입니다.';
    } else if (trendAnalysis.diversity === 'mixed') {
      additionalContext += ' 장소별로 혼잡도 차이가 있어 선택의 여지가 있습니다.';
    } else if (trendAnalysis.diversity === 'diverse') {
      additionalContext += ' 다양한 혼잡도 옵션이 있어 취향에 맞게 선택할 수 있습니다.';
    }

    // 3. 패턴 기반 추가 정보
    if (trendAnalysis.pattern === 'all-clear') {
      additionalContext += ' 모든 곳이 여유로워 어디든 편안하게 이용 가능합니다.';
    } else if (trendAnalysis.pattern === 'mostly-crowded') {
      additionalContext += ' 대부분 붐비는 상황에서 상대적으로 나은 선택입니다.';
    }

    // 4. 시간대 기반 인사이트
    if (timePattern.insight) {
      additionalContext += ` ${timePattern.insight}`;
    }

    // 5. 컨텍스트 기반 추가 조언
    if (contextAnalysis.advice) {
      additionalContext += ` ${contextAnalysis.advice}`;
    }

    return baseReason + additionalContext;
  }

  /**
   * 컨텍스트 분석
   */
  private analyzeContext(results: ComparisonResult[], trendAnalysis: {diversity: string; pattern: string}): {
    advice: string;
    confidence: number;
  } {
    const crowdLevels = results.map(r => r.crowdLevel);
    const uniqueCount = new Set(crowdLevels).size;
    
    let advice = '';
    let confidence = 0.8;

    // 혼잡도 분산 분석
    if (uniqueCount === 1) {
      // 모든 곳이 같은 혼잡도
      if (crowdLevels[0] === '여유') {
        advice = '지금이 방문하기 좋은 시간입니다.';
        confidence = 0.9;
      } else if (crowdLevels[0] === '붐빔') {
        advice = '가능하면 다른 시간대를 고려해보세요.';
        confidence = 0.85;
      }
    } else if (uniqueCount >= 3) {
      // 다양한 혼잡도
      advice = '선택의 폭이 넓어 개인 취향에 맞게 선택하세요.';
      confidence = 0.75;
    }

    // 패턴 기반 조언
    if (trendAnalysis.pattern === 'mostly-clear') {
      advice += ' 전반적으로 좋은 상황입니다.';
    } else if (trendAnalysis.pattern === 'mostly-crowded') {
      advice += ' 혼잡한 시간대이니 여유를 두고 방문하세요.';
    }

    return { advice, confidence };
  }

  /**
   * 시간대 패턴 분석
   */
  private analyzeTimePattern(): { insight: string; confidence: number } {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay(); // 0: 일요일, 6: 토요일
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let insight = '';
    let confidence = 0.7;

    // 시간대별 패턴 분석
    if (hour >= 11 && hour <= 13) {
      insight = '점심시간대로 평소보다 혼잡할 수 있습니다.';
      confidence = 0.8;
    } else if (hour >= 18 && hour <= 20) {
      insight = '저녁시간대로 사람들이 많을 수 있습니다.';
      confidence = 0.85;
    } else if (hour >= 21 && hour <= 23 && isWeekend) {
      insight = '주말 밤시간으로 특히 번화가는 붐빌 수 있습니다.';
      confidence = 0.9;
    } else if (hour >= 9 && hour <= 11) {
      insight = '오전시간대로 비교적 여유로울 수 있습니다.';
      confidence = 0.75;
    }

    // 요일별 패턴
    if (isWeekend && !insight) {
      insight = '주말이라 평일보다 혼잡할 수 있습니다.';
      confidence = 0.7;
    } else if (!isWeekend && hour >= 14 && hour <= 17) {
      insight = '평일 오후시간으로 상대적으로 한적할 수 있습니다.';
      confidence = 0.75;
    }

    return { insight, confidence };
  }

  /**
   * 혼잡도 트렌드 분석
   */
  private analyzeCrowdTrend(results: ComparisonResult[]): {diversity: string; pattern: string} {
    const levels = results.map(r => r.crowdLevel);
    const uniqueLevels = new Set(levels);

    // 다양성 분석
    let diversity = 'uniform';
    if (uniqueLevels.size === 1) {
      diversity = 'uniform'; // 모든 장소가 같은 혼잡도
    } else if (uniqueLevels.size >= 3) {
      diversity = 'diverse'; // 매우 다양한 혼잡도
    } else {
      diversity = 'mixed'; // 적당히 섞여있음
    }

    // 패턴 분석
    let pattern = 'normal';
    const crowdCounts = {
      여유: levels.filter(l => l === '여유').length,
      보통: levels.filter(l => l === '보통').length,
      약간붐빔: levels.filter(l => l === '약간 붐빔').length,
      붐빔: levels.filter(l => l === '붐빔').length
    };

    if (crowdCounts.여유 === results.length) {
      pattern = 'all-clear'; // 모든 곳이 여유
    } else if (crowdCounts.붐빔 === results.length) {
      pattern = 'all-crowded'; // 모든 곳이 붐빔
    } else if (crowdCounts.붐빔 > results.length / 2) {
      pattern = 'mostly-crowded'; // 대부분 붐빔
    } else if (crowdCounts.여유 > results.length / 2) {
      pattern = 'mostly-clear'; // 대부분 여유
    }

    console.log(`🔍 Trend Analysis:`, { diversity, pattern, crowdCounts });

    return { diversity, pattern };
  }

  /**
   * 대안 옵션 제안 (향상된 로직)
   */
  private getAlternativeOptions(results: ComparisonResult[], bestChoice: string): string[] {
    const crowdScores = {
      '여유': 1,
      '보통': 2,
      '약간 붐빔': 3,
      '붐빔': 4,
      '정보없음': 2.5
    };

    // 최선의 선택을 제외한 나머지 옵션들
    const alternatives = results.filter(r => r.location !== bestChoice);

    console.log(`🔍 Finding alternatives from ${alternatives.length} remaining locations:`, 
      alternatives.map(r => `${r.location}(${r.crowdLevel})`));

    if (alternatives.length === 0) {
      return [];
    }

    // 1. 우선적으로 좋은 옵션들 (여유, 보통)만 필터링
    const goodAlternatives = alternatives.filter(r => 
      r.crowdLevel === '여유' || r.crowdLevel === '보통'
    );

    console.log(`✅ Good alternatives (여유/보통):`, 
      goodAlternatives.map(r => `${r.location}(${r.crowdLevel})`));

    // 2. 좋은 대안이 있으면 그것들만 사용
    let candidateAlternatives = goodAlternatives;

    // 3. 좋은 대안이 없으면 상대적으로 덜 붐비는 대안만 선택 (붐빔 제외)
    if (candidateAlternatives.length === 0) {
      // 붐빔이 아닌 대안들만 선택
      candidateAlternatives = alternatives.filter(r => r.crowdLevel !== '붐빔');
      
      // 그래도 없으면 모든 대안 사용 (최후의 수단)
      if (candidateAlternatives.length === 0) {
        candidateAlternatives = alternatives;
        console.log(`⚠️ All alternatives are crowded, using all alternatives`);
      } else {
        console.log(`⚠️ Using non-crowded alternatives only (excluding 붐빔)`);
      }
    }

    // 4. 혼잡도 점수로 정렬 (낮은 점수 = 덜 혼잡 = 더 좋음)
    const sortedAlternatives = candidateAlternatives.sort((a, b) => 
      (crowdScores[a.crowdLevel] || 2.5) - (crowdScores[b.crowdLevel] || 2.5)
    );

    // 5. 상위 2개 대안 선택, 단 최대 전체 결과의 40%까지만
    const maxAlternatives = Math.min(2, Math.ceil(results.length * 0.4));
    const selectedAlternatives = sortedAlternatives.slice(0, maxAlternatives);

    console.log(`💡 Final alternative options selected:`, {
      total: alternatives.length,
      goodOptions: goodAlternatives.length,
      selected: selectedAlternatives.length,
      options: selectedAlternatives.map(alt => ({
        location: alt.location,
        level: alt.crowdLevel,
        score: crowdScores[alt.crowdLevel] || 2.5
      }))
    });

    return selectedAlternatives.map(r => r.location);
  }

  /**
   * 비교 결과 정렬 (향상된 로직)
   */
  private sortComparisons(comparisons: ComparisonResult[], sortBy?: 'crowdLevel' | 'location'): ComparisonResult[] {
    const sorted = [...comparisons];

    if (sortBy === 'crowdLevel') {
      // 혼잡도 순으로 정렬 (여유 → 보통 → 약간 붐빔 → 붐빔 → 정보없음)
      const crowdOrder = { '여유': 1, '보통': 2, '약간 붐빔': 3, '붐빔': 4, '정보없음': 5 };
      sorted.sort((a, b) => {
        const scoreA = crowdOrder[a.crowdLevel] || 5;
        const scoreB = crowdOrder[b.crowdLevel] || 5;
        
        // 같은 혼잡도인 경우 장소명으로 2차 정렬
        if (scoreA === scoreB) {
          return a.location.localeCompare(b.location, 'ko');
        }
        
        return scoreA - scoreB;
      });
      
      console.log(`🔄 Sorted by crowd level:`, sorted.map(s => `${s.location}(${s.crowdLevel})`));
      
    } else if (sortBy === 'location') {
      // 장소명 가나다순 정렬 (한국어 고려)
      sorted.sort((a, b) => a.location.localeCompare(b.location, 'ko'));
      
      console.log(`🔄 Sorted by location:`, sorted.map(s => s.location));
      
    } else {
      // 기본 정렬: 혼잡도 우선, 같으면 입력 순서 유지
      const crowdOrder = { '여유': 1, '보통': 2, '약간 붐빔': 3, '붐빔': 4, '정보없음': 5 };
      sorted.sort((a, b) => {
        const scoreA = crowdOrder[a.crowdLevel] || 5;
        const scoreB = crowdOrder[b.crowdLevel] || 5;
        return scoreA - scoreB;
      });
    }

    // 순위 재계산 (1부터 시작)
    sorted.forEach((item, index) => {
      item.rank = index + 1;
    });

    return sorted;
  }

  /**
   * 빈 분석 결과 생성
   */
  private createEmptyAnalysis(): ComparisonAnalysis {
    return {
      mostCrowded: { location: '알 수 없음', crowdLevel: '정보없음' },
      leastCrowded: { location: '알 수 없음', crowdLevel: '정보없음' },
      averageCrowdLevel: { level: '정보없음', score: 0 },
      recommendation: {
        bestChoice: '알 수 없음',
        reason: '비교할 장소가 없습니다',
        alternativeOptions: []
      },
      statistics: {
        totalLocations: 0,
        crowdLevelDistribution: { 여유: 0, 보통: 0, 약간붐빔: 0, 붐빔: 0 }
      }
    };
  }
}