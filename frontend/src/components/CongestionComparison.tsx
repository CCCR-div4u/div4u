import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CongestionBadge,
  Button,
  Input
} from './ui';
import { Plus, X, BarChart3, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { getCongestionScore } from '../lib/utils';
import { congestionService } from '../services/congestionService';
import { comparisonApiService, ComparisonResult, ComparisonAnalysis } from '../services/comparisonApiService';
import { APIError } from '../types/api';

interface ComparisonItem {
  id: string;
  location: string;
  crowdLevel: string;
  message: string;
  timestamp: string;
  rank?: number;
  confidence?: number;
  isLoading?: boolean;
  error?: string;
}

interface CongestionComparisonProps {
  initialItems?: any[];
  className?: string;
}

const CongestionComparison: React.FC<CongestionComparisonProps> = ({
  initialItems = [],
  className
}) => {
  // State 관리
  const [items, setItems] = useState<ComparisonItem[]>(
    initialItems.map((item, index) => ({ 
      ...item, 
      id: `initial-${index}` 
    }))
  );
  const [newQuery, setNewQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [analysis, setAnalysis] = useState<ComparisonAnalysis | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'crowdHigh' | 'crowdLow'>('newest');

  // 서비스 상태 확인
  React.useEffect(() => {
    const checkServiceStatus = async () => {
      try {
        await comparisonApiService.checkHealth();
      } catch (error) {
        console.error('Comparison Service unavailable:', error);
      }
    };
    checkServiceStatus();
  }, []);

  // 새 항목 추가
  const addItem = async () => {
    if (!newQuery.trim()) return;
    
    const trimmedQuery = newQuery.trim();
    const isExactDuplicate = items.some(item => 
      item.location.toLowerCase() === trimmedQuery.toLowerCase()
    );
    
    if (isExactDuplicate) {
      alert(`"${trimmedQuery}"은(는) 이미 추가된 장소입니다.`);
      setNewQuery('');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const tempItem: ComparisonItem = {
      id: tempId,
      location: trimmedQuery,
      crowdLevel: '',
      message: '',
      timestamp: new Date().toISOString(),
      isLoading: true
    };

    setItems(prev => [...prev, tempItem]);
    setIsAdding(true);

    try {
      const result = await congestionService.queryCongestion({
        query: trimmedQuery,
        serviceType: 'realtime'
      });

      // API 결과로 실제 중복 체크
      const actualLocation = result.location;
      const isActualDuplicate = items.some(item => 
        item.location.toLowerCase() === actualLocation.toLowerCase() && item.id !== tempId
      );
      
      if (isActualDuplicate) {
        // 중복된 경우 임시 아이템 제거
        setItems(prev => prev.filter(item => item.id !== tempId));
        alert(`"${actualLocation}"은(는) 이미 추가된 장소입니다.`);
        setNewQuery('');
        return;
      }

      setItems(prev => {
        const updatedItems = prev.map(item => 
          item.id === tempId 
            ? { ...result, id: tempId, isLoading: false }
            : item
        );
        
        // 자동 비교 실행 (2개 이상일 때)
        if (updatedItems.length >= 2) {
          setTimeout(() => performComparisonWithItems(updatedItems), 1500);
        }
        
        return updatedItems;
      });
      setNewQuery('');
    } catch (error) {
      const apiError = error as APIError;
      setItems(prev => prev.map(item => 
        item.id === tempId 
          ? { ...item, isLoading: false, error: apiError.message || '조회 실패' }
          : item
      ));
    } finally {
      setIsAdding(false);
    }
  };

  // 비교 분석 실행
  const performComparisonWithItems = async (itemsToCompare: ComparisonItem[]) => {
    const validItems = itemsToCompare.filter(item => 
      item.location && !item.error && !item.isLoading
    );
    
    if (validItems.length < 2) {
      setAnalysis(null);
      return;
    }

    try {
      const response = await comparisonApiService.compareLocations({
        locations: validItems.map(item => item.location),
        options: {
          includeRecommendation: true,
          sortBy: 'crowdLevel'
        }
      });

      if (response.success && response.data) {
        // 분석 결과만 설정하고, 개별 장소 데이터는 건드리지 않음
        setAnalysis(response.data.analysis);
        
        // 순위 정보만 업데이트 (혼잡도 데이터는 유지)
        setItems(prevItems => {
          return prevItems.map(existingItem => {
            const comparisonResult = response.data!.comparisons.find(
              (result: ComparisonResult) => result.location === existingItem.location
            );
            
            if (comparisonResult && comparisonResult.rank) {
              return {
                ...existingItem,
                rank: comparisonResult.rank
              };
            }
            
            return existingItem;
          });
        });
      } else {
        // API 호출은 성공했지만 서비스 응답이 실패한 경우
        console.log('Comparison Service failed, using fallback logic:', response.error);
        const fallbackAnalysis = generateFallbackAnalysis(itemsToCompare);
        setAnalysis(fallbackAnalysis);
      }
    } catch (error) {
      console.error('Comparison Service error, using fallback logic:', error);
      // 폴백: 기존 로직으로 분석 결과 생성
      const fallbackAnalysis = generateFallbackAnalysis(itemsToCompare);
      setAnalysis(fallbackAnalysis);
    }
  };

  // 항목 제거
  const removeItem = (id: string) => {
    setItems(prev => {
      const updatedItems = prev.filter(item => item.id !== id);
      
      if (updatedItems.length < 2) {
        setAnalysis(null);
      } else {
        setTimeout(() => updateAnalysisOnly(updatedItems), 500);
      }
      
      return updatedItems;
    });
  };

  // 항목 새로고침
  const refreshItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    setItems(prev => prev.map(i => 
      i.id === id ? { ...i, isLoading: true, error: undefined } : i
    ));

    try {
      const result = await congestionService.queryCongestion({
        query: item.location,
        serviceType: 'realtime'
      });

      setItems(prev => {
        const updatedItems = prev.map(i => 
          i.id === id ? { ...result, id, isLoading: false } : i
        );
        
        // 새로고침 후에는 분석만 업데이트 (데이터 덮어쓰기 방지)
        if (updatedItems.length >= 2) {
          setTimeout(() => updateAnalysisOnly(updatedItems), 500);
        }
        
        return updatedItems;
      });
    } catch (error) {
      const apiError = error as APIError;
      setItems(prev => prev.map(i => 
        i.id === id 
          ? { ...i, isLoading: false, error: apiError.message || '조회 실패' }
          : i
      ));
    }
  };

  // 폴백 분석 생성 (Comparison Service 실패 시)
  const generateFallbackAnalysis = (items: ComparisonItem[]) => {
    const validItems = items.filter(item => 
      item.crowdLevel && !item.error && !item.isLoading
    );
    
    if (validItems.length < 2) return null;

    const scores = validItems.map(item => ({
      ...item,
      score: getCongestionScore(item.crowdLevel)
    }));

    const sortedByScore = [...scores].sort((a, b) => a.score - b.score);
    const mostCrowded = sortedByScore[sortedByScore.length - 1];
    const leastCrowded = sortedByScore[0];
    const averageScore = scores.reduce((sum, item) => sum + item.score, 0) / scores.length;

    // 기본 분석 결과 생성
    return {
      mostCrowded: {
        location: mostCrowded.location,
        crowdLevel: mostCrowded.crowdLevel
      },
      leastCrowded: {
        location: leastCrowded.location,
        crowdLevel: leastCrowded.crowdLevel
      },
      averageCrowdLevel: {
        level: averageScore <= 1.5 ? '여유' : 
              averageScore <= 2.5 ? '보통' : 
              averageScore <= 3.5 ? '약간 붐빔' : '붐빔',
        score: Math.round(averageScore * 10) / 10
      },
      statistics: {
        totalLocations: validItems.length,
        crowdLevelDistribution: validItems.reduce((acc, item) => {
          acc[item.crowdLevel] = (acc[item.crowdLevel] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      recommendation: {
        bestChoice: leastCrowded.location,
        reason: `⚠️ 서비스 연결 문제로 기본 분석을 사용합니다. ${leastCrowded.location}이(가) 현재 가장 여유로운 상태입니다.`,
        alternativeOptions: sortedByScore.slice(1, 3).map(item => item.location)
      }
    };
  };

  // 분석 결과만 업데이트 (데이터 덮어쓰기 방지)
  const updateAnalysisOnly = async (itemsToAnalyze: ComparisonItem[]) => {
    const validItems = itemsToAnalyze.filter(item => 
      item.location && !item.error && !item.isLoading
    );
    
    if (validItems.length < 2) {
      setAnalysis(null);
      return;
    }

    try {
      const response = await comparisonApiService.compareLocations({
        locations: validItems.map(item => item.location),
        options: {
          includeRecommendation: true,
          sortBy: 'crowdLevel'
        }
      });

      if (response.success && response.data) {
        // 분석 결과만 업데이트, 개별 장소 데이터는 건드리지 않음
        setAnalysis(response.data.analysis);
      }
    } catch (error) {
      console.error('Analysis update error, using fallback:', error);
      // 폴백: 기존 로직으로 분석 결과 생성
      const fallbackAnalysis = generateFallbackAnalysis(itemsToAnalyze);
      setAnalysis(fallbackAnalysis);
    }
  };

  // 정렬된 items 가져오기
  const getSortedItems = () => {
    const sortedItems = [...items];
    
    switch (sortBy) {
      case 'newest':
        return sortedItems.reverse();
      case 'oldest':
        return sortedItems;
      case 'crowdHigh':
        return sortedItems.sort((a, b) => {
          if (!a.crowdLevel || !b.crowdLevel) return 0;
          return getCongestionScore(b.crowdLevel) - getCongestionScore(a.crowdLevel);
        });
      case 'crowdLow':
        return sortedItems.sort((a, b) => {
          if (!a.crowdLevel || !b.crowdLevel) return 0;
          return getCongestionScore(a.crowdLevel) - getCongestionScore(b.crowdLevel);
        });
      default:
        return sortedItems;
    }
  };

  const sortedItems = getSortedItems();

  return (
    <>
      {/* 왼쪽 카드: 혼잡도 비교 */}
      <Card className="border-2 border-orange-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            <span className="text-amber-900">혼잡도 비교</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 새 항목 추가 */}
          <div className="flex space-x-2">
            <Input
              value={newQuery}
              onChange={(e) => setNewQuery(e.target.value)}
              placeholder="비교할 장소를 입력하세요..."
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              disabled={isAdding}
            />
            <Button
              onClick={addItem}
              disabled={!newQuery.trim() || isAdding}
              className="flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* 스마트 추천 */}
          {analysis && (
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 rounded-xl border border-green-200 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <div>
                  <h3 className="font-bold text-green-800 text-lg">스마트 추천</h3>
                  <p className="text-xs text-green-600">시간대와 혼잡도를 고려한 최적 선택</p>
                </div>
              </div>
              
              {/* 최적 선택지 카드 */}
              <div className="bg-white p-5 rounded-xl shadow-sm mb-4 border-l-4 border-green-500">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-sm">
                    🏆 BEST CHOICE
                  </span>
                  <span className="font-bold text-green-800 text-xl">
                    {analysis.recommendation.bestChoice}
                  </span>
                  {(() => {
                    const bestItem = items.find(item => item.location === analysis.recommendation.bestChoice);
                    return bestItem?.crowdLevel ? <CongestionBadge level={bestItem.crowdLevel} size="sm" /> : null;
                  })()}
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-700 leading-relaxed font-medium">
                    💬 {analysis.recommendation.reason}
                  </p>
                </div>
              </div>
              
              {/* 대안 옵션 */}
              {analysis.recommendation.alternativeOptions.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center mb-3">
                    <span className="text-sm font-bold text-blue-700">🔄 대안 옵션</span>
                    <span className="ml-2 text-xs text-blue-600">({analysis.recommendation.alternativeOptions.length}개)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.recommendation.alternativeOptions.map((option, index) => {
                      const altItem = items.find(item => item.location === option);
                      return (
                        <div 
                          key={index}
                          className="flex items-center space-x-2 px-3 py-2 bg-white text-blue-700 text-sm rounded-full border border-blue-200 shadow-sm"
                        >
                          <span className="font-medium">{option}</span>
                          {altItem?.crowdLevel && <CongestionBadge level={altItem.crowdLevel} size="xs" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* 추천 신뢰도 */}
              <div className="mt-4 pt-3 border-t border-green-200">
                <div className="flex items-center justify-between text-xs text-green-600">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    실시간 데이터 기반 분석
                  </span>
                  <span>
                    {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 업데이트
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 비교 분석 결과 */}
          {analysis && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-5 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-amber-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                향상된 비교 분석 결과
                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">NEW</span>
              </h3>
              
              {/* 주요 통계 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-orange-500">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-500 font-medium">평균 혼잡도</div>
                    <BarChart3 className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex items-end space-x-2 mb-2">
                    <div className="text-2xl font-bold text-orange-600">
                      {analysis.averageCrowdLevel.score.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500 mb-1">/4.0</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CongestionBadge level={analysis.averageCrowdLevel.level} size="sm" />
                    <span className="text-sm text-gray-600">{analysis.averageCrowdLevel.level}</span>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(analysis.averageCrowdLevel.score / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-indigo-500">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-500 font-medium">비교 장소</div>
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-bold text-indigo-600 mb-2">
                    {analysis.statistics.totalLocations}개
                  </div>
                  <div className="text-sm text-gray-600">실시간 데이터</div>
                  <div className="mt-2 text-xs text-indigo-600">
                    {analysis.statistics.totalLocations >= 5 ? '충분한 데이터' : 
                     analysis.statistics.totalLocations >= 3 ? '적정 데이터' : '추가 데이터 권장'}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-purple-500">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-500 font-medium">분석 시간</div>
                    <RefreshCw className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {new Date().toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <div className="text-sm text-gray-600">업데이트됨</div>
                  <div className="mt-2 text-xs text-purple-600">
                    {Math.floor((Date.now() - new Date().setSeconds(0, 0)) / 60000)}분 전 갱신
                  </div>
                </div>
              </div>

              {/* 최고/최저 비교 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-red-700">가장 혼잡한 곳</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-red-800">{analysis.mostCrowded.location}</span>
                    <CongestionBadge level={analysis.mostCrowded.crowdLevel} size="sm" />
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-green-700">가장 여유로운 곳</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-green-800">{analysis.leastCrowded.location}</span>
                    <CongestionBadge level={analysis.leastCrowded.crowdLevel} size="sm" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 오른쪽 카드: 비교 장소 목록 */}
      <Card className="border-2 border-orange-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            <span className="text-amber-900">비교 장소 목록</span>
            <span className="text-sm text-amber-600">({items.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {/* 정렬 필터 */}
            {items.length > 1 && (
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-700">정렬 기준:</span>
                <div className="flex space-x-2">
                  <Button
                    variant={sortBy === 'newest' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('newest')}
                  >
                    최신순
                  </Button>
                  <Button
                    variant={sortBy === 'oldest' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('oldest')}
                  >
                    오래된순
                  </Button>
                  <Button
                    variant={sortBy === 'crowdHigh' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('crowdHigh')}
                  >
                    혼잡도↑
                  </Button>
                  <Button
                    variant={sortBy === 'crowdLow' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('crowdLow')}
                  >
                    혼잡도↓
                  </Button>
                </div>
              </div>
            )}
            
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">비교할 장소를 추가해보세요.</p>
                <p className="text-xs mt-1">여러 장소의 혼잡도를 한 번에 비교할 수 있습니다.</p>
              </div>
            ) : (
              sortedItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      {/* 순위 표시 */}
                      <div className="flex-shrink-0">
                        {index === 0 ? (
                          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-sm rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-yellow-300">
                            1
                          </div>
                        ) : index === 1 ? (
                          <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-sm rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-gray-300">
                            2
                          </div>
                        ) : index === 2 ? (
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-sm rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-orange-300">
                            3
                          </div>
                        ) : (
                          <div className="w-7 h-7 bg-amber-500 text-white text-sm rounded-full flex items-center justify-center font-medium">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <span className="font-medium truncate">{item.location}</span>
                      {item.isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm text-gray-500">조회 중...</span>
                        </div>
                      ) : item.error ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-red-500 bg-red-50 px-2 py-1 rounded">
                            ❌ {item.error}
                          </span>
                        </div>
                      ) : item.crowdLevel ? (
                        <div className="flex items-center space-x-2">
                          <CongestionBadge level={item.crowdLevel} />
                          {item.rank && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              #{item.rank}
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>
                    {item.message && !item.isLoading && !item.error && (
                      <p className="text-sm text-gray-600 truncate">{item.message}</p>
                    )}
                    {item.timestamp && !item.isLoading && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.timestamp).toLocaleString('ko-KR')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 ml-3">
                    {!item.isLoading && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refreshItem(item.id)}
                        className="h-8 w-8 p-0"
                        title="새로고침"
                      >
                        <TrendingUp className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      title="제거"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default CongestionComparison;