import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent } from '../components/ui';
import { ArrowLeft, Home, Settings, TestTube, Smartphone, Code, Activity } from 'lucide-react';
import Header from '../components/Header';

const DevToolsPage: React.FC = () => {
  const navigate = useNavigate();

  const devTools = [
    {
      id: 'api-test',
      title: 'API 테스트',
      icon: <Code className="w-6 h-6" />,
      description: 'API 엔드포인트 테스트 및 응답 확인',
      path: '/dev-tools/api-test',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'nlp-test',
      title: 'NLP 테스트',
      icon: <TestTube className="w-6 h-6" />,
      description: '자연어 처리 로직 테스트',
      path: '/dev-tools/nlp-test',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'mobile-test',
      title: '모바일 테스트',
      icon: <Smartphone className="w-6 h-6" />,
      description: '모바일 환경 테스트 가이드',
      path: '/dev-tools/mobile-test',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'component-test',
      title: '컴포넌트 테스트',
      icon: <Settings className="w-6 h-6" />,
      description: 'UI 컴포넌트 테스트',
      path: '/dev-tools/component-test',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'character-test',
      title: '캐릭터 테스트',
      icon: <Activity className="w-6 h-6" />,
      description: '포유 캐릭터 애니메이션 테스트',
      path: '/dev-tools/character-test',
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'congestion-test',
      title: '혼잡도 테스트',
      icon: <TestTube className="w-6 h-6" />,
      description: '혼잡도 데이터 및 로직 테스트',
      path: '/dev-tools/congestion-test',
      color: 'from-red-500 to-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로
          </Button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-2xl font-bold text-gray-800">개발자 도구</h1>
          <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
            DEV ONLY
          </div>
        </div>

        {/* 경고 메시지 */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-800">개발자 전용 도구</h3>
          </div>
          <p className="text-sm text-amber-700">
            이 페이지는 개발 및 테스트 목적으로만 사용됩니다. 
            프로덕션 환경에서는 접근할 수 없습니다.
          </p>
        </div>

        {/* 도구 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devTools.map((tool, index) => (
            <Card
              key={tool.id}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-gray-200 hover:border-gray-300"
              onClick={() => navigate(tool.path)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                {/* 아이콘과 제목 */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${tool.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-gray-900">
                      {tool.title}
                    </h3>
                  </div>
                </div>

                {/* 설명 */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {tool.description}
                </p>

                {/* 호버 효과 */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="sm"
                    className={`w-full bg-gradient-to-r ${tool.color} hover:opacity-90 text-white`}
                  >
                    테스트 시작
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 하단 정보 */}
        <div className="mt-12 text-center">
          <div className="bg-gray-100 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-gray-800 mb-2">접근 방법</h3>
            <p className="text-sm text-gray-600 mb-4">
              이 페이지는 다음 URL로 직접 접근할 수 있습니다:
            </p>
            <div className="bg-white rounded border px-3 py-2 font-mono text-sm text-gray-700">
              http://localhost:5174/dev-tools
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevToolsPage;