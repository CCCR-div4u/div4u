import React, { useState } from 'react';
import CharacterGuide from '../CharacterGuide';
import { Button, Card, CardHeader, CardTitle, CardContent } from '../ui';

type CongestionLevel = '붐빔' | '약간 붐빔' | '보통' | '여유' | '정보없음';

const CharacterTest: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<CongestionLevel>('정보없음');
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [location, setLocation] = useState('홍대입구역');
  const [showMessage, setShowMessage] = useState(true);

  const congestionLevels: CongestionLevel[] = ['붐빔', '약간 붐빔', '보통', '여유', '정보없음'];
  const sizes: Array<'sm' | 'md' | 'lg' | 'xl'> = ['sm', 'md', 'lg', 'xl'];

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center">캐릭터 가이드 테스트</h1>
      
      {/* 컨트롤 패널 */}
      <Card>
        <CardHeader>
          <CardTitle>캐릭터 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 혼잡도 레벨 선택 */}
          <div>
            <label className="block text-sm font-medium mb-2">혼잡도 레벨</label>
            <div className="flex flex-wrap gap-2">
              {congestionLevels.map((level) => (
                <Button
                  key={level}
                  variant={selectedLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLevel(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* 크기 선택 */}
          <div>
            <label className="block text-sm font-medium mb-2">크기</label>
            <div className="flex gap-2">
              {sizes.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSize(size)}
                >
                  {size.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* 장소 입력 */}
          <div>
            <label className="block text-sm font-medium mb-2">장소</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="장소를 입력하세요"
            />
          </div>

          {/* 메시지 표시 토글 */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showMessage}
                onChange={(e) => setShowMessage(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium">메시지 표시</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* 캐릭터 미리보기 */}
      <Card>
        <CardHeader>
          <CardTitle>캐릭터 미리보기</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <CharacterGuide
              congestionLevel={selectedLevel}
              location={location}
              size={selectedSize}
              showMessage={showMessage}
            />
          </div>
        </CardContent>
      </Card>

      {/* 모든 상태 미리보기 */}
      <Card>
        <CardHeader>
          <CardTitle>모든 상태 미리보기</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {congestionLevels.map((level) => (
              <div key={level} className="text-center">
                <h3 className="font-semibold mb-4 text-lg">{level}</h3>
                <CharacterGuide
                  congestionLevel={level}
                  location="테스트 장소"
                  size="md"
                  showMessage={false}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 크기별 미리보기 */}
      <Card>
        <CardHeader>
          <CardTitle>크기별 미리보기</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-center gap-8">
            {sizes.map((size) => (
              <div key={size} className="text-center">
                <h3 className="font-semibold mb-4">{size.toUpperCase()}</h3>
                <CharacterGuide
                  congestionLevel="여유"
                  size={size}
                  showMessage={false}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 애니메이션 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>애니메이션 테스트</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <h4 className="font-medium mb-2">Shake (붐빔)</h4>
              <div className="w-24 h-24 bg-red-100 rounded-full mx-auto animate-shake flex items-center justify-center text-2xl">
                😰
              </div>
            </div>
            <div className="text-center">
              <h4 className="font-medium mb-2">Wiggle (약간 붐빔)</h4>
              <div className="w-24 h-24 bg-orange-100 rounded-full mx-auto animate-wiggle flex items-center justify-center text-2xl">
                😅
              </div>
            </div>
            <div className="text-center">
              <h4 className="font-medium mb-2">Float (보통)</h4>
              <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto animate-float flex items-center justify-center text-2xl">
                😊
              </div>
            </div>
            <div className="text-center">
              <h4 className="font-medium mb-2">Bounce (여유)</h4>
              <div className="w-24 h-24 bg-green-100 rounded-full mx-auto animate-bounce flex items-center justify-center text-2xl">
                🎉
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CharacterTest;