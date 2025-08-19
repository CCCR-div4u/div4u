import React from 'react';
import CongestionComparison from '../components/CongestionComparison';
import Header from '../components/Header';

const ComparisonPage: React.FC = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Header />

      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-amber-900 mb-4">
              📊 혼잡도 비교 서비스
            </h2>
            <p className="text-lg text-amber-700 mb-2">
              여러 장소의 혼잡도를 동시에 비교하고 최적의 선택지를 찾아보세요.
            </p>
            <p className="text-sm text-amber-600">
              향상된 분석 서비스로 더욱 정확하고 빠른 분석을 제공합니다.
            </p>
          </div>

          {/* 2열 그리드 레이아웃 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 비교 컴포넌트 */}
            <CongestionComparison />
          </div>
        </div>

        {/* 사용 가이드 */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-orange-200">
            <h3 className="text-lg font-semibold text-amber-900 mb-4">
              🔍 사용 방법
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-amber-700">
              <div>
                <h4 className="font-medium text-amber-900 mb-2">1. 장소 추가</h4>
                <p>비교하고 싶은 장소를 입력창에 입력하고 추가 버튼을 클릭하세요.</p>
              </div>
              <div>
                <h4 className="font-medium text-amber-900 mb-2">2. 자동 비교</h4>
                <p>2개 이상의 장소가 추가되면 자동으로 비교 분석이 실행됩니다.</p>
              </div>
              <div>
                <h4 className="font-medium text-amber-900 mb-2">3. 서비스 선택</h4>
                <p>새로운 MSA 서비스와 기존 방식 중 선택할 수 있습니다.</p>
              </div>
              <div>
                <h4 className="font-medium text-amber-900 mb-2">4. 결과 확인</h4>
                <p>혼잡도 분포, 추천 장소, 대안 옵션을 확인하세요.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 기능 소개 */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6 border-2 border-orange-200">
            <h3 className="text-lg font-semibold text-amber-900 mb-4">
              ✨ 새로운 기능
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <div className="text-orange-600 font-medium mb-2">🚀 고성능 분석</div>
                <p className="text-amber-700">병렬 처리와 캐싱으로 빠른 응답 속도</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <div className="text-amber-600 font-medium mb-2">📊 상세한 통계</div>
                <p className="text-amber-700">혼잡도 분포와 평균 점수 제공</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <div className="text-orange-700 font-medium mb-2">💡 스마트 추천</div>
                <p className="text-amber-700">시간대 고려한 최적 선택지와 대안 제안</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage;