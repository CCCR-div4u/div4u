import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { nlpService } from '../services/congestionService';
import { NLPResult, IntelligentSearchResult, KeywordExtractionResult } from '../types';

const NLPTester: React.FC = () => {
  const [query, setQuery] = useState('');
  const [nlpResult, setNlpResult] = useState<NLPResult | null>(null);
  const [intelligentResult, setIntelligentResult] = useState<IntelligentSearchResult | null>(null);
  const [keywordResult, setKeywordResult] = useState<KeywordExtractionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 예시 질문들
  const exampleQueries = [
    "강남역 혼잡도 어떻게 돼?",
    "홍대 지금 사람 많아?",
    "명동 실시간 붐빔 정도 알려줘",
    "남산공원 내일 혼잡할까?",
    "이태원 요즘 어떤지 궁금해",
    "경복궁 주변 여유로운 곳 있어?",
    "한강공원에서 산책하기 좋은 시간은?",
    "동대문 쇼핑하러 가려는데 붐빌까?"
  ];

  const handleTest = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError('');

      // 병렬로 모든 NLP API 호출
      const [nlp, intelligent, keywords] = await Promise.all([
        nlpService.processQuery(query),
        nlpService.intelligentSearch(query),
        nlpService.extractKeywords(query)
      ]);

      setNlpResult(nlp);
      setIntelligentResult(intelligent);
      setKeywordResult(keywords);
    } catch (err) {
      setError('NLP 처리 중 오류가 발생했습니다.');
      console.error('NLP test error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTest();
    }
  };

  const getIntentBadgeColor = (intentType: string) => {
    switch (intentType) {
      case 'realtime': return 'bg-green-100 text-green-800';
      case 'prediction': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 0.7) return 'bg-green-100 text-green-800';
    if (confidence >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          자연어 처리 (NLP) 테스터
        </h1>
        <p className="text-gray-600">
          자연어 질의를 입력하여 NLP 시스템의 성능을 테스트해보세요.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* 입력 섹션 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>자연어 질의 입력</CardTitle>
          <CardDescription>
            혼잡도나 장소에 관한 자연스러운 질문을 입력해보세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="예: 강남역 지금 혼잡도 어떻게 돼?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleTest} disabled={loading || !query.trim()}>
              {loading ? '분석 중...' : 'NLP 분석'}
            </Button>
          </div>

          {/* 예시 질문들 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">예시 질문:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleExampleClick(example)}
                  className="text-xs"
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 결과 섹션 */}
      {(nlpResult || intelligentResult || keywordResult) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 키워드 추출 결과 */}
          {keywordResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">키워드 추출</CardTitle>
                <CardDescription>
                  질의에서 추출된 키워드와 의도 분석
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">추출된 키워드:</p>
                    <div className="flex flex-wrap gap-1">
                      {keywordResult.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">의도 분석:</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">혼잡도 질의:</span>
                        <Badge variant={keywordResult.intentAnalysis.isCongestionQuery ? "default" : "secondary"}>
                          {keywordResult.intentAnalysis.isCongestionQuery ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">의도 유형:</span>
                        <Badge className={getIntentBadgeColor(keywordResult.intentAnalysis.intentType)}>
                          {keywordResult.intentAnalysis.intentType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">신뢰도:</span>
                        <Badge className={getConfidenceBadgeColor(keywordResult.intentAnalysis.confidence)}>
                          {Math.round(keywordResult.intentAnalysis.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* NLP 매칭 결과 */}
          {nlpResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">NLP 매칭 결과</CardTitle>
                <CardDescription>
                  자연어 처리를 통한 장소 매칭
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">추출된 장소:</p>
                    <p className="text-lg font-semibold">
                      {nlpResult.extractedLocation || '없음'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">매칭된 장소:</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {nlpResult.matchedAreaName || '매칭 실패'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">신뢰도:</span>
                    <Badge className={getConfidenceBadgeColor(nlpResult.confidence)}>
                      {Math.round(nlpResult.confidence * 100)}%
                    </Badge>
                  </div>

                  {nlpResult.suggestedLocations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">제안 장소:</p>
                      <div className="space-y-1">
                        {nlpResult.suggestedLocations.slice(0, 3).map((suggestion, index) => (
                          <p key={index} className="text-sm text-gray-600">
                            • {suggestion}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 지능형 검색 결과 */}
          {intelligentResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">지능형 검색</CardTitle>
                <CardDescription>
                  NLP + 퍼지 매칭 + 추천 시스템
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">퍼지 매칭 결과:</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {intelligentResult.fuzzyResults.slice(0, 3).map((result, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="truncate">{result.location.areaName}</span>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(result.score * 100)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">추천 장소:</p>
                    <div className="space-y-1">
                      {intelligentResult.recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {rec.category}
                          </Badge>
                          <span className="text-sm truncate">{rec.areaName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default NLPTester;