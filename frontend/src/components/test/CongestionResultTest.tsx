import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Input
} from '../ui';
import CongestionResult from '../CongestionResult';
import CongestionHistory from '../CongestionHistory';
import CongestionComparison from '../CongestionComparison';

const CongestionResultTest: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'result' | 'history' | 'comparison'>('result');
  const [testResult, setTestResult] = useState({
    location: '홍대입구역',
    crowdLevel: '여유',
    message: '사람이 몰려있을 가능성이 낮고 붐빔은 거의 느껴지지 않아요. 도보 이동이 자유로워요.',
    timestamp: new Date().toISOString(),
    confidence: 0.9,
    suggestions: ['홍대 관광특구', '신촌역', '이대역']
  });

  // 테스트 데이터들
  const testCases = [
    {
      location: '강남역',
      crowdLevel: '붐빔',
      message: '많은 사람들이 몰려있어 붐비고 있어요. 이동시 주의하세요.',
      confidence: 0.95
    },
    {
      location: '명동',
      crowdLevel: '약간 붐빔',
      message: '사람이 몰려있을 가능성이 있고 약간 붐빌 수 있어요.',
      confidence: 0.8
    },
    {
      location: '여의도한강공원',
      crowdLevel: '여유',
      message: '사람이 몰려있을 가능성이 낮고 붐빔은 거의 느껴지지 않아요.',
      confidence: 0.85
    },
    {
      location: '경복궁',
      crowdLevel: '보통',
      message: '평소 수준의 혼잡도를 보이고 있어요.',
      confidence: 0.75
    },
    {
      location: '알 수 없는 장소',
      crowdLevel: '정보없음',
      message: '혼잡도 정보를 가져올 수 없습니다.',
      confidence: 0.0
    }
  ];

  const handleTestCase = (testCase: any) => {
    setTestResult({
      ...testCase,
      timestamp: new Date().toISOString(),
      suggestions: ['관련 장소 1', '관련 장소 2']
    });
  };

  const handleRefresh = () => {
    console.log('새로고침 요청');
    // 실제로는 API 호출
    setTimeout(() => {
      setTestResult({
        ...testResult,
        timestamp: new Date().toISOString()
      });
    }, 1000);
  };

  const handleShare = () => {
    console.log('공유 요청');
    alert('공유 기능이 실행되었습니다!');
  };

  const handleNewSearch = () => {
    console.log('새 검색 요청');
    alert('새 검색 기능이 실행되었습니다!');
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center">혼잡도 결과 표시 시스템 테스트</h1>
      
      {/* 탭 네비게이션 */}
      <Card>
        <CardHeader>
          <CardTitle>테스트 섹션</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button
              variant={selectedTab === 'result' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('result')}
            >
              결과 표시
            </Button>
            <Button
              variant={selectedTab === 'history' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('history')}
            >
              검색 기록
            </Button>
            <Button
              variant={selectedTab === 'comparison' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('comparison')}
            >
              혼잡도 비교
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedTab === 'result' && (
        <>
          {/* 테스트 케이스 선택 */}
          <Card>
            <CardHeader>
              <CardTitle>테스트 케이스</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {testCases.map((testCase, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleTestCase(testCase)}
                    className="h-auto py-3 flex flex-col items-center"
                  >
                    <span className="font-medium">{testCase.location}</span>
                    <span className="text-xs text-gray-500">{testCase.crowdLevel}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 결과 표시 */}
          <div className="max-w-2xl mx-auto">
            <CongestionResult
              result={testResult}
              onRefresh={handleRefresh}
              onShare={handleShare}
              onNewSearch={handleNewSearch}
            />
          </div>
        </>
      )}

      {selectedTab === 'history' && (
        <div className="max-w-2xl mx-auto">
          <CongestionHistory />
        </div>
      )}

      {selectedTab === 'comparison' && (
        <div className="max-w-4xl mx-auto">
          <CongestionComparison
            initialItems={[
              {
                location: '강남역',
                crowdLevel: '붐빔',
                message: '매우 혼잡합니다.',
                timestamp: new Date().toISOString(),
                confidence: 0.95
              },
              {
                location: '여의도한강공원',
                crowdLevel: '여유',
                message: '여유로운 상태입니다.',
                timestamp: new Date().toISOString(),
                confidence: 0.85
              }
            ]}
          />
        </div>
      )}

      {/* 커스텀 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>커스텀 테스트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">장소명</label>
              <Input
                value={testResult.location}
                onChange={(e) => setTestResult({...testResult, location: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">혼잡도</label>
              <select
                value={testResult.crowdLevel}
                onChange={(e) => setTestResult({...testResult, crowdLevel: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="붐빔">붐빔</option>
                <option value="약간 붐빔">약간 붐빔</option>
                <option value="보통">보통</option>
                <option value="여유">여유</option>
                <option value="정보없음">정보없음</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">메시지</label>
            <textarea
              value={testResult.message}
              onChange={(e) => setTestResult({...testResult, message: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">신뢰도 ({Math.round((testResult.confidence || 0) * 100)}%)</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={testResult.confidence || 0}
              onChange={(e) => setTestResult({...testResult, confidence: parseFloat(e.target.value)})}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CongestionResultTest;