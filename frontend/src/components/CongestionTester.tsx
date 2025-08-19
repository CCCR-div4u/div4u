import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, LoadingSpinner } from './ui';
import { ArrowLeft, Home, Search, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { congestionService } from '../services/congestionService';

interface CongestionResult {
  location: string;
  congestionLevel: string;
  congestionMessage: string;
  timestamp: string;
  reliability?: string;
  updateTime?: string;
}

const CongestionTester: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<CongestionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!query.trim()) {
      setError('질의를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Sending query:', query);
      
      const result = await congestionService.queryCongestion({
        query,
        serviceType: 'realtime'
      });

      console.log('Received response:', result);

      setResult({
        location: result.location || '알 수 없음',
        congestionLevel: result.crowdLevel || '정보없음',
        congestionMessage: result.message || '혼잡도 정보를 가져올 수 없습니다.',
        timestamp: new Date().toLocaleString(),
        reliability: result.confidence ? `${Math.round(result.confidence * 100)}%` : undefined,
        updateTime: result.updateTime
      });
    } catch (err) {
      console.error('Congestion test error:', err);
      if (err instanceof Error) {
        setError(`서버 오류: ${err.message}`);
      } else {
        setError('알 수 없는 서버 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getCongestionStyle = (level: string) => {
    const styles = {
      '붐빔': 'bg-red-100 border-red-300 text-red-800',
      '매우 붐빔': 'bg-red-100 border-red-300 text-red-800',
      '약간 붐빔': 'bg-orange-100 border-orange-300 text-orange-800',
      '보통': 'bg-blue-100 border-blue-300 text-blue-800',
      '여유': 'bg-green-100 border-green-300 text-green-800',
      '정보없음': 'bg-gray-100 border-gray-300 text-gray-800'
    };
    return styles[level as keyof typeof styles] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dev-tools')}
            className="text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            개발자 도구로
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800"
          >
            <Home className="w-4 h-4 mr-2" />
            홈으로
          </Button>
          <div className="h-6 w-px bg-blue-300"></div>
          <h1 className="text-2xl font-bold text-blue-900">혼잡도 테스트</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 입력 영역 */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">자연어 질의 테스트</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  질의 입력
                </label>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="예: 강남역 혼잡도 알려줘"
                  className="border-blue-300 focus:border-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleTest()}
                />
              </div>

              <Button
                onClick={handleTest}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    조회 중...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    혼잡도 조회
                  </>
                )}
              </Button>

              {/* 예시 질의들 */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-blue-700 mb-3">예시 질의</h4>
                <div className="space-y-2">
                  {[
                    '강남역 혼잡도 알려줘',
                    '홍대입구역 사람 많아?',
                    '명동 관광특구 붐비나?',
                    '잠실 한강공원 혼잡도'
                  ].map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuery(example)}
                      className="w-full text-left justify-start border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 결과 영역 */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">조회 결과</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner className="w-8 h-8 text-blue-600" />
                  <span className="ml-2 text-blue-700">조회 중...</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-800 font-medium">오류 발생</div>
                  <div className="text-red-600 text-sm mt-1">{error}</div>
                </div>
              )}

              {result && (
                <div className={`rounded-lg border-2 p-4 ${getCongestionStyle(result.congestionLevel)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold">{result.location}</h3>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/50">
                      {result.congestionLevel}
                    </span>
                  </div>
                  <p className="text-sm mb-3">{result.congestionMessage}</p>
                  <div className="text-xs space-y-1 opacity-75">
                    <div>조회 시간: {result.timestamp}</div>
                    {result.reliability && <div>신뢰도: {result.reliability}</div>}
                    {result.updateTime && <div>데이터 업데이트: {result.updateTime}</div>}
                  </div>
                </div>
              )}

              {!isLoading && !error && !result && (
                <div className="text-center py-8 text-blue-600">
                  질의를 입력하고 조회 버튼을 눌러주세요.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 추가 정보 */}
        <Card className="mt-6 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">테스트 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">지원하는 질의 형태</h4>
                <ul className="space-y-1 text-blue-600">
                  <li>• "[장소명] 혼잡도 알려줘"</li>
                  <li>• "[장소명] 사람 많아?"</li>
                  <li>• "[장소명] 붐비나?"</li>
                  <li>• "[장소명] 혼잡도"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">혼잡도 레벨</h4>
                <ul className="space-y-1 text-blue-600">
                  <li>• <span className="text-green-600">여유</span>: 자유롭게 이동 가능</li>
                  <li>• <span className="text-blue-600">보통</span>: 원활한 이동</li>
                  <li>• <span className="text-orange-600">약간 붐빔</span>: 이동에 제약</li>
                  <li>• <span className="text-red-600">붐빔/매우 붐빔</span>: 이동 어려움</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CongestionTester;