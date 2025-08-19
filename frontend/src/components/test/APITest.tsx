import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Input,
  LoadingSpinner
} from '../ui';
import { 
  congestionService, 
  locationService, 
  nlpService, 
  systemService 
} from '../../services/congestionService';
import { APIError } from '../../types/api';

const APITest: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('홍대 혼잡도 어때?');

  const handleTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(testName);
    setErrors(prev => ({ ...prev, [testName]: '' }));
    
    try {
      const result = await testFn();
      setResults(prev => ({ ...prev, [testName]: result }));
    } catch (error) {
      const apiError = error as APIError;
      setErrors(prev => ({ 
        ...prev, 
        [testName]: apiError.message || '알 수 없는 오류가 발생했습니다.' 
      }));
    } finally {
      setLoading(null);
    }
  };

  const tests = [
    {
      name: 'healthCheck',
      title: '헬스체크',
      fn: () => systemService.healthCheck()
    },
    {
      name: 'congestionQuery',
      title: '혼잡도 조회',
      fn: () => congestionService.queryCongestion({ query, serviceType: 'realtime' })
    },
    {
      name: 'allLocations',
      title: '모든 장소 조회',
      fn: () => locationService.getAllLocations()
    },
    {
      name: 'searchLocations',
      title: '장소 검색',
      fn: () => locationService.searchLocations('강남')
    },
    {
      name: 'fuzzySearch',
      title: '퍼지 검색',
      fn: () => locationService.fuzzySearchLocations('홍대', 0.6)
    },
    {
      name: 'categories',
      title: '카테고리 조회',
      fn: () => locationService.getCategories()
    },
    {
      name: 'nlpQuery',
      title: 'NLP 처리',
      fn: () => nlpService.processQuery(query)
    },
    {
      name: 'intelligentSearch',
      title: '지능형 검색',
      fn: () => nlpService.intelligentSearch(query)
    },
    {
      name: 'congestionLevels',
      title: '혼잡도 레벨',
      fn: () => congestionService.getCongestionLevels()
    },
    {
      name: 'seoulAPIStatus',
      title: '서울시 API 상태',
      fn: () => systemService.checkSeoulAPIStatus()
    }
  ];

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center">API 통신 테스트</h1>
      
      {/* 쿼리 입력 */}
      <Card>
        <CardHeader>
          <CardTitle>테스트 쿼리 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="테스트할 쿼리를 입력하세요"
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* 테스트 버튼들 */}
      <Card>
        <CardHeader>
          <CardTitle>API 테스트</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tests.map((test) => (
              <Button
                key={test.name}
                onClick={() => handleTest(test.name, test.fn)}
                disabled={loading === test.name}
                variant="outline"
                className="h-auto py-3 flex flex-col items-center"
              >
                {loading === test.name ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <span className="text-sm font-medium">{test.title}</span>
                    <span className="text-xs text-gray-500">{test.name}</span>
                  </>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 결과 표시 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tests.map((test) => {
          const result = results[test.name];
          const error = errors[test.name];
          
          if (!result && !error) return null;

          return (
            <Card key={test.name}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{test.title}</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {error ? '실패' : '성공'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error ? (
                  <div className="text-red-600 text-sm">
                    <strong>에러:</strong> {error}
                  </div>
                ) : (
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-64">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 전체 테스트 실행 */}
      <Card>
        <CardHeader>
          <CardTitle>전체 테스트</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={async () => {
              for (const test of tests) {
                await handleTest(test.name, test.fn);
                // 각 테스트 사이에 약간의 지연
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            }}
            disabled={loading !== null}
            className="w-full"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                테스트 실행 중... ({loading})
              </>
            ) : (
              '모든 API 테스트 실행'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default APITest;