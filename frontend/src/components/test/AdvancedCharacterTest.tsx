import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Input
} from '../ui';
import CharacterGuide from '../CharacterGuide';

type CongestionLevel = '붐빔' | '약간 붐빔' | '보통' | '여유' | '정보없음';

const AdvancedCharacterTest: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<CongestionLevel>('정보없음');
  const [location, setLocation] = useState('홍대입구역');
  const [customMessage, setCustomMessage] = useState('');
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
  const [showMessage, setShowMessage] = useState(true);

  // 테스트 시나리오들
  const testScenarios = [
    {
      level: '붐빔' as CongestionLevel,
      location: '강남역',
      message: '지금 강남역은 정말 사람이 많아요! 😰 지하철 타기도 힘들 정도예요.',
      description: '극도로 혼잡한 상황'
    },
    {
      level: '약간 붐빔' as CongestionLevel,
      location: '명동',
      message: '명동이 조금 붐비고 있어요. 😅 쇼핑하기엔 괜찮지만 조심하세요!',
      description: '약간 혼잡한 상황'
    },
    {
      level: '보통' as CongestionLevel,
      location: '종로',
      message: '종로는 평소와 비슷한 수준이에요. 😊 무난하게 이용할 수 있어요!',
      description: '평범한 상황'
    },
    {
      level: '여유' as CongestionLevel,
      location: '여의도공원',
      message: '여의도공원이 정말 여유로워요! 🎉 산책하기 완벽한 시간이에요!',
      description: '매우 여유로운 상황'
    },
    {
      level: '정보없음' as CongestionLevel,
      location: '알 수 없는 장소',
      message: '혼잡도 정보를 가져오는 중이에요... 🤔',
      description: '정보 로딩 중'
    }
  ];

  const handleScenarioTest = (scenario: typeof testScenarios[0]) => {
    setSelectedLevel(scenario.level);
    setLocation(scenario.location);
    setCustomMessage(scenario.message);
  };

  const resetToDefault = () => {
    setSelectedLevel('정보없음');
    setLocation('홍대입구역');
    setCustomMessage('');
    setSize('lg');
    setShowMessage(true);
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center">고급 캐릭터 애니메이션 시스템 테스트</h1>
      
      {/* 메인 캐릭터 표시 */}
      <div className="flex justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          <CharacterGuide
            congestionLevel={selectedLevel}
            location={location}
            message={customMessage || undefined}
            size={size}
            showMessage={showMessage}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* 시나리오 테스트 */}
        <Card>
          <CardHeader>
            <CardTitle>🎭 시나리오 테스트</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {testScenarios.map((scenario, index) => (
                <Button
                  key={index}
                  variant={selectedLevel === scenario.level ? "default" : "outline"}
                  onClick={() => handleScenarioTest(scenario)}
                  className="h-auto py-4 flex flex-col items-start text-left"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold">{scenario.level}</span>
                    <span className="text-sm text-gray-500">- {scenario.location}</span>
                  </div>
                  <span className="text-xs text-gray-600">{scenario.description}</span>
                </Button>
              ))}
            </div>
            
            <Button
              variant="ghost"
              onClick={resetToDefault}
              className="w-full mt-4"
            >
              🔄 초기화
            </Button>
          </CardContent>
        </Card>

        {/* 커스텀 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>⚙️ 커스텀 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 혼잡도 레벨 */}
            <div>
              <label className="block text-sm font-medium mb-2">혼잡도 레벨</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as CongestionLevel)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="붐빔">붐빔 (매우 혼잡)</option>
                <option value="약간 붐빔">약간 붐빔 (조금 혼잡)</option>
                <option value="보통">보통 (평범함)</option>
                <option value="여유">여유 (매우 여유)</option>
                <option value="정보없음">정보없음 (로딩중)</option>
              </select>
            </div>

            {/* 장소명 */}
            <div>
              <label className="block text-sm font-medium mb-2">장소명</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="장소명을 입력하세요"
              />
            </div>

            {/* 커스텀 메시지 */}
            <div>
              <label className="block text-sm font-medium mb-2">커스텀 메시지</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="커스텀 메시지를 입력하세요 (비워두면 기본 메시지 사용)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            {/* 크기 설정 */}
            <div>
              <label className="block text-sm font-medium mb-2">캐릭터 크기</label>
              <div className="flex space-x-2">
                {(['sm', 'md', 'lg', 'xl'] as const).map((sizeOption) => (
                  <Button
                    key={sizeOption}
                    variant={size === sizeOption ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSize(sizeOption)}
                  >
                    {sizeOption.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* 메시지 표시 토글 */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showMessage"
                checked={showMessage}
                onChange={(e) => setShowMessage(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showMessage" className="text-sm font-medium">
                말풍선 메시지 표시
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 애니메이션 설명 */}
      <Card>
        <CardHeader>
          <CardTitle>🎨 애니메이션 효과 설명</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-red-600">🔴 붐빔 상태</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 스트레스 받는 표정 필터</li>
                <li>• 격렬한 흔들림 애니메이션</li>
                <li>• 빨간색 오라 효과</li>
                <li>• 스트레스 폭발 파티클</li>
                <li>• 빨간색 테마 말풍선</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-orange-600">🟠 약간 붐빔 상태</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 걱정스러운 표정 필터</li>
                <li>• 좌우 흔들림 애니메이션</li>
                <li>• 주황색 오라 효과</li>
                <li>• 땀방울 파티클</li>
                <li>• 주황색 테마 말풍선</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-600">🔵 보통 상태</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 자연스러운 표정</li>
                <li>• 부드러운 펄스 애니메이션</li>
                <li>• 파란색 오라 효과</li>
                <li>• 파티클 없음</li>
                <li>• 파란색 테마 말풍선</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-green-600">🟢 여유 상태</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 밝은 표정 필터</li>
                <li>• 즐거운 바운스 애니메이션</li>
                <li>• 초록색 오라 효과</li>
                <li>• 하트 파티클</li>
                <li>• 초록색 테마 말풍선</li>
                <li>• 무지개 효과</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-600">⚪ 정보없음 상태</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 흐릿한 그레이스케일</li>
                <li>• 부드러운 플로팅</li>
                <li>• 회색 오라 효과</li>
                <li>• 파티클 없음</li>
                <li>• 회색 테마 말풍선</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-purple-600">✨ 공통 효과</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 부드러운 상태 전환</li>
                <li>• 배경 오라 펄스</li>
                <li>• 반응형 크기 조절</li>
                <li>• 이미지 폴백 시스템</li>
                <li>• 접근성 고려 설계</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 성능 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ 성능 최적화</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">🎯 최적화 기법</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• CSS 애니메이션 사용 (JS 애니메이션 대신)</li>
                <li>• transform 속성 활용 (reflow 방지)</li>
                <li>• will-change 속성으로 GPU 가속</li>
                <li>• 애니메이션 지연 시간 최적화</li>
                <li>• 불필요한 리렌더링 방지</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🔧 기술 스택</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• React 18 + TypeScript</li>
                <li>• Tailwind CSS 애니메이션</li>
                <li>• CSS-in-JS 하이브리드</li>
                <li>• 반응형 디자인</li>
                <li>• 접근성 준수 (WCAG 2.1)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedCharacterTest;