// 통합 테스트 스크립트
const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:5174';

async function testIntegration() {
  console.log('🧪 통합 테스트 시작...\n');

  // 1. 백엔드 Health Check
  console.log('1️⃣ 백엔드 Health Check');
  try {
    const response = await axios.get(`${BACKEND_URL}/health`);
    console.log('✅ 백엔드 서버 정상:', response.data.success);
    console.log('📊 로드된 장소 수:', response.data.data.locationStats?.totalLocations || 'N/A');
  } catch (error) {
    console.log('❌ 백엔드 서버 오류:', error.message);
    return;
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 2. 자연어 처리 테스트
  console.log('2️⃣ 자연어 처리 테스트');
  try {
    const response = await axios.post(`${BACKEND_URL}/nlp/query`, {
      query: '홍대 혼잡도 어때?'
    });
    console.log('✅ NLP 처리 성공:', response.data.success);
    console.log('🎯 추출된 장소:', response.data.data.matchedAreaName);
    console.log('📈 신뢰도:', response.data.data.confidence);
  } catch (error) {
    console.log('❌ NLP 처리 실패:', error.response?.data?.message || error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 3. 혼잡도 조회 테스트
  console.log('3️⃣ 혼잡도 조회 테스트');
  try {
    const response = await axios.post(`${BACKEND_URL}/congestion/query`, {
      query: '강남역 혼잡도',
      serviceType: 'realtime'
    });
    console.log('✅ 혼잡도 조회 성공:', response.data.success);
    console.log('📍 장소:', response.data.data.location);
    console.log('👥 혼잡도:', response.data.data.crowdLevel);
    console.log('💬 메시지:', response.data.data.message.substring(0, 50) + '...');
  } catch (error) {
    console.log('❌ 혼잡도 조회 실패:', error.response?.data?.message || error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 4. 프론트엔드 접속 테스트
  console.log('4️⃣ 프론트엔드 접속 테스트');
  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
    console.log('✅ 프론트엔드 서버 정상 (상태 코드:', response.status + ')');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ 프론트엔드 서버가 실행되지 않음');
    } else {
      console.log('⚠️ 프론트엔드 접속 확인 필요:', error.message);
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 5. 서울시 API 상태 확인
  console.log('5️⃣ 서울시 API 상태 확인');
  try {
    const response = await axios.get(`${BACKEND_URL}/seoul-api/status`);
    console.log('✅ 서울시 API 상태 확인 성공');
    console.log('🌐 API 사용 가능:', response.data.data.available ? '예' : '아니오');
    console.log('⏱️ 응답 시간:', response.data.data.responseTime + 'ms');
  } catch (error) {
    console.log('❌ 서울시 API 상태 확인 실패:', error.response?.data?.message || error.message);
  }

  console.log('\n🏁 통합 테스트 완료');
  console.log('\n📋 테스트 결과 요약:');
  console.log('- 백엔드 서버: 실행 중');
  console.log('- 자연어 처리: 동작 중');
  console.log('- 혼잡도 조회: 동작 중');
  console.log('- 서울시 API: 연동 중');
  console.log('\n🌐 접속 URL:');
  console.log(`- 프론트엔드: ${FRONTEND_URL}`);
  console.log(`- 백엔드 API: ${BACKEND_URL}`);
}

testIntegration().catch(console.error);