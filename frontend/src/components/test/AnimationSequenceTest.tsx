import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent
} from '../ui';
import CharacterGuide from '../CharacterGuide';

type CongestionLevel = '붐빔' | '약간 붐빔' | '보통' | '여유' | '정보없음';

const AnimationSequenceTest: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState<CongestionLevel>('정보없음');
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(3000);
  const [location, setLocation] = useState('테스트 장소');

  // 자동 재생 시퀀스
  const sequence: CongestionLevel[] = ['정보없음', '여유', '보통', '약간 붐빔', '붐빔', '여유', '정보없음'];
  const [sequenceIndex, setSequenceIndex] = useState(0);

  // 시나리오 테스트 케이스들
  const scenarios = [
    {
      name: '🌅 아침 출근길',
      sequence: ['여유', '보통', '약간 붐빔', '붐빔'] as CongestionLevel[],
      description: '점진적으로 혼잡해지는 상황'
    },
    {
      name: '🌆 퇴근 시간',
      sequence: ['붐빔', '약간 붐빔', '보통', '여유'] as CongestionLevel[],
      description: '점진적으로 여유로워지는 상황'
    },
    {
      name: '🎉 이벤트 시작',
      sequence: ['보통', '붐빔', '여유', '보통'] as CongestionLevel[],
      description: '급격한 변화가 있는 상황'
    },
    {
      name: '🔄 실시간 업데이트',
      sequence: ['정보없음', '여유', '정보없음', '보통', '정보없음', '붐빔'] as CongestionLevel[],
      description: '로딩과 결과가 반복되는 상황'
    }
  ];

  // 자동 재생 효과
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setSequenceIndex(prev => {
        const nextIndex = (prev + 1) % sequence.length;
        setCurrentLevel(sequence[nextIndex]);
        return nextIndex;
      });
    }, autoPlaySpeed);

    return () => clearInterval(interval);
  }, [isAutoPlay, autoPlaySpeed, sequence]);

  // 시나리오 실행
  const runScenario = async (scenario: typeof scenarios[0]) => {
    setIsAutoPlay(false);
    
    for (let i = 0; i < scenario.sequence.length; i++) {
      setCurrentLevel(scenario.sequence[i]);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  // 수동 레벨 변경
  const handleLevelChange = (level: CongestionLevel) => {
    setIsAutoPlay(false);
    setCurrentLevel(level);
  };

  // 전환 효과 데모
  const runTransitionDemo = async () => {
    setIsAutoPlay(false);
    const demoSequence: CongestionLevel[] = ['붐빔', '여유', '붐빔', '보통', '여유'];
    
    for (const level of demoSequence) {
      setCurrentLevel(level);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center">애니메이션 시퀀스 및 전환 효과 테스트</h1>
      
      {/* 메인 캐릭터 표시 */}
      <div className="flex justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          <CharacterGuide
            congestionLevel={currentLevel}
            location={location}
            size="xl"
            showMessage={true}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* 수동 제어 */}
        <Card>
          <CardHeader>
            <CardTitle>🎮 수동 제어</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 현재 상태 */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-800">현재 상태</div>
              <div className="text-2xl font-bold text-blue-900">{currentLevel}</div>
            </div>

            {/* 장소명 설정 */}
            <div>
              <label className="block text-sm font-medium mb-2">장소명</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="장소명을 입력하세요"
              />
            </div>

            {/* 혼잡도 버튼들 */}
            <div className="space-y-3">
              <div className="text-sm font-medium">혼잡도 레벨 선택</div>
              <div className="grid grid-cols-1 gap-2">
                {(['정보없음', '여유', '보통', '약간 붐빔', '붐빔'] as CongestionLevel[]).map((level) => (
                  <Button
                    key={level}
                    variant={currentLevel === level ? "default" : "outline"}
                    onClick={() => handleLevelChange(level)}
                    className="justify-start"
                  >
                    <span className="mr-2">
                      {level === '붐빔' ? '🔴' :
                       level === '약간 붐빔' ? '🟠' :
                       level === '보통' ? '🟡' :
                       level === '여유' ? '🟢' : '⚪'}
                    </span>
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            {/* 전환 효과 데모 */}
            <div className="pt-4 border-t">
              <Button
                onClick={runTransitionDemo}
                className="w-full"
                variant="outline"
              >
                🎬 전환 효과 데모 실행
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 자동 재생 및 시나리오 */}
        <Card>
          <CardHeader>
            <CardTitle>🎭 자동 재생 & 시나리오</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 자동 재생 제어 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">자동 재생</span>
                <Button
                  variant={isAutoPlay ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                >
                  {isAutoPlay ? '⏸️ 정지' : '▶️ 재생'}
                </Button>
              </div>

              {/* 재생 속도 조절 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  재생 속도: {autoPlaySpeed / 1000}초
                </label>
                <input
                  type="range"
                  min="1000"
                  max="5000"
                  step="500"
                  value={autoPlaySpeed}
                  onChange={(e) => setAutoPlaySpeed(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* 진행 상황 */}
              {isAutoPlay && (
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">
                    진행: {sequenceIndex + 1} / {sequence.length}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((sequenceIndex + 1) / sequence.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 시나리오 테스트 */}
            <div className="space-y-3">
              <div className="text-sm font-medium">시나리오 테스트</div>
              {scenarios.map((scenario, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{scenario.name}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runScenario(scenario)}
                    >
                      실행
                    </Button>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">{scenario.description}</div>
                  <div className="flex space-x-1">
                    {scenario.sequence.map((level, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded">
                        {level === '붐빔' ? '🔴' :
                         level === '약간 붐빔' ? '🟠' :
                         level === '보통' ? '🟡' :
                         level === '여유' ? '🟢' : '⚪'}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 애니메이션 기술 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>🎨 애니메이션 기술 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-600">🔄 전환 타입</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span><strong>Bounce:</strong> 여유 상태로 전환</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span><strong>Elastic:</strong> 스트레스 상태로 전환</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span><strong>Smooth:</strong> 기타 모든 전환</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-purple-600">⚡ 성능 최적화</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>• GPU 가속 활용</div>
                <div>• will-change 속성 사용</div>
                <div>• 불필요한 리렌더링 방지</div>
                <div>• 메모리 효율적 타이머 관리</div>
                <div>• 접근성 고려 (prefers-reduced-motion)</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-orange-600">🎭 시퀀스 효과</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>• 다중 애니메이션 레이어</div>
                <div>• 시간차 애니메이션 시작</div>
                <div>• 부드러운 상태 전환</div>
                <div>• 파티클 시스템 동기화</div>
                <div>• 오라 효과 연동</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 사용 가이드 */}
      <Card>
        <CardHeader>
          <CardTitle>📖 사용 가이드</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">🎮 테스트 방법</h3>
              <ol className="text-sm space-y-2 text-gray-700">
                <li>1. <strong>수동 제어:</strong> 혼잡도 버튼을 클릭하여 즉시 상태 변경</li>
                <li>2. <strong>자동 재생:</strong> 전체 시퀀스를 자동으로 순환 재생</li>
                <li>3. <strong>시나리오 테스트:</strong> 실제 상황을 모방한 시퀀스 실행</li>
                <li>4. <strong>전환 효과 데모:</strong> 다양한 전환 애니메이션 확인</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold mb-3">🔍 관찰 포인트</h3>
              <ul className="text-sm space-y-2 text-gray-700">
                <li>• <strong>캐릭터 전환:</strong> 상태 변경 시 부드러운 애니메이션</li>
                <li>• <strong>파티클 효과:</strong> 파티클 등장/사라짐 애니메이션</li>
                <li>• <strong>오라 변화:</strong> 색상과 강도의 점진적 변화</li>
                <li>• <strong>말풍선 전환:</strong> 메시지 변경 시 애니메이션</li>
                <li>• <strong>성능:</strong> 부드러운 60fps 애니메이션 유지</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimationSequenceTest;