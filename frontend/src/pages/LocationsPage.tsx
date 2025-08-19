import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Badge } from '../components/ui';
import { ArrowLeft, MapPin, Search, Filter } from 'lucide-react';
import Header from '../components/Header';

const LocationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchTerm, setSearchTerm] = useState('');

  // 서울시 120개 주요 지점 데이터 (원본 TSV 기반)
  const locations = {
    '관광특구': [
      '강남 MICE 관광특구', '동대문 관광특구', '명동 관광특구', '이태원 관광특구',
      '잠실 관광특구', '종로·청계 관광특구', '홍대 관광특구'
    ],
    '고궁·문화유산': [
      '경복궁', '광화문·덕수궁', '보신각', '서울 암사동 유적', '창덕궁·종묘'
    ],
    '인구밀집지역': [
      '가산디지털단지역', '강남역', '건대입구역', '고덕역', '고속터미널역',
      '교대역', '구로디지털단지역', '구로역', '군자역', '대림역',
      '동대문역', '뚝섬역', '미아사거리역', '발산역', '사당역',
      '삼각지역', '서울대입구역', '서울식물원·마곡나루역', '서울역', '선릉역',
      '성신여대입구역', '수유역', '신논현역·논현역', '신도림역', '신림역',
      '신촌·이대역', '양재역', '역삼역', '연신내역', '오목교역·목동운동장',
      '왕십리역', '용산역', '이태원역', '장지역', '장한평역',
      '천호역', '총신대입구(이수)역', '충정로역', '합정역', '혜화역',
      '홍대입구역(2호선)', '회기역', '쌍문역', '신정네거리역', '잠실새내역', '잠실역'
    ],
    '발달상권': [
      '가락시장', '가로수길', '광장(전통)시장', '김포공항', '노량진',
      '덕수궁길·정동길', '북촌한옥마을', '서촌', '성수카페거리', '압구정로데오거리',
      '여의도', '연남동', '영등포 타임스퀘어', '용리단길', '이태원 앤틱가구거리',
      '인사동', '창동 신경제 중심지', '청담동 명품거리', '청량리 제기동 일대 전통시장', '해방촌·경리단길',
      'DDP(동대문디자인플라자)', 'DMC(디지털미디어시티)', '북창동 먹자골목', '남대문시장', '익선동',
      '잠실롯데타워 일대', '송리단길·호수단길', '신촌 스타광장'
    ],
    '공원': [
      '강서한강공원', '고척돔', '광나루한강공원', '광화문광장', '국립중앙박물관·용산가족공원',
      '난지한강공원', '남산공원', '노들섬', '뚝섬한강공원', '망원한강공원',
      '반포한강공원', '북서울꿈의숲', '서리풀공원·몽마르뜨공원', '서울광장', '서울대공원',
      '서울숲공원', '아차산', '양화한강공원', '어린이대공원', '여의도한강공원',
      '월드컵공원', '응봉산', '이촌한강공원', '잠실종합운동장', '잠실한강공원',
      '잠원한강공원', '청계산', '청와대', '보라매공원', '서대문독립공원',
      '안양천', '여의서로', '올림픽공원', '홍제폭포'
    ]
  };

  const categories = ['전체', ...Object.keys(locations)];

  // 필터링된 장소들
  const getFilteredLocations = () => {
    let allLocations: { name: string; category: string }[] = [];
    
    if (selectedCategory === '전체') {
      Object.entries(locations).forEach(([category, places]) => {
        places.forEach(place => {
          allLocations.push({ name: place, category });
        });
      });
    } else {
      locations[selectedCategory as keyof typeof locations]?.forEach(place => {
        allLocations.push({ name: place, category: selectedCategory });
      });
    }

    if (searchTerm) {
      allLocations = allLocations.filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return allLocations;
  };

  const filteredLocations = getFilteredLocations();

  const getCategoryColor = (category: string) => {
    const colors = {
      '관광특구': 'bg-red-100 text-red-800 border-red-200',
      '발달상권': 'bg-blue-100 text-blue-800 border-blue-200',
      '인구밀집지역': 'bg-green-100 text-green-800 border-green-200',
      '공원': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      '고궁·문화유산': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCategoryStats = () => {
    return Object.entries(locations).map(([category, places]) => ({
      category,
      count: places.length
    }));
  };

  const getTotalCount = () => {
    return Object.values(locations).reduce((total, places) => total + places.length, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-amber-600 hover:text-amber-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로
          </Button>
          <div className="h-6 w-px bg-amber-300"></div>
          <div>
            <h1 className="text-3xl font-bold text-amber-900">서울시 120개 주요 지점</h1>
            <p className="text-amber-700 mt-1">실시간 혼잡도를 확인할 수 있는 모든 장소</p>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="border-2 border-amber-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-900">{getTotalCount()}</div>
              <div className="text-sm text-amber-700">전체 지점</div>
            </CardContent>
          </Card>
          {getCategoryStats().map(({ category, count }) => (
            <Card key={category} className="border-2 border-orange-200">
              <CardContent className="p-4 text-center">
                <div className="text-xl font-bold text-orange-900">{count}</div>
                <div className="text-xs text-orange-700">{category}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 검색 및 필터 */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* 검색 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="장소명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-orange-200 rounded-lg focus:border-orange-400 focus:outline-none"
            />
          </div>

          {/* 카테고리 필터 */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`${
                  selectedCategory === category
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'border-orange-300 text-orange-700 hover:bg-orange-50'
                }`}
              >
                <Filter className="w-3 h-3 mr-1" />
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* 결과 개수 */}
        <div className="mb-6">
          <p className="text-amber-700">
            <span className="font-semibold">{filteredLocations.length}개</span>의 장소가 있습니다
            {searchTerm && (
              <span className="ml-2 text-sm">
                ('{searchTerm}' 검색 결과)
              </span>
            )}
          </p>
        </div>

        {/* 장소 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredLocations.map((location, index) => (
            <Card
              key={`${location.category}-${location.name}-${index}`}
              className="group cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg border-2 border-orange-200 hover:border-orange-300"
              onClick={() => navigate(`/realtime?q=${encodeURIComponent(location.name + ' 혼잡도')}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <h3 className="font-semibold text-gray-800 group-hover:text-orange-800 text-sm leading-tight">
                      {location.name}
                    </h3>
                  </div>
                </div>
                
                <Badge className={`text-xs ${getCategoryColor(location.category)}`}>
                  {location.category}
                </Badge>

                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white text-xs"
                  >
                    혼잡도 확인하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 검색 결과 없음 */}
        {filteredLocations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500 mb-4">다른 검색어나 카테고리를 시도해보세요</p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('전체');
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              전체 보기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationsPage;