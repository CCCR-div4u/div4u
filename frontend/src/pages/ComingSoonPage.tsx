import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CharacterGuide
} from '../components/ui';
import { ArrowLeft, Home, Clock, Zap, TrendingUp, Users, Bell, Star } from 'lucide-react';
import CountdownTimer from '../components/CountdownTimer';
import ProgressBar from '../components/ProgressBar';

interface ComingSoonPageProps {
  serviceName?: string;
  serviceDescription?: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  serviceName = "새로운 서비스",
  serviceDescription = "더 나은 서비스를 준비하고 있습니다"
}) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // 예상 출시일 (예시: 30일 후)
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 30);

  // 카운트다운 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  // 서비스별 맞춤 정보
  const getServiceInfo = () => {
    const path = window.location.pathname;
    
    if (path.includes('prediction')) {
      return {
        name: "혼잡도 예측 서비스",
        description: "AI 기반으로 미래의 혼잡도를 예측하는 서비스",
        icon: "🔮",
        features: [
          "1시간 후 혼잡도 예측",
          "주간/월간 패턴 분석", 
          "최적 방문 시간 추천",
          "개인 맞춤 알림 서비스"
        ],
        benefits: [
          "대기시간 최소화",
          "효율적인 일정 계획",
          "스트레스 없는 이동"
        ]
      };
    } else if (path.includes('comparison')) {
      return {
        name: "혼잡도 비교 서비스",
        description: "여러 장소의 혼잡도를 한 번에 비교하는 서비스",
        icon: "📊",
        features: [
          "최대 10개 장소 동시 비교",
          "실시간 순위 업데이트",
          "지도 기반 시각화",
          "즐겨찾기 장소 관리"
        ],
        benefits: [
          "최적 장소 선택",
          "시간 절약",
          "편리한 의사결정"
        ]
      };
    } else {
      return {
        name: "고급 분석 서비스",
        description: "더 정교한 혼잡도 분석과 인사이트를 제공하는 서비스",
        icon: "🎯",
        features: [
          "상세 통계 분석",
          "트렌드 예측",
          "개인화 추천",
          "데이터 내보내기"
        ],
        benefits: [
          "깊이 있는 인사이트",
          "데이터 기반 의사결정",
          "개인 맞춤 서비스"
        ]
      };
    }
  };

  const serviceInfo = getServiceInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>뒤로</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>홈</span>
              </Button>
            </div>
            <h1 className="text-xl font-bold text-gray-800">준비 중인 서비스</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* 메인 섹션 */}
          <div className="text-center mb-12">
            {/* 캐릭터 */}
            <div className="mb-8">
              <CharacterGuide
                congestionLevel="정보없음"
                message="곧 멋진 새 서비스가 출시될 예정이에요! 조금만 기다려주세요~ 🚀"
                size="xl"
                showMessage={true}
              />
            </div>

            {/* 서비스 정보 */}
            <div className="mb-8">
              <div className="text-6xl mb-4">{serviceInfo.icon}</div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                {serviceInfo.name}
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {serviceInfo.description}
              </p>
            </div>

            {/* 카운트다운 타이머 */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>예상 출시까지</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CountdownTimer
                  targetDate={launchDate}
                  size="md"
                  theme="gradient"
                  onComplete={() => {
                    console.log('서비스 출시!');
                    // 실제로는 페이지 리다이렉트나 알림 표시
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* 기능 소개 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* 주요 기능 */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span>주요 기능</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {serviceInfo.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 기대 효과 */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span>기대 효과</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {serviceInfo.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 현재 이용 가능한 서비스 추천 */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>지금 바로 이용해보세요!</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-blue-100">
                  새 서비스를 기다리는 동안, 현재 제공 중인 실시간 혼잡도 서비스를 이용해보세요!
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/realtime')}
                    className="flex items-center space-x-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>실시간 혼잡도 확인</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="flex items-center space-x-2 bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <Home className="w-4 h-4" />
                    <span>홈으로 돌아가기</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 알림 신청 */}
          <Card className="bg-white/80 backdrop-blur-sm text-center coming-soon-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <Bell className="w-5 h-5 text-orange-500 animate-notification-bell" />
                <span>출시 알림 받기</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                새 서비스가 출시되면 가장 먼저 알려드릴게요!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="이메일 주소를 입력하세요"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                />
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 transform transition-all duration-300 hover:scale-105"
                  onClick={() => {
                    // 실제로는 이메일 구독 로직
                    alert('알림 신청이 완료되었습니다! 🎉');
                  }}
                >
                  알림 신청
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * 이메일은 출시 알림 목적으로만 사용되며, 언제든 구독 해지할 수 있습니다.
              </p>
              
              {/* 구독자 수 표시 (예시) */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>이미 <strong className="text-blue-600">1,247명</strong>이 알림을 신청했습니다!</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 개발 진행 상황 */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">개발 진행 상황</h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6">
              <div className="space-y-6">
                <ProgressBar
                  progress={100}
                  label="기획 및 설계"
                  color="green"
                  size="md"
                  animated={false}
                />
                
                <ProgressBar
                  progress={75}
                  label="핵심 기능 개발"
                  color="blue"
                  size="md"
                  animated={true}
                />
                
                <ProgressBar
                  progress={25}
                  label="테스트 및 최적화"
                  color="orange"
                  size="md"
                  animated={false}
                />
                
                <ProgressBar
                  progress={0}
                  label="배포 및 출시"
                  color="purple"
                  size="md"
                  animated={false}
                />
              </div>
              
              {/* 전체 진행률 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <ProgressBar
                  progress={50}
                  label="전체 진행률"
                  color="blue"
                  size="lg"
                  animated={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">
            더 나은 서비스를 위해 열심히 개발하고 있습니다. 조금만 기다려주세요! 🙏
          </p>
          <p className="text-sm text-gray-500 mt-2">
            © 2025 서울 실시간 혼잡도 서비스. 서울시 공공데이터를 활용합니다.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ComingSoonPage;