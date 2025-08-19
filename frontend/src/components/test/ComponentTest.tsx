import React from 'react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Input,
  Badge,
  CongestionBadge,
  ServiceCard,
  LoadingSpinner,
  LoadingDots
} from '../ui';

const ComponentTest: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center">shadcn/ui 컴포넌트 테스트</h1>
      
      {/* 버튼 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>Button 컴포넌트</CardTitle>
        </CardHeader>
        <CardContent className="space-x-4">
          <Button>기본 버튼</Button>
          <Button variant="secondary">보조 버튼</Button>
          <Button variant="outline">아웃라인 버튼</Button>
          <Button variant="destructive">삭제 버튼</Button>
          <Button variant="ghost">고스트 버튼</Button>
        </CardContent>
      </Card>

      {/* 입력 컴포넌트 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>Input 컴포넌트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="장소를 입력하세요..." />
          <Input type="email" placeholder="이메일을 입력하세요..." />
        </CardContent>
      </Card>

      {/* 배지 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>Badge 컴포넌트</CardTitle>
        </CardHeader>
        <CardContent className="space-x-2">
          <Badge>기본</Badge>
          <Badge variant="secondary">보조</Badge>
          <Badge variant="destructive">위험</Badge>
          <Badge variant="outline">아웃라인</Badge>
        </CardContent>
      </Card>

      {/* 혼잡도 배지 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>혼잡도 Badge 컴포넌트</CardTitle>
        </CardHeader>
        <CardContent className="space-x-2 space-y-2">
          <div className="flex flex-wrap gap-2">
            <CongestionBadge level="붐빔" />
            <CongestionBadge level="약간 붐빔" />
            <CongestionBadge level="보통" />
            <CongestionBadge level="여유" />
            <CongestionBadge level="정보없음" />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <CongestionBadge level="붐빔" size="sm" />
            <CongestionBadge level="보통" size="md" />
            <CongestionBadge level="여유" size="lg" />
          </div>
        </CardContent>
      </Card>

      {/* 서비스 카드 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>Service Card 컴포넌트</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <ServiceCard
              title="실시간 혼잡도"
              icon="📍"
              description="현재 혼잡도를 확인하세요"
              available={true}
              onClick={() => alert('실시간 혼잡도 클릭!')}
            />
            <ServiceCard
              title="혼잡도 예측"
              icon="🔮"
              description="미래 혼잡도를 예측합니다"
              available={false}
            />
          </div>
        </CardContent>
      </Card>

      {/* 로딩 컴포넌트 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>Loading 컴포넌트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" />
            <LoadingSpinner size="lg" />
          </div>
          <div className="flex items-center space-x-4">
            <LoadingDots />
            <span>로딩 중...</span>
          </div>
        </CardContent>
      </Card>

      {/* 애니메이션 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>커스텀 애니메이션</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <div className="w-16 h-16 bg-blue-500 rounded-lg animate-float"></div>
            <div className="w-16 h-16 bg-green-500 rounded-lg animate-wiggle"></div>
            <div className="w-16 h-16 bg-red-500 rounded-lg animate-shake"></div>
            <div className="w-16 h-16 bg-purple-500 rounded-lg animate-glow"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComponentTest;