import React from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui';
import { Mail, Github, Globe, Database, MapPin, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FORU_IMAGES } from '../constants/foruImages';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Header />

      <div className="bg-gradient-to-r from-orange-100 to-amber-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 h-10 text-amber-700 hover:text-amber-900 hover:bg-amber-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            메인으로 돌아가기
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-amber-900 mb-4">About</h1>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto">
              서울 혼잡도 서비스와 포유에 대해 자세히 알아보세요
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* 프로젝트 정보 */}
        <Card className="border-orange-200 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100 pb-4 my-0 pt-4">
            <CardTitle className="text-2xl text-amber-900 flex items-center gap-2">
              <Globe className="w-6 h-6" />
              프로젝트 정보
            </CardTitle>
            <p className="text-amber-700">서울 혼잡도 모니터링 시스템에 대한 상세 정보</p>
          </CardHeader>
          <CardContent className="p-6 pt-4 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-amber-900 mb-3">프로젝트 개요</h3>
                <ul className="space-y-2 text-amber-700">
                  <li className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    서울시 주요 관광지 및 상업지구 120곳 모니터링
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    실시간 혼잡도 데이터 제공
                  </li>
                  <li className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    AI 기반 자연어 처리 시스템
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900 mb-3">개발자 정보</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-orange-500" />
                    <span className="text-amber-700">contact@div4u.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-orange-500" />
                    <span className="text-amber-700">github.com/div4u</span>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 border-orange-300">
                    개발 중 (Beta v2.0)
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 포유에 대해서 */}
        <Card className="border-orange-200 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100 pb-4 pt-6">
            <CardTitle className="text-2xl text-amber-900 flex items-center gap-2">🐿️ 포유에 대해서</CardTitle>
            <p className="text-amber-700">우리의 귀여운 마스코트 포유를 소개합니다</p>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <div className="grid md:grid-cols-3 gap-6 items-center">
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl p-6 flex items-center justify-center">
                  <img
                    src={FORU_IMAGES.main}
                    alt="포유 캐릭터"
                    className="w-32 h-32 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-character.png';
                    }}
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-xl font-semibold text-amber-900">안녕하세요! 저는 포유예요 🐿️</h3>
                <div className="space-y-3 text-amber-700">
                  <p>
                    <strong className="text-amber-900">이름:</strong> 포유 (4u)
                  </p>
                  <p>
                    <strong className="text-amber-900">역할:</strong> 서울 주요 도시 혼잡도 확인
                  </p>
                  <p>
                    <strong className="text-amber-900">특징:</strong>
                    항상 밝고 긍정적이며, 꼼꼼한 성격을 가지고 있어요. 사용자가 특정 도시의 혼잡도를 물어보면 
                    얼른 날아가서 현재 혼잡도를 확인하고 온답니다.
                  </p>
                  <p>
                    <strong className="text-amber-900">좋아하는 것:</strong>
                    도토리, 깨끗한 데이터, 그리고 사람들
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-orange-500 text-white">친근함</Badge>
                  <Badge className="bg-amber-500 text-white">정확성</Badge>
                  <Badge className="bg-yellow-500 text-white">신뢰성</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 사용 API */}
        <Card className="border-orange-200 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100 pb-4 pt-6">
            <CardTitle className="text-2xl text-amber-900 flex items-center gap-2">
              <Database className="w-6 h-6" />
              사용 API 및 데이터 소스
            </CardTitle>
            <p className="text-amber-700">정확한 혼잡도 정보 제공을 위한 데이터 소스들</p>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-900">주요 데이터 소스</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-medium text-amber-900">서울시 실시간 도시데이터 API</h4>
                    <p className="text-sm text-amber-700 mt-1">실시간 인구 밀도 및 혼잡도 데이터</p>
                    <Badge className="mt-2 bg-orange-100 text-orange-700 border-orange-300">
                      공공데이터
                    </Badge>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-medium text-amber-900">자연어 처리 시스템</h4>
                    <p className="text-sm text-amber-700 mt-1">사용자 질의 이해 및 장소 매칭</p>
                    <Badge className="mt-2 bg-amber-100 text-amber-700 border-amber-300">
                      AI/NLP
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-900">기술 스택</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-amber-900">실시간 데이터 처리</h4>
                    <p className="text-sm text-amber-700 mt-1">5분마다 최신 혼잡도 정보 업데이트</p>
                    <Badge className="mt-2 bg-yellow-100 text-yellow-700 border-yellow-300">
                      실시간
                    </Badge>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-medium text-amber-900">스마트 추천 시스템</h4>
                    <p className="text-sm text-amber-700 mt-1">키워드 기반 관련 장소 추천</p>
                    <Badge className="mt-2 bg-orange-100 text-orange-700 border-orange-300">
                      추천
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg">
              <p className="text-sm text-amber-700 text-center">
                <strong>업데이트 주기:</strong> 실시간 (5분마다 갱신) | <strong> 데이터 정확도:</strong> 95% 이상 | 
                <strong> 서비스 지역:</strong> 서울시 전체 120개 지점
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center py-8">
          <Button
            size="lg"
            onClick={() => navigate('/services')}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3 text-lg"
          >
            실시간 혼잡도 확인하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;