import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Input,
  CharacterGuide,
  CongestionBadge,
  LoadingSpinner
} from '../components/ui';
import { ArrowLeft, Home, Search, RotateCcw } from 'lucide-react';
import { congestionService } from '../services/congestionService';
import { APIError } from '../types/api';
import CongestionResult from '../components/CongestionResult';
import { useCongestionHistory } from '../components/CongestionHistory';
import ResponsiveLayout, { useScreenSize, ResponsiveContainer, ResponsiveGrid } from '../components/ResponsiveLayout';
import ResponsiveHeader from '../components/ResponsiveHeader';
import MobileNavigation from '../components/MobileNavigation';
import { cn } from '../lib/utils';

// 혼잡도 조회 결과 타입
interface CongestionResult {
  location: string;
  crowdLevel: string;
  message: string;
  timestamp: string;
  updateTime?: string;
  confidence?: number;
}

const CrowdPredictionPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CongestionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [apiSuggestions, setApiSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { addToHistory } = useCongestionHistory();

  // 카테고리별 예시 질문들
  const exampleQueries = {
    popular: [
      '홍대 혼잡도 어때?',
      '강남역 사람 많나요?',
      '명동 붐비나요?',
      '신촌 여유로운가요?'
    ],
    tourist: [
      '경복궁 혼잡도 확인해줘',
      '남대문시장 붐비나요?',
      '동대문 사람 많나요?',
      '인사동 혼잡도 어때?'
    ],
    business: [
      '여의도 혼잡도 확인',
      '종로 사람 많나요?',
      '을지로 붐비나요?',
      '광화문 혼잡도 어때?'
    ],
    shopping: [
      '가로수길 혼잡도 확인',
      '이태원 사람 많나요?',
      '압구정 붐비나요?',
      '청담동 혼잡도 어때?'
    ]
  };

  const [selectedCategory, setSelectedCategory] = useState<keyof typeof exampleQueries>('popular');

  // 혼잡도 조회 함수
  const handleSearch = async (searchQuery?: string) => {
    console.log('🔍 handleSearch 호출됨', { searchQuery, query });
    const finalQuery = searchQuery || query;
    console.log('📝 최종 검색어:', finalQuery);
    
    if (!finalQuery.trim()) {
      console.log('❌ 검색어가 비어있음');
      setError('질문을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setApiSuggestions([]);

    try {
      const response = await congestionService.queryCongestion({
        query: finalQuery.trim(),
        serviceType: 'realtime'
      });

      const resultData = {
        location: response.location,
        crowdLevel: response.crowdLevel,
        message: response.message,
        timestamp: response.timestamp,
        updateTime: response.updateTime,
        confidence: response.confidence
      };
      
      setResult(resultData);
      
      // 추천 장소 처리 (recommendations 우선, 없으면 suggestions 사용)
      if (response.recommendations && response.recommendations.length > 0) {
        setApiSuggestions(response.recommendations.map(rec => rec.areaName));
      } else if (response.suggestions) {
        setApiSuggestions(response.suggestions);
      }
      
      // 검색 기록에 추가 (중복 제거)
      setSearchHistory(prev => {
        const newHistory = [finalQuery.trim(), ...prev.filter(h => h !== finalQuery.trim())];
        return newHistory.slice(0, 5); // 최대 5개까지만 저장
      });
      
      // 히스토리에 추가
      addToHistory(resultData, finalQuery.trim());
    } catch (err) {
      const apiError = err as APIError;
      setError(apiError.message || '혼잡도 정보를 가져올 수 없습니다.');
      
      // 에러 시에도 추천 장소 표시
      if (apiError.details?.recommendations && apiError.details.recommendations.length > 0) {
        setApiSuggestions(apiError.details.recommendations.map((rec: any) => rec.areaName));
      } else if (apiError.details?.suggestions) {
        setApiSuggestions(apiError.details.suggestions);
      }
      console.error('API Error:', apiError);
    } finally {
      setIsLoading(false);
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 예시 질문 클릭 처리
  const handleExampleClick = (example: string) => {
    setQuery(example);
    setError(null);
    setShowSuggestions(false);
    handleSearch(example);
  };

  // 자동완성 제안 생성
  const generateSuggestions = (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const allQueries = Object.values(exampleQueries).flat();
    const filtered = allQueries.filter(q => 
      q.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  // 입력 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    generateSuggestions(value);
    if (error) setError(null);
    if (apiSuggestions.length > 0) setApiSuggestions([]);
  };

  // 제안 선택 처리
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const { isMobile, isTablet } = useScreenSize();

  return (
    <ResponsiveLayout className="bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 반응형 헤더 */}
      <ResponsiveHeader
        title="실시간 혼잡도"
        showBackButton={true}
        showHomeButton={true}
        showMenuButton={isMobile}
      />

      <ResponsiveContainer className={cn(
        'py-4',
        isMobile ? 'py-4' : isTablet ? 'py-6' : 'py-8'
      )}>
        <ResponsiveGrid
          cols={{ mobile: 1, tablet: 1, desktop: 2 }}
          gap={{ mobile: '1rem', tablet: '1.5rem', desktop: '2rem' }}
          className="max-w-6xl mx-auto"
        >
          {/* 왼쪽: 자연어 질의 카드 */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>쉬운 문장으로 질문</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 입력창 */}
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="예: 홍대 혼잡도 어때? (일상 언어로 물어보세요)"
                    value={query}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    onFocus={() => generateSuggestions(query)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="pr-12"
                    disabled={isLoading}
                  />
                  
                  {/* 검색 버튼 */}
                  <Button
                    size="sm"
                    onClick={() => {
                      console.log('🖱️ 검색 버튼 클릭됨', { query, disabled: isLoading || !query.trim() });
                      handleSearch();
                    }}
                    disabled={isLoading || !query.trim()}
                    className="absolute right-1 top-1 h-8"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>

                  {/* 자동완성 제안 */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                        >
                          <span className="text-gray-400 mr-2">💬</span>
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 에러 메시지 */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md animate-pulse">
                    <p className="text-sm text-red-600 flex items-center">
                      <span className="mr-2">⚠️</span>
                      {error}
                    </p>
                  </div>
                )}
              </div>

              {apiSuggestions.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800 font-medium mb-2">혹시 이런 장소를 찾으시나요?</p>
                  <div className="flex flex-wrap gap-2">
                    {apiSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs bg-white"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* 예시 질문들 */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">예시 질문</h3>
                
                {/* 카테고리 탭 */}
                <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
                  {Object.entries(exampleQueries).map(([category, _]) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedCategory(category as keyof typeof exampleQueries)}
                      className="text-xs flex-1 min-w-0"
                      disabled={isLoading}
                    >
                      {category === 'popular' && '🔥 인기'}
                      {category === 'tourist' && '🏛️ 관광'}
                      {category === 'business' && '🏢 비즈니스'}
                      {category === 'shopping' && '🛍️ 쇼핑'}
                    </Button>
                  ))}
                </div>

                {/* 선택된 카테고리의 예시 질문들 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {exampleQueries[selectedCategory].map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleExampleClick(example)}
                      disabled={isLoading}
                      className="text-xs justify-start h-auto py-2 px-3 whitespace-normal text-left"
                    >
                      <span className="mr-2">💬</span>
                      {example}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 검색 기록 */}
              {searchHistory.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">최근 검색</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchHistory([])}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      지우기
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((historyItem, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExampleClick(historyItem)}
                        disabled={isLoading}
                        className="text-xs bg-gray-50 hover:bg-gray-100"
                      >
                        <span className="mr-1">🕒</span>
                        {historyItem}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* 사용 팁 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2">💡 사용 팁</h3>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• "홍대 혼잡도 어때?" 처럼 일상 언어로 물어보세요</li>
                  <li>• 서울시 주요 120개 장소의 혼잡도를 확인할 수 있어요</li>
                  <li>• 실시간 데이터를 기반으로 정보를 제공합니다</li>
                  <li>• 자동완성 기능으로 더 쉽게 검색할 수 있어요</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 오른쪽: 검색 결과 카드 */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>검색 결과</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                // 로딩 상태
                <div className="text-center py-12">
                  <div className="space-y-6">
                    <CharacterGuide
                      congestionLevel="정보없음"
                      size="lg"
                      showMessage={true}
                      message="혼잡도 정보를 확인하고 있어요... 🔍"
                    />
                    
                    {/* 로딩 진행 표시 */}
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <LoadingSpinner size="md" />
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <div className="animate-pulse">📡 서울시 API에 연결 중...</div>
                        <div className="animate-pulse" style={{animationDelay: '0.5s'}}>🔍 장소 정보 분석 중...</div>
                        <div className="animate-pulse" style={{animationDelay: '1s'}}>📊 혼잡도 데이터 수집 중...</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : result ? (
                // 결과 표시
                <CongestionResult
                  result={result}
                  onRefresh={() => handleSearch()}
                  onShare={() => {
                    // 공유 기능 구현
                    if (navigator.share) {
                      navigator.share({
                        title: '서울 혼잡도 정보',
                        text: `${result.location}의 현재 혼잡도는 "${result.crowdLevel}"입니다. ${result.message}`,
                        url: window.location.href
                      });
                    } else {
                      // 폴백: 클립보드에 복사
                      const shareText = `${result.location}의 현재 혼잡도: ${result.crowdLevel}\n${result.message}\n\n서울 실시간 혼잡도 서비스에서 확인`;
                      navigator.clipboard.writeText(shareText).then(() => {
                        alert('클립보드에 복사되었습니다!');
                      });
                    }
                  }}
                  onNewSearch={() => {
                    setQuery('');
                    setResult(null);
                    setError(null);
                  }}
                />
              ) : (
                // 초기 상태
                <div className="text-center py-12">
                  <div className="space-y-6">
                    <CharacterGuide
                      congestionLevel="정보없음"
                      size="lg"
                      showMessage={true}
                    />
                    
                    {/* 안내 정보 */}
                    <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
                      <h4 className="font-medium text-blue-800 mb-2">🎯 이용 방법</h4>
                      <div className="text-sm text-blue-700 space-y-1 text-left">
                        <div>1️⃣ 왼쪽에서 궁금한 장소를 쉬운 문장으로 입력</div>
                        <div>2️⃣ 예시 질문을 클릭하거나 직접 입력</div>
                        <div>3️⃣ 실시간 혼잡도 정보를 확인</div>
                      </div>
                    </div>

                    {/* 지원 장소 정보 */}
                    <div className="text-xs text-gray-500">
                      <div className="flex items-center justify-center space-x-4">
                        <span>🏛️ 관광특구</span>
                        <span>🚇 지하철역</span>
                        <span>🛍️ 상권</span>
                        <span>🌳 공원</span>
                      </div>
                      <div className="mt-1">서울시 주요 120개 장소 지원</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </ResponsiveGrid>

        {/* 하단 정보 */}
        <div className={cn(
          'text-center',
          isMobile ? 'mt-8' : isTablet ? 'mt-10' : 'mt-12'
        )}>
          <div className={cn(
            'bg-white/50 backdrop-blur-sm rounded-lg max-w-2xl mx-auto',
            isMobile ? 'p-4' : isTablet ? 'p-5' : 'p-6'
          )}>
            <h3 className={cn(
              'font-semibold text-gray-800 mb-3',
              isMobile ? 'text-base' : 'text-lg'
            )}>
              서울시 실시간 도시데이터 기반
            </h3>
            <p className={cn(
              'text-gray-600 leading-relaxed',
              isMobile ? 'text-sm' : 'text-base'
            )}>
              이 서비스는 서울시에서 제공하는 실시간 도시데이터를 활용하여 
              서울시 주요 120개 장소의 혼잡도 정보를 제공합니다. 
              데이터는 실시간으로 업데이트되며, 쉬운 문장 검색을 통해 
              편리하게 정보를 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </ResponsiveContainer>

      {/* 모바일 네비게이션 */}
      <MobileNavigation />
    </ResponsiveLayout>
  );
};

export default CrowdPredictionPage;