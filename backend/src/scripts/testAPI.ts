import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 API 테스트 시작...\n');

  // 1. Health Check
  try {
    console.log('1️⃣ Health Check 테스트');
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ 성공:', response.data.success);
    console.log('📊 상태:', response.data.data.status);
    console.log('📈 업타임:', Math.round(response.data.data.uptime), '초');
  } catch (error) {
    console.log('❌ 실패:', error instanceof Error ? error.message : error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 2. 혼잡도 조회 테스트
  try {
    console.log('2️⃣ 혼잡도 조회 테스트');
    const response = await axios.post(`${API_BASE_URL}/congestion/query`, {
      query: '홍대 혼잡도 어때?',
      serviceType: 'realtime'
    });
    
    console.log('✅ 성공:', response.data.success);
    console.log('📍 장소:', response.data.data.location);
    console.log('👥 혼잡도:', response.data.data.crowdLevel);
    console.log('💬 메시지:', response.data.data.message);
    console.log('🎯 신뢰도:', response.data.data.confidence);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.log('❌ 실패:', error.response.data);
    } else {
      console.log('❌ 실패:', error instanceof Error ? error.message : error);
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 3. 검증 오류 테스트
  try {
    console.log('3️⃣ 검증 오류 테스트 (빈 쿼리)');
    const response = await axios.post(`${API_BASE_URL}/congestion/query`, {
      query: ''
    });
    console.log('⚠️ 예상치 못한 성공:', response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.log('✅ 예상된 검증 오류:', error.response.data.message);
      console.log('📝 에러 코드:', error.response.data.error);
    } else {
      console.log('❌ 예상치 못한 오류:', error instanceof Error ? error.message : error);
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 4. 장소 검색 테스트
  try {
    console.log('4️⃣ 장소 검색 테스트');
    const response = await axios.get(`${API_BASE_URL}/locations/search?q=강남`);
    console.log('✅ 성공:', response.data.success);
    console.log('🔍 검색 결과 수:', response.data.data.length);
    if (response.data.data.length > 0) {
      console.log('📍 첫 번째 결과:', response.data.data[0].displayName);
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.log('❌ 실패:', error.response.data);
    } else {
      console.log('❌ 실패:', error instanceof Error ? error.message : error);
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 5. 404 테스트
  try {
    console.log('5️⃣ 404 에러 테스트');
    const response = await axios.get(`${API_BASE_URL}/nonexistent`);
    console.log('⚠️ 예상치 못한 성공:', response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.log('✅ 예상된 404 에러:', error.response.data.message);
    } else {
      console.log('❌ 예상치 못한 오류:', error instanceof Error ? error.message : error);
    }
  }

  console.log('\n🏁 API 테스트 완료');
}

testAPI().catch(console.error);