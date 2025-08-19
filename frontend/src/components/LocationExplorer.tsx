import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { locationService } from '../services/congestionService';
import { SupportedLocation, CategoryInfo, FuzzySearchResult } from '../types';

const LocationExplorer: React.FC = () => {
  const [locations, setLocations] = useState<SupportedLocation[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SupportedLocation[]>([]);
  const [fuzzyResults, setFuzzyResults] = useState<FuzzySearchResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [locationsData, categoriesData] = await Promise.all([
        locationService.getAllLocations(),
        locationService.getCategories()
      ]);
      
      setLocations(locationsData);
      setCategories(categoriesData);
      setError('');
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 검색 실행
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setFuzzyResults([]);
      return;
    }

    try {
      setLoading(true);
      const [keywordResults, fuzzySearchResults] = await Promise.all([
        locationService.searchLocations(searchQuery),
        locationService.fuzzySearchLocations(searchQuery, 0.3)
      ]);
      
      setSearchResults(keywordResults);
      setFuzzyResults(fuzzySearchResults);
      setError('');
    } catch (err) {
      setError('검색 중 오류가 발생했습니다.');
      console.error('Error searching:', err);
    } finally {
      setLoading(false);
    }
  };

  // 카테고리별 필터링
  const handleCategoryFilter = async (categoryName: string) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory('');
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setSelectedCategory(categoryName);
      const categoryResults = await locationService.getLocationsByCategory(categoryName as any);
      setSearchResults(categoryResults);
      setFuzzyResults([]);
      setError('');
    } catch (err) {
      setError('카테고리 필터링 중 오류가 발생했습니다.');
      console.error('Error filtering by category:', err);
    } finally {
      setLoading(false);
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (loading && locations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">서울시 장소 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          서울시 120개 장소 데이터 시스템
        </h1>
        <p className="text-gray-600">
          총 {locations.length}개의 서울시 주요 장소를 검색하고 탐색해보세요.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* 검색 섹션 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>장소 검색</CardTitle>
          <CardDescription>
            장소명, 키워드, 또는 영문명으로 검색할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="예: 강남, 홍대, 남산공원..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? '검색 중...' : '검색'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 카테고리 필터 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>카테고리별 탐색</CardTitle>
          <CardDescription>
            관심 있는 카테고리를 선택해보세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                onClick={() => handleCategoryFilter(category.name)}
                className="flex items-center gap-2"
              >
                <span>{category.icon}</span>
                <span>{category.displayName}</span>
                <Badge variant="secondary" className="ml-1">
                  {locations.filter(loc => loc.category === category.name).length}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 검색 결과 */}
      {(searchResults.length > 0 || fuzzyResults.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 정확한 검색 결과 */}
          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>검색 결과 ({searchResults.length}개)</CardTitle>
                <CardDescription>
                  키워드와 정확히 일치하는 장소들
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {searchResults.map((location) => (
                    <div
                      key={location.areaCode}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            {location.areaName}
                          </h3>
                          {location.engName && (
                            <p className="text-sm text-gray-600 mt-1">
                              {location.engName}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">
                              {location.category}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {location.areaCode}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 퍼지 검색 결과 */}
          {fuzzyResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>유사한 장소 ({fuzzyResults.length}개)</CardTitle>
                <CardDescription>
                  검색어와 유사한 장소들 (유사도 순)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {fuzzyResults.map((result) => (
                    <div
                      key={result.location.areaCode}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            {result.location.areaName}
                          </h3>
                          {result.location.engName && (
                            <p className="text-sm text-gray-600 mt-1">
                              {result.location.engName}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">
                              {result.location.category}
                            </Badge>
                            <Badge variant="secondary">
                              {Math.round(result.score * 100)}% 일치
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {result.location.areaCode}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 전체 통계 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>카테고리별 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((category) => {
              const count = locations.filter(loc => loc.category === category.name).length;
              return (
                <div key={category.name} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <div className="font-semibold text-lg">{count}</div>
                  <div className="text-sm text-gray-600">{category.displayName}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationExplorer;