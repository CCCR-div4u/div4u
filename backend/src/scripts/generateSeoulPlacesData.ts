import path from 'path';
import { parseSeoulPlacesTSV, saveLocationsToJSON, printCategoryStats } from '../data/parseSeoulPlaces';

/**
 * 서울시 120개 장소 데이터 생성 스크립트
 */
async function generateSeoulPlacesData() {
  try {
    console.log('🚀 서울시 120개 장소 데이터 생성 시작...\n');
    
    // TSV 파일 경로 (프로젝트 루트에서 찾기)
    const tsvFilePath = path.resolve(__dirname, '../../../../seoul_place.tsv.txt');
    console.log(`📁 TSV 파일 경로: ${tsvFilePath}`);
    
    // TSV 파일 파싱
    console.log('📊 TSV 파일 파싱 중...');
    const locations = parseSeoulPlacesTSV(tsvFilePath);
    
    // 통계 출력
    printCategoryStats(locations);
    
    // JSON 파일로 저장
    const outputPath = path.resolve(__dirname, '../data/seoulPlaces.json');
    console.log(`💾 JSON 파일 저장 중: ${outputPath}`);
    saveLocationsToJSON(locations, outputPath);
    
    // 샘플 데이터 출력
    console.log('📋 샘플 데이터:');
    locations.slice(0, 3).forEach((location, index) => {
      console.log(`${index + 1}. ${location.areaName} (${location.category})`);
      console.log(`   - 코드: ${location.areaCode}`);
      console.log(`   - 영문명: ${location.engName}`);
      console.log(`   - 키워드: ${location.keywords.slice(0, 5).join(', ')}...`);
      console.log('');
    });
    
    console.log('✅ 서울시 120개 장소 데이터 생성 완료!');
    
  } catch (error) {
    console.error('❌ 데이터 생성 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  generateSeoulPlacesData();
}