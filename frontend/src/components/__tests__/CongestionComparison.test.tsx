import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CongestionComparison from '../CongestionComparison';
import { congestionService } from '../../services/congestionService';
import { comparisonApiService } from '../../services/comparisonApiService';

// 서비스 모킹
jest.mock('../../services/congestionService');
jest.mock('../../services/comparisonApiService');

const mockedCongestionService = congestionService as jest.Mocked<typeof congestionService>;
const mockedComparisonApiService = comparisonApiService as jest.Mocked<typeof comparisonApiService>;

describe('CongestionComparison', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 기본 모킹 설정
    mockedComparisonApiService.checkHealth.mockResolvedValue({
      success: true,
      data: { status: 'healthy', timestamp: '2025-08-16T18:00:00.000Z' }
    });
  });

  it('should render without crashing', () => {
    render(<CongestionComparison />);
    expect(screen.getByText('혼잡도 비교')).toBeInTheDocument();
  });

  it('should add a new location successfully', async () => {
    const user = userEvent.setup();
    
    // Mock congestion service response
    mockedCongestionService.queryCongestion.mockResolvedValue({
      location: '홍대 관광특구',
      crowdLevel: '여유',
      message: '여유로움',
      timestamp: '2025-08-16T18:00:00.000Z',
      updateTime: '2025-08-17 02:55',
      success: true,
      confidence: 1,
      suggestions: [],
      recommendations: []
    });

    render(<CongestionComparison />);
    
    const input = screen.getByPlaceholderText(/장소를 입력하세요/i);
    const addButton = screen.getByText('추가');

    await user.type(input, '홍대');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('홍대 관광특구')).toBeInTheDocument();
      expect(screen.getByText('여유')).toBeInTheDocument();
    });

    expect(mockedCongestionService.queryCongestion).toHaveBeenCalledWith({
      query: '홍대',
      serviceType: 'realtime'
    });
  });

  it('should prevent duplicate locations', async () => {
    const user = userEvent.setup();
    
    mockedCongestionService.queryCongestion.mockResolvedValue({
      location: '홍대 관광특구',
      crowdLevel: '여유',
      message: '여유로움',
      timestamp: '2025-08-16T18:00:00.000Z',
      updateTime: '2025-08-17 02:55',
      success: true,
      confidence: 1,
      suggestions: [],
      recommendations: []
    });

    // Mock window.alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<CongestionComparison />);
    
    const input = screen.getByPlaceholderText(/장소를 입력하세요/i);
    const addButton = screen.getByText('추가');

    // 첫 번째 추가
    await user.type(input, '홍대');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('홍대 관광특구')).toBeInTheDocument();
    });

    // 두 번째 추가 시도 (중복)
    await user.clear(input);
    await user.type(input, '홍대');
    await user.click(addButton);

    expect(alertSpy).toHaveBeenCalledWith('"홍대"은(는) 이미 추가된 장소입니다.');
    
    alertSpy.mockRestore();
  });

  it('should perform comparison when 2 or more locations are added', async () => {
    const user = userEvent.setup();
    
    // Mock responses
    mockedCongestionService.queryCongestion
      .mockResolvedValueOnce({
        location: '홍대 관광특구',
        crowdLevel: '여유',
        message: '여유로움',
        timestamp: '2025-08-16T18:00:00.000Z',
        updateTime: '2025-08-17 02:55',
        success: true,
        confidence: 1,
        suggestions: [],
        recommendations: []
      })
      .mockResolvedValueOnce({
        location: '명동 관광특구',
        crowdLevel: '보통',
        message: '보통',
        timestamp: '2025-08-16T18:00:00.000Z',
        updateTime: '2025-08-17 02:55',
        success: true,
        confidence: 1,
        suggestions: [],
        recommendations: []
      });

    mockedComparisonApiService.compareLocations.mockResolvedValue({
      success: true,
      data: {
        comparisons: [
          {
            location: '홍대 관광특구',
            displayName: '홍대 관광특구 일대',
            crowdLevel: '여유',
            message: '여유로움',
            timestamp: '2025-08-16T18:00:00.000Z',
            rank: 1
          },
          {
            location: '명동 관광특구',
            displayName: '명동 관광특구 일대',
            crowdLevel: '보통',
            message: '보통',
            timestamp: '2025-08-16T18:00:00.000Z',
            rank: 2
          }
        ],
        analysis: {
          mostCrowded: { location: '명동 관광특구', crowdLevel: '보통' },
          leastCrowded: { location: '홍대 관광특구', crowdLevel: '여유' },
          averageCrowdLevel: { level: '보통', score: 1.5 },
          recommendation: {
            bestChoice: '홍대 관광특구',
            reason: '가장 여유로운 곳입니다',
            alternativeOptions: ['명동 관광특구']
          },
          statistics: {
            totalLocations: 2,
            crowdLevelDistribution: { 여유: 1, 보통: 1, 약간붐빔: 0, 붐빔: 0 }
          }
        }
      }
    });

    render(<CongestionComparison />);
    
    const input = screen.getByPlaceholderText(/장소를 입력하세요/i);
    const addButton = screen.getByText('추가');

    // 첫 번째 장소 추가
    await user.type(input, '홍대');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('홍대 관광특구')).toBeInTheDocument();
    });

    // 두 번째 장소 추가
    await user.clear(input);
    await user.type(input, '명동');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('명동 관광특구')).toBeInTheDocument();
    });

    // 비교 분석이 실행되어야 함
    await waitFor(() => {
      expect(mockedComparisonApiService.compareLocations).toHaveBeenCalledWith({
        locations: ['홍대 관광특구', '명동 관광특구'],
        options: {
          includeRecommendation: true,
          sortBy: 'crowdLevel'
        }
      });
    }, { timeout: 3000 });
  });

  it('should remove locations when delete button is clicked', async () => {
    const user = userEvent.setup();
    
    mockedCongestionService.queryCongestion.mockResolvedValue({
      location: '홍대 관광특구',
      crowdLevel: '여유',
      message: '여유로움',
      timestamp: '2025-08-16T18:00:00.000Z',
      updateTime: '2025-08-17 02:55',
      success: true,
      confidence: 1,
      suggestions: [],
      recommendations: []
    });

    render(<CongestionComparison />);
    
    const input = screen.getByPlaceholderText(/장소를 입력하세요/i);
    const addButton = screen.getByText('추가');

    await user.type(input, '홍대');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('홍대 관광특구')).toBeInTheDocument();
    });

    // 삭제 버튼 클릭
    const deleteButton = screen.getByLabelText(/삭제/i);
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('홍대 관광특구')).not.toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();
    
    mockedCongestionService.queryCongestion.mockRejectedValue(new Error('API Error'));

    render(<CongestionComparison />);
    
    const input = screen.getByPlaceholderText(/장소를 입력하세요/i);
    const addButton = screen.getByText('추가');

    await user.type(input, '홍대');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('조회 실패')).toBeInTheDocument();
    });
  });

  it('should display loading state while fetching data', async () => {
    const user = userEvent.setup();
    
    // Mock delayed response
    mockedCongestionService.queryCongestion.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        location: '홍대 관광특구',
        crowdLevel: '여유',
        message: '여유로움',
        timestamp: '2025-08-16T18:00:00.000Z',
        updateTime: '2025-08-17 02:55',
        success: true,
        confidence: 1,
        suggestions: [],
        recommendations: []
      }), 100))
    );

    render(<CongestionComparison />);
    
    const input = screen.getByPlaceholderText(/장소를 입력하세요/i);
    const addButton = screen.getByText('추가');

    await user.type(input, '홍대');
    await user.click(addButton);

    // 로딩 상태 확인
    expect(screen.getByText('조회 중...')).toBeInTheDocument();

    // 로딩 완료 후 결과 확인
    await waitFor(() => {
      expect(screen.getByText('홍대 관광특구')).toBeInTheDocument();
      expect(screen.queryByText('조회 중...')).not.toBeInTheDocument();
    });
  });
});