import React, { useEffect, useRef } from 'react';
import { Card, CardContent, Badge, Button } from './ui';
import { MapPin, RefreshCw, Share2, Search } from 'lucide-react';
import { ChatMessage } from '../types/api';
import { FORU_IMAGES, FORU_MESSAGES, getForuImageByCongestionLevel } from '../constants/foruImages';

interface ForuChatProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onRefresh?: (location: string) => void;
  onShare?: (message: ChatMessage) => void;
  onMoreInfo?: (location: string) => void;
}

export const ForuChat: React.FC<ForuChatProps> = ({
  messages,
  isLoading,
  onRefresh,
  onShare,
  onMoreInfo
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const getCongestionStyle = (congestionLevel?: string) => {
    const styles = {
      붐빔: "bg-red-50 border-red-200",
      "매우 붐빔": "bg-red-50 border-red-200",
      "약간 붐빔": "bg-orange-50 border-orange-200",
      보통: "bg-blue-50 border-blue-200",
      여유: "bg-green-50 border-green-200",
      정보없음: "bg-gray-50 border-gray-200",
    };
    return styles[congestionLevel as keyof typeof styles] || "bg-white border-orange-200";
  };

  const getCongestionBadgeStyle = (congestionLevel?: string) => {
    const styles = {
      붐빔: "bg-red-500 text-white",
      "매우 붐빔": "bg-red-500 text-white", 
      "약간 붐빔": "bg-orange-500 text-white",
      보통: "bg-blue-500 text-white",
      여유: "bg-green-500 text-white",
      정보없음: "bg-gray-500 text-white",
    };
    return styles[congestionLevel as keyof typeof styles] || "bg-orange-500 text-white";
  };

  return (
    <Card className="border-2 border-orange-200 shadow-lg h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-6">
          <img 
            src={FORU_IMAGES.main} 
            alt="포유" 
            className="w-8 h-8 object-contain"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-character.png';
            }}
          />
          <h2 className="text-xl font-bold text-amber-900">포유와의 대화</h2>
        </div>

        {/* 메시지 영역 - 스크롤 가능 */}
        <div className="flex-1 space-y-4 overflow-y-auto" style={{ minHeight: '500px', maxHeight: '70vh' }}>
          {messages.map((message) => (
            <div key={message.id}>
              {message.type === 'user' ? (
                <div className="flex justify-end mb-4">
                  <div className="max-w-[80%] p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                    <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  {/* 포유 캐릭터와 결과를 나란히 배치 */}
                  <div className="flex items-start gap-6">
                    {/* 포유 캐릭터 (왼쪽, 더 크게) */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full border-4 border-orange-300 shadow-xl flex items-center justify-center">
                        <img
                          src={getForuImageByCongestionLevel(message.congestionLevel || 'default')}
                          alt="포유"
                          className="w-24 h-24 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = FORU_IMAGES.default;
                          }}
                        />
                      </div>
                      
                      {/* 말풍선 */}
                      {message.location && (
                        <div className="bg-white rounded-2xl p-3 mt-4 border-2 border-orange-200 shadow-sm relative">
                          <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-l-2 border-t-2 border-orange-200 rotate-45"></div>
                          <p className="text-center text-xs text-gray-600">
                            다녀왔어요! 🐿️
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 결과 카드 (오른쪽) */}
                    <div className="flex-1">
                      <div className={`rounded-2xl border-2 shadow-lg overflow-hidden ${getCongestionStyle(message.congestionLevel)}`}>
                        {message.location && (
                          <div className="p-4 border-b border-orange-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-orange-600" />
                                <h3 className="text-lg font-bold text-gray-800">{message.location}</h3>
                              </div>
                              {message.congestionLevel && (
                                <Badge className={getCongestionBadgeStyle(message.congestionLevel)}>
                                  {message.congestionLevel}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="p-4">
                          {message.congestionLevel && message.location && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-3 h-3 rounded-full ${getCongestionBadgeStyle(message.congestionLevel).replace("text-white", "border-2 border-white")}`}></div>
                                <span className="font-bold text-gray-800">{message.congestionLevel}</span>
                              </div>
                              <p className="text-sm text-gray-600">{message.congestionMessage || "혼잡도 정보"}</p>
                            </div>
                          )}

                          <div className="mb-4">
                            <h4 className="font-bold text-gray-800 mb-2">포유의 한마디</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {message.content}
                            </p>
                          </div>

                          {/* 시간 정보는 실제 검색 결과가 있을 때만 표시 - 2개 박스 가로 배치, 버튼들은 오른쪽 세로 배치 */}
                          {message.location && (
                            <div className="flex items-start justify-between pt-3 border-t border-gray-200">
                              <div className="flex gap-2">
                                {/* 조회 시간 박스 */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                  <span className="text-xs text-blue-700">
                                    조회 시간: {new Date().toLocaleString('ko-KR', { 
                                      year: 'numeric', 
                                      month: '2-digit', 
                                      day: '2-digit', 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                </div>
                                
                                {/* 포유가 갔다온 시간 박스 */}
                                {message.updateTime && (
                                  <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                                    <span className="text-xs text-orange-700">
                                      포유가 갔다온 시간: {new Date(message.updateTime).toLocaleString('ko-KR', { 
                                        year: 'numeric', 
                                        month: '2-digit', 
                                        day: '2-digit', 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-1">
                                {message.location && onRefresh && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onRefresh(message.location!)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    새로고침
                                  </Button>
                                )}
                                {onShare && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onShare(message)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <Share2 className="w-3 h-3 mr-1" />
                                    공유
                                  </Button>
                                )}
                                {message.location && onMoreInfo && (
                                  <Button
                                    size="sm"
                                    onClick={() => onMoreInfo(message.location!)}
                                    className="h-6 px-2 text-xs bg-blue-500 hover:bg-blue-600 text-white"
                                  >
                                    <Search className="w-3 h-3 mr-1" />
                                    더 보기
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>


                </div>
              )}
            </div>
          ))}

          {/* 로딩 상태 */}
          {isLoading && (
            <div className="mb-6">
              <div className="flex items-start gap-6">
                {/* 포유 캐릭터 (왼쪽, 더 크게) */}
                <div className="flex-shrink-0 relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full border-4 border-orange-300 shadow-xl flex items-center justify-center">
                    <img
                      src={FORU_IMAGES.loading}
                      alt="포유가 달려가는 중"
                      className="w-24 h-24 object-contain animate-bounce"
                      onError={(e) => {
                        e.currentTarget.src = FORU_IMAGES.default;
                      }}
                    />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <span className="text-white text-sm">🐿️</span>
                  </div>
                </div>

                {/* 로딩 메시지 (오른쪽) */}
                <div className="flex-1">
                  <div className="bg-white rounded-2xl border-2 border-orange-200 p-6 shadow-lg">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <img
                          src={FORU_IMAGES.running}
                          alt="포유가 달려가는 중"
                          className="w-24 h-24 object-contain animate-bounce"
                          onError={(e) => {
                            e.currentTarget.src = FORU_IMAGES.default;
                          }}
                        />
                        <div className="absolute -right-3 -top-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-ping"></div>
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: "0.2s" }}></div>
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: "0.4s" }}></div>
                          </div>
                        </div>
                      </div>
                      <span className="text-base text-amber-700 text-center font-bold">
                        {FORU_MESSAGES.loading}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </CardContent>
    </Card>
  );
};