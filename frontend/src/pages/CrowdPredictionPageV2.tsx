import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, LoadingSpinner } from '../components/ui';
import { ForuChat } from '../components/ForuChat';
import { ArrowLeft, Home, Search, MapPin, RotateCcw } from 'lucide-react';
import { congestionService } from '../services/congestionService';
import { APIError, ChatMessage } from '../types/api';
import { useCongestionHistory } from '../hooks/useCongestionHistory';
import { FORU_MESSAGES, getForuMessageByCongestionLevel } from '../constants/foruImages';
import Header from '../components/Header';

const CrowdPredictionPageV2: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'foru',
      content: FORU_MESSAGES.greeting,
      timestamp: new Date().toLocaleString(),
      reliability: '95%',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [apiSuggestions, setApiSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { addToHistory } = useCongestionHistory();
  const hasAutoSearched = useRef(false);

  // 예시 질문들 (카테고리별)
  const exampleQueries = {
    '관광지': ['경복궁 혼잡도 어때?', '명동 지금 사람 많아?', '이태원 붐비나요?'],
    '지하철역': ['강남역 혼잡해?', '홍대입구역 어때?', '잠실역 사람 많나?'],
    '상권': ['가로수길 혼잡도', '인사동 붐비나요?', '연남동 어떤가요?'],
    '공원': ['한강공원 어때?', '남산공원 혼잡해?', '올림픽공원 사람 많아?']
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('관광지');

  // URL 파라미터 처리 (중복 실행 방지)
  useEffect(() => {
    const autoQuery = searchParams.get('q');
    if (autoQuery && !hasAutoSearched.current) {
      console.log('🔗 URL에서 자동 검색어 감지:', autoQuery);
      hasAutoSearched.current = true;
      setQuery(autoQuery);
      // 약간의 지연 후 자동 검색 실행
      setTimeout(() => {
        handleSearch(autoQuery);
      }, 500);
    }
  }, [searchParams]);

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

    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: finalQuery,
      timestamp: new Date().toLocaleString()
    };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);
    setError(null);
    setApiSuggestions([]);

    try {
      const response = await congestionService.queryCongestion({
        query: finalQuery,
        serviceType: 'realtime'
      });

      const foruMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'foru',
        content: getForuMessageByCongestionLevel(response.crowdLevel),
        timestamp: response.timestamp,
        location: response.location,
        congestionLevel: response.crowdLevel,
        congestionMessage: response.message,
        updateTime: response.updateTime,
        reliability: '90%'
      };

      setMessages(prev => [...prev, foruMessage]);
      
      // 추천 장소 처리
      if (response.recommendations && response.recommendations.length > 0) {
        setApiSuggestions(response.recommendations.map(rec => rec.areaName));
      } else if (response.suggestions) {
        setApiSuggestions(response.suggestions);
      }
      
      // 검색 기록에 추가
      setSearchHistory(prev => {
        const newHistory = [finalQuery.trim(), ...prev.filter(h => h !== finalQuery.trim())];
        return newHistory.slice(0, 5);
      });

      // 히스토리에 추가
      addToHistory({
        location: response.location,
        crowdLevel: response.crowdLevel,
        message: response.message,
        timestamp: response.timestamp,
        updateTime: response.updateTime,
        confidence: response.confidence
      }, finalQuery.trim());
    } catch (err) {
      const apiError = err as APIError;
      
      const foruErrorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'foru',
        content: FORU_MESSAGES.error,
        timestamp: new Date().toLocaleString(),
        congestionLevel: '정보없음',
        reliability: '0%'
      };

      setMessages(prev => [...prev, foruErrorMessage]);
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

  // 추천 장소 클릭 처리
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  // 포유 채팅 이벤트 핸들러들
  const handleRefresh = (location: string) => {
    handleSearch(location + ' 혼잡도');
  };

  const handleShare = (message: ChatMessage) => {
    if (navigator.share) {
      navigator.share({
        title: '서울 혼잡도 정보',
        text: `${message.location}: ${message.congestionLevel}\n${message.content}`,
        url: window.location.href
      });
    } else {
      // 폴백: 클립보드에 복사
      const shareText = `${message.location}: ${message.congestionLevel}\n${message.content}`;
      navigator.clipboard.writeText(shareText);
      alert('클립보드에 복사되었습니다!');
    }
  };

  const handleMoreInfo = (location: string) => {
    // 더 많은 정보 검색 (예: 주변 장소, 교통 정보 등)
    handleSearch(location + ' 주변 혼잡도');
  };

  // 입력 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // 간단한 자동완성 (실제로는 더 정교한 로직 필요)
    if (value.length > 1) {
      const allExamples = Object.values(exampleQueries).flat();
      const filtered = allExamples.filter(example => 
        example.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
    
    if (error) setError(null);
    if (apiSuggestions.length > 0) setApiSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* 왼쪽: 입력 영역 */}
          <Card className="border-2 border-orange-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-bold text-amber-900">혼잡도 질의</h2>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="space-y-4">
                <div className="space-y-2 relative">
                  <label htmlFor="query" className="text-sm font-medium text-amber-800">
                    궁금한 지역의 혼잡도를 물어보세요
                  </label>
                  <div className="relative">
                    <Input
                      id="query"
                      value={query}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder="예: 강남역 지금 혼잡해? / 홍대 사람 많아?"
                      className="border-orange-200 focus:border-orange-400 focus:ring-orange-200 pr-12"
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
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </form>

              {/* API 추천 장소 */}
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
                <h3 className="text-sm font-medium text-amber-800">💡 이런 식으로 물어보세요</h3>
                
                {/* 카테고리 탭 */}
                <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
                  {Object.entries(exampleQueries).map(([category, _]) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={`text-xs ${
                        selectedCategory === category 
                          ? 'bg-orange-500 text-white' 
                          : 'text-amber-700 hover:bg-orange-100'
                      }`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* 선택된 카테고리의 예시 질문들 */}
                <div className="space-y-2">
                  {exampleQueries[selectedCategory as keyof typeof exampleQueries].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="block w-full text-left p-3 text-sm bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 text-amber-700 transition-colors"
                      disabled={isLoading}
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>

              {/* 검색 기록 */}
              {searchHistory.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-amber-800">🕒 최근 검색</h3>
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
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(historyItem)}
                        className="text-xs bg-gray-50 hover:bg-gray-100"
                        disabled={isLoading}
                      >
                        {historyItem}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 오른쪽: 포유 채팅 영역 */}
          <ForuChat
            messages={messages}
            isLoading={isLoading}
            onRefresh={handleRefresh}
            onShare={handleShare}
            onMoreInfo={handleMoreInfo}
          />
        </div>
      </div>
    </div>
  );
};

export default CrowdPredictionPageV2;