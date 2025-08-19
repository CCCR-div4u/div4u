import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent
} from '../ui';
import ResponsiveLayout, { 
  useScreenSize, 
  ResponsiveContainer, 
  ResponsiveGrid, 
  ResponsiveText,
  ResponsiveSpacing,
  TouchFriendlyButton
} from '../ResponsiveLayout';
import ResponsiveHeader from '../ResponsiveHeader';
import MobileNavigation from '../MobileNavigation';
import { Smartphone, Tablet, Monitor, Rotate3D } from 'lucide-react';

const ResponsiveTest: React.FC = () => {
  const screenSize = useScreenSize();
  const [testMode, setTestMode] = useState<'auto' | 'mobile' | 'tablet' | 'desktop'>('auto');

  const deviceInfo = {
    mobile: { icon: <Smartphone className="w-5 h-5" />, label: '모바일', color: 'bg-green-500' },
    tablet: { icon: <Tablet className="w-5 h-5" />, label: '태블릿', color: 'bg-blue-500' },
    desktop: { icon: <Monitor className="w-5 h-5" />, label: '데스크톱', color: 'bg-purple-500' }
  };

  const getCurrentDevice = () => {
    if (screenSize.isMobile) return 'mobile';
    if (screenSize.isTablet) return 'tablet';
    return 'desktop';
  };

  const currentDevice = getCurrentDevice();

  return (
    <ResponsiveLayout className="bg-gradient-to-br from-blue-50 to-purple-50">
      <ResponsiveHeader
        title="반응형 디자인 테스트"
        showBackButton={true}
        showHomeButton={true}
        showMenuButton={screenSize.isMobile}
      />

      <ResponsiveContainer className="py-4">
        {/* 현재 화면 정보 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Rotate3D className="w-5 h-5" />
              <span>현재 화면 정보</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">화면 크기</div>
                <div className="text-lg font-bold">
                  {screenSize.width} × {screenSize.height}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">디바이스 타입</div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${deviceInfo[currentDevice].color}`}></div>
                  <span className="font-bold">{deviceInfo[currentDevice].label}</span>
                  {deviceInfo[currentDevice].icon}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">방향</div>
                <div className="font-bold capitalize">
                  {screenSize.orientation === 'portrait' ? '세로' : '가로'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">터치 지원</div>
                <div className="font-bold">
                  {screenSize.isTouch ? '✅ 지원' : '❌ 미지원'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">브레이크포인트</div>
                <div className="text-sm">
                  {screenSize.width < 640 && <span className="bg-red-100 text-red-800 px-2 py-1 rounded">XS</span>}
                  {screenSize.width >= 640 && screenSize.width < 768 && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">SM</span>}
                  {screenSize.width >= 768 && screenSize.width < 1024 && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">MD</span>}
                  {screenSize.width >= 1024 && screenSize.width < 1280 && <span className="bg-green-100 text-green-800 px-2 py-1 rounded">LG</span>}
                  {screenSize.width >= 1280 && screenSize.width < 1536 && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">XL</span>}
                  {screenSize.width >= 1536 && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">2XL</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 반응형 그리드 테스트 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>반응형 그리드 테스트</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid
              cols={{ mobile: 1, tablet: 2, desktop: 3 }}
              gap={{ mobile: '1rem', tablet: '1.5rem', desktop: '2rem' }}
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div
                  key={num}
                  className="bg-gradient-to-br from-blue-400 to-purple-500 text-white p-4 rounded-lg text-center font-bold"
                >
                  그리드 {num}
                </div>
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>

        {/* 반응형 텍스트 테스트 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>반응형 텍스트 테스트</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ResponsiveText size="xs">
              Extra Small 텍스트 - 모바일에서는 더 작게, 데스크톱에서는 더 크게
            </ResponsiveText>
            <ResponsiveText size="sm">
              Small 텍스트 - 화면 크기에 따라 자동 조절
            </ResponsiveText>
            <ResponsiveText size="base">
              Base 텍스트 - 기본 크기에서 반응형으로 확장
            </ResponsiveText>
            <ResponsiveText size="lg">
              Large 텍스트 - 큰 화면에서 더욱 돋보이게
            </ResponsiveText>
            <ResponsiveText size="xl">
              Extra Large 텍스트 - 헤드라인용 반응형 텍스트
            </ResponsiveText>
          </CardContent>
        </Card>

        {/* 터치 친화적 버튼 테스트 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>터치 친화적 버튼 테스트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                터치 디바이스에서는 버튼이 더 크게 표시됩니다 (최소 44px)
              </div>
              
              <div className="flex flex-wrap gap-3">
                <TouchFriendlyButton variant="primary" size="sm">
                  Small 버튼
                </TouchFriendlyButton>
                <TouchFriendlyButton variant="secondary" size="md">
                  Medium 버튼
                </TouchFriendlyButton>
                <TouchFriendlyButton variant="outline" size="lg">
                  Large 버튼
                </TouchFriendlyButton>
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                {screenSize.isTouch ? '터치 디바이스 감지됨 - 버튼이 터치 친화적으로 확장됨' : '마우스 디바이스 감지됨 - 일반 크기 버튼'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 반응형 간격 테스트 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>반응형 간격 테스트</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveSpacing
              padding={{ mobile: 'p-2', tablet: 'p-4', desktop: 'p-6' }}
              margin={{ mobile: 'm-1', tablet: 'm-2', desktop: 'm-3' }}
              className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg"
            >
              <div className="bg-white rounded p-4 text-center">
                이 박스는 화면 크기에 따라 다른 패딩과 마진을 가집니다.
                <br />
                모바일: 작은 간격, 태블릿: 중간 간격, 데스크톱: 큰 간격
              </div>
            </ResponsiveSpacing>
          </CardContent>
        </Card>

        {/* 디바이스별 표시/숨김 테스트 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>디바이스별 표시/숨김 테스트</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="hide-on-mobile bg-blue-100 p-4 rounded-lg">
              📱 이 메시지는 모바일에서는 숨겨집니다 (데스크톱/태블릿 전용)
            </div>
            
            <div className="hide-on-desktop bg-green-100 p-4 rounded-lg">
              💻 이 메시지는 데스크톱에서는 숨겨집니다 (모바일 전용)
            </div>
            
            <div className="block sm:hidden bg-red-100 p-4 rounded-lg">
              📱 Tailwind 클래스: 모바일에서만 표시 (block sm:hidden)
            </div>
            
            <div className="hidden sm:block bg-purple-100 p-4 rounded-lg">
              🖥️ Tailwind 클래스: 태블릿 이상에서만 표시 (hidden sm:block)
            </div>
          </CardContent>
        </Card>

        {/* 성능 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>반응형 디자인 특징</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">🎯 브레이크포인트</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• XS: ~475px (초소형 모바일)</li>
                  <li>• SM: 640px+ (모바일)</li>
                  <li>• MD: 768px+ (태블릿)</li>
                  <li>• LG: 1024px+ (데스크톱)</li>
                  <li>• XL: 1280px+ (대형 데스크톱)</li>
                  <li>• 2XL: 1536px+ (초대형 화면)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">📱 터치 최적화</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• 최소 44px 터치 영역</li>
                  <li>• 터치 피드백 애니메이션</li>
                  <li>• 호버 효과 비활성화</li>
                  <li>• 적절한 간격 확보</li>
                  <li>• 세로/가로 모드 대응</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </ResponsiveContainer>

      {/* 모바일 네비게이션 */}
      <MobileNavigation />
    </ResponsiveLayout>
  );
};

export default ResponsiveTest;