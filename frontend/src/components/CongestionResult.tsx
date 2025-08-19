import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CongestionBadge,
  CharacterGuide,
  Button
} from './ui';
import { Clock, MapPin, TrendingUp, RefreshCw, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';

// 혼잡도 결과 데이터 타입
interface CongestionResultData {
  location: string;
  crowdLevel: string;
  message: string;
  timestamp: string;
  updateTime?: string;
  confidence?: number;
  suggestions?: string[];
}

interface CongestionResultProps {
  result: CongestionResultData;
  onRefresh?: () => void;
  onShare?: () => void;
  onNewSearch?: () => void;
  className?: string;
}

const CongestionResult: React.FC<CongestionResultProps> = ({
  result,
  onRefresh,
  onShare,
  onNewSearch,
  className
}) => {
  // 혼잡도별 색상 및 아이콘 매핑
  const getCongestionInfo = (level: string) => {
    switch (level) {
      case '붐빔':
      case '매우붐빔':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: '🔴',
          description: '매우 혼잡한 상태입니다',
          recommendation: '다른 시간대나 장소를 고려해보세요'
        };
      case '약간 붐빔':
      case '조금붐빔':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: '🟠',
          description: '다소 혼잡한 상태입니다',
          recommendation: '조심해서 이동하시기 바랍니다'
        };
      case '보통':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: '🟡',
          description: '보통 수준의 혼잡도입니다',
          recommendation: '적당한 시간대입니다'
        };
      case '여유':
      case '한산함':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: '🟢',
          description: '여유로운 상태입니다',
          recommendation: '방문하기 좋은 시간입니다'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: '⚪',
          description: '혼잡도 정보를 확인할 수 없습니다',
          recommendation: '잠시 후 다시 시도해보세요'
        };
    }
  };

  const congestionInfo = getCongestionInfo(result.crowdLevel);
  const formattedTime = new Date(result.timestamp).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={cn('space-y-6', className)}>
      {/* 캐릭터와 메시지 */}
      <div className="text-center">
        <CharacterGuide
          congestionLevel={result.crowdLevel as any}
          location={result.location}
          message={result.message}
          size="lg"
          showMessage={true}
        />
      </div>

      {/* 메인 결과 카드 */}
      <Card className={cn(
        'border-2 transition-all duration-300',
        congestionInfo.borderColor,
        congestionInfo.bgColor
      )}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className={cn('w-5 h-5', congestionInfo.color)} />
              <span className="text-xl font-bold">{result.location}</span>
            </div>
            <CongestionBadge level={result.crowdLevel} size="lg" />
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 혼잡도 상세 정보 */}
          <div className={cn(
            'p-4 rounded-lg border',
            congestionInfo.bgColor,
            congestionInfo.borderColor
          )}>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{congestionInfo.icon}</span>
              <div className="flex-1">
                <h3 className={cn('font-semibold text-lg', congestionInfo.color)}>
                  {result.crowdLevel}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {congestionInfo.description}
                </p>
                <p className={cn('text-sm font-medium mt-2', congestionInfo.color)}>
                  💡 {congestionInfo.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* 상세 메시지 */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-2">📋 상세 정보</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {result.message}
            </p>
          </div>

          {/* 메타 정보 */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='flex items-center space-x-2 text-sm text-gray-600'>
              <Clock className='w-4 h-4' />
              <span>조회 시간: {formattedTime}</span>
            </div>

            {result.updateTime && (
              <div className='flex items-center space-x-2 text-sm text-gray-600'>
                <RefreshCw className='w-4 h-4' />
                <span>데이터 업데이트: {result.updateTime}</span>
              </div>
            )}
            
            {result.confidence && (
              <div className='flex items-center space-x-2 text-sm text-gray-600'>
                <TrendingUp className='w-4 h-4' />
                <span>신뢰도: {Math.round(result.confidence * 100)}%</span>
              </div>
            )}
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>새로고침</span>
              </Button>
            )}
            
            {onShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                className="flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>공유</span>
              </Button>
            )}
            
            {onNewSearch && (
              <Button
                variant="default"
                size="sm"
                onClick={onNewSearch}
                className="flex items-center space-x-2"
              >
                <MapPin className="w-4 h-4" />
                <span>다른 장소 검색</span>
              </Button>
            )}
          </div>

          {/* 추천 장소 (있는 경우) */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">🔍 유사한 장소</h4>
              <div className="flex flex-wrap gap-2">
                {result.suggestions.map((suggestion, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                  >
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 데이터 출처 안내 */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-full">
          <span>📊</span>
          <span>서울시 실시간 도시데이터 기반</span>
          <span>•</span>
          <span>매 5분마다 업데이트</span>
        </div>
      </div>
    </div>
  );
};

export default CongestionResult;