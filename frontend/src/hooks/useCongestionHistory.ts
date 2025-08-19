import { useState, useEffect } from 'react';

export interface CongestionHistoryItem {
  id: string;
  location: string;
  crowdLevel: string;
  message: string;
  timestamp: string;
  updateTime?: string;
  confidence?: number;
  query: string;
}

const STORAGE_KEY = 'congestion-history';
const MAX_HISTORY_ITEMS = 10;

export const useCongestionHistory = () => {
  const [history, setHistory] = useState<CongestionHistoryItem[]>([]);

  // 로컬 스토리지에서 히스토리 로드
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Failed to load congestion history:', error);
    }
  }, []);

  // 히스토리에 새 항목 추가
  const addToHistory = (
    result: {
      location: string;
      crowdLevel: string;
      message: string;
      timestamp: string;
      updateTime?: string;
      confidence?: number;
    },
    query: string
  ) => {
    const newItem: CongestionHistoryItem = {
      id: Date.now().toString(),
      ...result,
      query
    };

    setHistory(prevHistory => {
      // 중복 제거 (같은 장소의 최근 검색만 유지)
      const filteredHistory = prevHistory.filter(
        item => item.location !== result.location
      );

      // 새 항목을 맨 앞에 추가하고 최대 개수 제한
      const newHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);

      // 로컬 스토리지에 저장
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Failed to save congestion history:', error);
      }

      return newHistory;
    });
  };

  // 히스토리 삭제
  const removeFromHistory = (id: string) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item.id !== id);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Failed to save congestion history:', error);
      }

      return newHistory;
    });
  };

  // 히스토리 전체 삭제
  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear congestion history:', error);
    }
  };

  // 특정 장소의 최근 검색 결과 가져오기
  const getLatestForLocation = (location: string): CongestionHistoryItem | undefined => {
    return history.find(item => item.location === location);
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getLatestForLocation
  };
};