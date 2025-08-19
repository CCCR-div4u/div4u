import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CongestionBadge,
  Button
} from './ui';
import { Clock, MapPin, Trash2, RotateCcw } from 'lucide-react';
import { formatTimeAgo } from '../lib/utils';

// 히스토리 아이템 타입
interface CongestionHistoryItem {
  id: string;
  location: string;
  crowdLevel: string;
  message: string;
  timestamp: string;
  confidence?: number;
  searchQuery: string;
}

interface CongestionHistoryProps {
  onSelectHistory?: (item: CongestionHistoryItem) => void;
  className?: string;
}

const CongestionHistory: React.FC<CongestionHistoryProps> = ({
  onSelectHistory,
  className
}) => {
  const [history, setHistory] = useState<CongestionHistoryItem[]>([]);

  // 로컬 스토리지에서 히스토리 로드
  useEffect(() => {
    const savedHistory = localStorage.getItem('congestion-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
      } catch (error) {
        console.error('Failed to parse history:', error);
      }
    }
  }, []);

  // 히스토리 저장
  const saveHistory = (newHistory: CongestionHistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('congestion-history', JSON.stringify(newHistory));
  };

  // 히스토리 추가 (외부에서 호출)
  const addToHistory = (result: any, searchQuery: string) => {
    const newItem: CongestionHistoryItem = {
      id: Date.now().toString(),
      location: result.location,
      crowdLevel: result.crowdLevel,
      message: result.message,
      timestamp: result.timestamp,
      confidence: result.confidence,
      searchQuery
    };

    const newHistory = [
      newItem,
      ...history.filter(item => 
        item.location !== result.location || item.searchQuery !== searchQuery
      )
    ].slice(0, 10); // 최대 10개까지만 저장

    saveHistory(newHistory);
  };

  // 히스토리 삭제
  const removeFromHistory = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    saveHistory(newHistory);
  };

  // 전체 히스토리 삭제
  const clearHistory = () => {
    saveHistory([]);
  };

  // 외부에서 사용할 수 있도록 함수 노출
  React.useImperativeHandle(React.useRef(), () => ({
    addToHistory
  }));

  if (history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>검색 기록</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">아직 검색 기록이 없습니다.</p>
            <p className="text-xs mt-1">혼잡도를 검색하면 여기에 기록됩니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>검색 기록</span>
            <span className="text-sm text-gray-500">({history.length})</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-gray-500 hover:text-red-600"
            title="전체 삭제"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
              onClick={() => onSelectHistory?.(item)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="font-medium text-sm truncate">
                    {item.location}
                  </span>
                  <CongestionBadge level={item.crowdLevel} size="sm" />
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span className="truncate">"{item.searchQuery}"</span>
                  <span>•</span>
                  <span className="flex-shrink-0">{formatTimeAgo(item.timestamp)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectHistory?.(item);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  title="다시 보기"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  title="삭제"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// 히스토리 관리를 위한 커스텀 훅
export const useCongestionHistory = () => {
  const [history, setHistory] = useState<CongestionHistoryItem[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('congestion-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
      } catch (error) {
        console.error('Failed to parse history:', error);
      }
    }
  }, []);

  const addToHistory = (result: any, searchQuery: string) => {
    const newItem: CongestionHistoryItem = {
      id: Date.now().toString(),
      location: result.location,
      crowdLevel: result.crowdLevel,
      message: result.message,
      timestamp: result.timestamp,
      confidence: result.confidence,
      searchQuery
    };

    const newHistory = [
      newItem,
      ...history.filter(item => 
        item.location !== result.location || item.searchQuery !== searchQuery
      )
    ].slice(0, 10);

    setHistory(newHistory);
    localStorage.setItem('congestion-history', JSON.stringify(newHistory));
  };

  const removeFromHistory = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('congestion-history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('congestion-history');
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory
  };
};

export default CongestionHistory;