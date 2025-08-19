import { SeoulAPIService } from '../services/SeoulAPIService';
import dotenv from 'dotenv';

// 환경변수 로드
dotenv.config();

async function testSeoulAPI() {
  console.log('🧪 서울시 API 테스트 시작...');
  
  const seoulAPI = new SeoulAPIService();
  
  // 테스트할 지역 코드들 (몇 개만 선택)
  const testAreaCodes = [
    'POI014', // 강남역
    'POI055', // 홍대입구역
    'POI001'  // 강남 MICE 관광특구
  ];

  for (const areaCode of testAreaCodes) {
    console.log(`\n📍 테스트 중: ${areaCode}`);
    
    try {
      const result = await seoulAPI.getCongestionData(areaCode);
      
      console.log('✅ 성공:');
      console.log(`  - 지역명: ${result.areaName}`);
      console.log(`  - 혼잡도: ${result.congestionLevel}`);
      console.log(`  - 메시지: ${result.congestionMessage}`);
      console.log(`  - 시간: ${result.timestamp}`);
      
      // 원본 데이터 구조 확인
      if (result.rawData?.apiResponse) {
        console.log('📊 원본 API 응답 구조:');
        console.log('  - 최상위 키들:', Object.keys(result.rawData.apiResponse));
        
        // 더 자세한 구조 분석
        const apiResponse = result.rawData.apiResponse;
        if (apiResponse.CITYDATA) {
          console.log('  - CITYDATA 키들:', Object.keys(apiResponse.CITYDATA));
          
          if (apiResponse.CITYDATA.LIVE_PPLTN_STTS) {
            console.log('  - LIVE_PPLTN_STTS 타입:', typeof apiResponse.CITYDATA.LIVE_PPLTN_STTS);
            console.log('  - LIVE_PPLTN_STTS 키들:', 
              Array.isArray(apiResponse.CITYDATA.LIVE_PPLTN_STTS) 
                ? 'Array' 
                : Object.keys(apiResponse.CITYDATA.LIVE_PPLTN_STTS || {})
            );
          }
        }
      }
      
    } catch (error) {
      console.log('❌ 실패:', error instanceof Error ? error.message : error);
    }
    
    // API 호출 간격 (서버 부하 방지)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🏁 테스트 완료');
}

// API 상태 확인도 함께 실행
async function checkAPIStatus() {
  console.log('\n🔍 API 상태 확인...');
  
  const seoulAPI = new SeoulAPIService();
  const status = await seoulAPI.checkAPIStatus();
  
  console.log('API 상태:', status.available ? '✅ 사용 가능' : '❌ 사용 불가');
  console.log('응답 시간:', `${status.responseTime}ms`);
  
  if (status.error) {
    console.log('오류:', status.error);
  }
}

// 실행
async function main() {
  try {
    await checkAPIStatus();
    await testSeoulAPI();
  } catch (error) {
    console.error('테스트 실행 중 오류:', error);
  }
}

main();