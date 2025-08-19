import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import { ArrowLeft, Home } from 'lucide-react';
import { FORU_IMAGES } from '../constants/foruImages';
import Header from '../components/Header';

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: 'realtime',
      title: '실시간 혼잡도',
      icon: '📍',
      description: '포유가 직접 다녀와서 현재 혼잡도를 알려드려요',
      available: true,
      path: '/realtime',
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      id: 'prediction',
      title: '혼잡도 예측',
      icon: '🔮',
      description: '미래 혼잡도를 예측해드려요 (준비 중)',
      available: false,
      path: '/prediction',
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      id: 'comparison',
      title: '혼잡도 비교',
      icon: '📊',
      description: '여러 장소를 동시에 비교하고 최적의 선택지를 찾아보세요',
      available: true,
      path: '/comparison',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      id: 'other',
      title: '기타 서비스',
      icon: '⚙️',
      description: '추가 서비스들 (준비 중)',
      available: false,
      path: '/other',
      gradient: 'from-gray-500 to-slate-500'
    }
  ];

  const handleServiceClick = (service: typeof services[0]) => {
    if (service.available) {
      navigate(service.path);
    } else {
      // 준비 중인 서비스 클릭 시 알림
      alert(`${service.title}은 현재 준비 중입니다. 조금만 기다려주세요! 🐿️`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Header />

      <div className="container mx-auto px-4 py-16">
        {/* 포유 캐릭터와 인사말 */}
        <div className="text-center mb-16">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full border-4 border-orange-300 shadow-xl flex items-center justify-center mx-auto">
              <img
                src={FORU_IMAGES.main}
                alt="포유 캐릭터"
                className="w-24 h-24 object-contain drop-shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-character.png';
                }}
              />
            </div>

          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">
            어떤 서비스를 이용하시겠어요?
          </h1>
          <p className="text-lg text-amber-700 mb-8">
            포유가 도와드릴 수 있는 서비스를 선택해주세요! 🐿️
          </p>
        </div>

        {/* 서비스 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`relative group cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                service.available ? 'hover:shadow-2xl' : 'opacity-75'
              }`}
              onClick={() => handleServiceClick(service)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-white rounded-2xl border-2 border-orange-200 shadow-lg overflow-hidden h-48">
                {/* 상단 그라데이션 */}
                <div className={`h-2 bg-gradient-to-r ${service.gradient}`}></div>
                
                <div className="p-6 h-full flex flex-col">
                  {/* 아이콘과 제목 */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{service.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{service.title}</h3>
                      {!service.available && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          준비 중
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 설명 */}
                  <p className="text-gray-600 flex-1">{service.description}</p>

                  {/* 하단 버튼 영역 */}
                  <div className="mt-4">
                    <Button
                      className={`w-full ${
                        service.available
                          ? `bg-gradient-to-r ${service.gradient} hover:opacity-90 text-white`
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!service.available}
                    >
                      {service.available ? '시작하기' : '준비 중'}
                    </Button>
                  </div>
                </div>

                {/* 호버 효과 */}
                {service.available && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 하단 안내 */}
        <div className="text-center mt-16">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-orange-200">
            <p className="text-amber-800 mb-2">
              <span className="font-bold">💡 팁:</span> 실시간 혼잡도 서비스에서는
            </p>
            <p className="text-sm text-amber-700">
              "강남역 혼잡해?" "홍대 사람 많아?" 같은 자연스러운 질문으로 혼잡도를 확인할 수 있어요!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;