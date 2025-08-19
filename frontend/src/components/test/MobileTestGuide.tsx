import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent
} from '../ui';
import { useScreenSize } from '../ResponsiveLayout';
import { Smartphone, Wifi, Globe, CheckCircle, AlertCircle, Copy } from 'lucide-react';

const MobileTestGuide: React.FC = () => {
  const screenSize = useScreenSize();
  const [localIP, setLocalIP] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // 로컬 IP 추정 (WebRTC 사용)
  useEffect(() => {
    const getLocalIP = async () => {
      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        
        pc.createDataChannel('');
        await pc.createOffer().then(offer => pc.setLocalDescription(offer));
        
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate;
            const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
            if (ipMatch && ipMatch[1] !== '127.0.0.1') {
              setLocalIP(ipMatch[1]);
              pc.close();
            }
          }
        };
      } catch (error) {
        console.log('IP detection failed:', error);
        setLocalIP('IP 자동 감지 실패');
      }
    };

    getLocalIP();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const testUrls = [
    { name: '홈페이지', path: '/' },
    { name: '실시간 혼잡도', path: '/realtime' },
    { name: '반응형 테스트', path: '/responsive-test' },
    { name: '캐릭터 테스트', path: '/advanced-character-test' },
    { name: '애니메이션 테스트', path: '/animation-sequence-test' }
  ];

  const getCurrentDevice = () => {
    if (screenSize.isMobile) return { type: '모바일', icon: '📱', color: 'text-green-600' };
    if (screenSize.isTablet) return { type: '태블릿', icon: '📟', color: 'text-blue-600' };
    return { type: '데스크톱', icon: '🖥️', color: 'text-purple-600' };
  };

  const device = getCurrentDevice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📱 모바일 테스트 가이드
          </h1>
          <p className="text-gray-600">
            같은 와이파이를 사용하는 모바일 기기에서 반응형 디자인을 테스트하세요
          </p>
        </div>

        {/* 현재 접속 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>현재 접속 정보</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">현재 디바이스</div>
                <div className={`text-lg font-bold ${device.color} flex items-center space-x-2`}>
                  <span>{device.icon}</span>
                  <span>{device.type}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">화면 크기</div>
                <div className="text-lg font-bold">
                  {screenSize.width} × {screenSize.height}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">터치 지원</div>
                <div className="flex items-center space-x-2">
                  {screenSize.isTouch ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 font-medium">지원됨</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-orange-600 font-medium">미지원</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">방향</div>
                <div className="font-bold">
                  {screenSize.orientation === 'portrait' ? '📱 세로' : '📟 가로'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 모바일 접속 방법 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5" />
              <span>모바일에서 접속하는 방법</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">📋 단계별 가이드</h3>
              <ol className="text-sm text-blue-700 space-y-2">
                <li><strong>1단계:</strong> PC에서 개발 서버가 실행 중인지 확인</li>
                <li><strong>2단계:</strong> PC와 모바일이 같은 와이파이에 연결되어 있는지 확인</li>
                <li><strong>3단계:</strong> 아래 IP 주소를 모바일 브라우저에 입력</li>
                <li><strong>4단계:</strong> 반응형 디자인이 제대로 작동하는지 확인</li>
              </ol>
            </div>

            {/* IP 주소 정보 */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-600">모바일에서 접속할 주소:</div>
              
              {localIP && localIP !== 'IP 자동 감지 실패' ? (
                <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
                  <code className="text-lg font-mono text-blue-600">
                    http://{localIP}:5174
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(`http://${localIP}:5174`)}
                    className="ml-2"
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              ) : (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ IP 자동 감지에 실패했습니다. 수동으로 확인해주세요:
                  </p>
                  <div className="mt-2 text-xs text-yellow-700">
                    <p><strong>Windows:</strong> 명령 프롬프트에서 <code>ipconfig</code></p>
                    <p><strong>Mac/Linux:</strong> 터미널에서 <code>ifconfig</code></p>
                  </div>
                </div>
              )}
            </div>

            {/* 대체 방법 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">🔧 대체 방법</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• <strong>localhost:</strong> http://localhost:5174 (PC에서만 접근 가능)</p>
                <p>• <strong>127.0.0.1:</strong> http://127.0.0.1:5174 (PC에서만 접근 가능)</p>
                <p>• <strong>네트워크 IP:</strong> 위의 감지된 IP 주소 사용</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 테스트 페이지 링크 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wifi className="w-5 h-5" />
              <span>테스트 페이지 바로가기</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {testUrls.map((url) => (
                <Button
                  key={url.path}
                  variant="outline"
                  onClick={() => window.open(url.path, '_blank')}
                  className="h-auto py-3 flex flex-col items-center space-y-1"
                >
                  <span className="font-medium">{url.name}</span>
                  <code className="text-xs text-gray-500">{url.path}</code>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 개발 서버 실행 명령어 */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 개발 서버 실행 명령어</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">프론트엔드 서버:</h4>
              <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                cd Service/frontend<br/>
                npm run dev
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">백엔드 서버:</h4>
              <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm">
                cd Service/backend<br/>
                npm run dev
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-blue-800 text-sm">
                💡 <strong>팁:</strong> 두 서버 모두 실행되어야 모든 기능이 정상 작동합니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 문제 해결 */}
        <Card>
          <CardHeader>
            <CardTitle>🔧 문제 해결</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium text-red-600">❌ 모바일에서 접속이 안 될 때:</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• PC와 모바일이 같은 와이파이에 연결되어 있는지 확인</li>
                <li>• PC의 방화벽이 5174 포트를 차단하고 있는지 확인</li>
                <li>• 개발 서버가 0.0.0.0:5174에서 실행되고 있는지 확인</li>
                <li>• 라우터가 기기 간 통신을 차단하고 있는지 확인</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">✅ 정상 작동 확인 방법:</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• 모바일에서 하단 네비게이션이 표시되는지 확인</li>
                <li>• 터치 버튼이 44px 이상의 크기로 표시되는지 확인</li>
                <li>• 세로/가로 모드 전환이 자연스러운지 확인</li>
                <li>• 캐릭터 애니메이션이 부드럽게 작동하는지 확인</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileTestGuide;