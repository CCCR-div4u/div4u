import React from 'react';
import { Button } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import { FORU_IMAGES } from '../constants/foruImages';
import Header from '../components/Header';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Header />
      <section className="flex items-center justify-center px-4 py-16">
        <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4 drop-shadow-sm">서울 실시간 혼잡도</h1>

        <p className="text-xl text-amber-800 mb-12 max-w-2xl mx-auto">
          서울 주요 120곳의 실시간 혼잡도를 확인하고
          <br />더 편리한 이동 계획을 세워보세요
        </p>

        <div className="relative mb-12">
          <div className="h-80 mx-auto bg-gradient-to-r from-amber-200 via-orange-200 to-yellow-200 rounded-full flex items-center justify-center relative overflow-hidden shadow-2xl border-4 border-orange-300/30 w-10/12">
            {/* Character image - 포유를 중앙에 크게 배치 */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <img
                src={FORU_IMAGES.main}
                alt="포유 캐릭터"
                className="w-48 h-48 object-contain drop-shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-character.png';
                }}
              />
            </div>
            {/* Text content - 포유 주변에 배치 */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center z-10">
              <p className="text-2xl font-bold text-amber-900 leading-tight drop-shadow-sm">
                실시간 혼잡도가 궁금하다면
              </p>
            </div>
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center z-10">
              <p className="text-2xl font-bold text-amber-900 leading-tight drop-shadow-sm">
                <span className="text-orange-700 text-3xl font-extrabold">"포유"</span>에게 물어보세요!
              </p>
            </div>
            {/* 포유 주변 장식 효과 */}
            <div className="absolute top-16 right-16 w-4 h-4 bg-orange-400 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute bottom-20 left-12 w-3 h-3 bg-yellow-400 rounded-full opacity-70 animate-pulse delay-300"></div>
            <div className="absolute top-24 left-20 w-2 h-2 bg-amber-400 rounded-full opacity-50 animate-pulse delay-700"></div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          size="lg"
          onClick={() => navigate('/services')}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-10 py-5 text-xl font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-orange-400 mb-16"
        >
          🐿️ 포유와 함께 혼잡도 확인하기
        </Button>

        {/* 서비스 특징 (120개 주요 지점 포함) */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 mb-16 shadow-lg border border-orange-200/50">
          <h3 className="text-2xl font-bold text-center text-amber-900 mb-8">
            서비스 특징
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
            <div 
              className="text-center cursor-pointer group"
              onClick={() => navigate('/locations')}
            >
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-125 group-hover:bg-orange-200 transition-all duration-300 group-hover:shadow-lg">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">📍</span>
              </div>
              <h4 className="font-semibold text-amber-900 mb-2 group-hover:text-orange-800 transition-colors duration-200">120개 주요 지점</h4>
              <p className="text-sm text-amber-700 group-hover:text-orange-700 transition-colors duration-200">
                지하철역, 관광지, 상업지구 등 서울 전역
              </p>
              
              {/* 호버 시 나타나는 툴팁 */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
                <div className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full inline-block">
                  클릭해서 전체 목록 보기 →
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">🤖</span>
              </div>
              <h4 className="font-semibold text-amber-900 mb-2">쉬운 문장 검색</h4>
              <p className="text-sm text-amber-700">
                "홍대 혼잡도 어때?"처럼 일상 언어로 물어보세요
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold text-amber-900 mb-2">실시간 데이터</h4>
              <p className="text-sm text-amber-700">
                서울시 공공 API 기반 실시간 혼잡도 정보
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">📱</span>
              </div>
              <h4 className="font-semibold text-amber-900 mb-2">반응형 디자인</h4>
              <p className="text-sm text-amber-700">
                PC와 모바일에서 모두 편리하게 이용 가능
              </p>
            </div>
          </div>
        </div>


        </div>
      </section>
    </div>
  );
};

export default HomePage;