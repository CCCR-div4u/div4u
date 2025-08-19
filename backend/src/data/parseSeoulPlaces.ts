import fs from 'fs';
import { SupportedLocation } from '../types';

/**
 * TSV 파일을 파싱하여 SupportedLocation 배열로 변환
 */
export function parseSeoulPlacesTSV(filePath: string): SupportedLocation[] {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');
    
    // 헤더 라인 제거
    const dataLines = lines.slice(1);
    
    const locations: SupportedLocation[] = [];
    
    for (const line of dataLines) {
      const columns = line.split('\t');
      
      // 빈 라인이나 불완전한 데이터 스킵
      if (columns.length < 4 || !columns[0] || !columns[2] || !columns[3]) {
        continue;
      }
      
      const category = columns[0].trim();
      const areaCode = columns[2].trim();
      const areaName = columns[3].trim();
      const engName = columns[4]?.trim() || '';
      
      // 키워드 생성 (한글명, 영문명, 카테고리 기반)
      const keywords = generateKeywords(areaName, engName, category);
      
      const location: SupportedLocation = {
        areaCode,
        areaName,
        displayName: areaName,
        engName,
        category,
        keywords
      };
      
      locations.push(location);
    }
    
    return locations;
  } catch (error) {
    console.error('Error parsing Seoul places TSV:', error);
    throw error;
  }
}

/**
 * 장소명과 카테고리를 기반으로 검색 키워드 생성
 */
function generateKeywords(areaName: string, engName: string, category: string): string[] {
  const keywords = new Set<string>();
  
  // 기본 이름들 추가
  keywords.add(areaName);
  if (engName) {
    keywords.add(engName);
  }
  
  // 한글명에서 키워드 추출
  const koreanKeywords = extractKoreanKeywords(areaName);
  koreanKeywords.forEach(keyword => keywords.add(keyword));
  
  // 영문명에서 키워드 추출
  if (engName) {
    const englishKeywords = extractEnglishKeywords(engName);
    englishKeywords.forEach(keyword => keywords.add(keyword));
  }
  
  // 카테고리별 추가 키워드
  const categoryKeywords = getCategoryKeywords(category);
  categoryKeywords.forEach(keyword => keywords.add(keyword));
  
  return Array.from(keywords).filter(keyword => keyword.length > 0);
}

/**
 * 한글 장소명에서 키워드 추출
 */
function extractKoreanKeywords(name: string): string[] {
  const keywords: string[] = [];
  
  // 공통 접미사 제거
  const suffixes = ['역', '공원', '시장', '거리', '광장', '궁', '관광특구', '한강공원', '일대'];
  let cleanName = name;
  
  for (const suffix of suffixes) {
    if (cleanName.endsWith(suffix)) {
      cleanName = cleanName.slice(0, -suffix.length);
      keywords.push(cleanName); // 접미사 제거된 이름 추가
      break;
    }
  }
  
  // 특수 문자로 분리된 키워드 추출
  const separators = ['·', '&', ',', '(', ')', '-', ' '];
  let parts = [name];
  
  for (const separator of separators) {
    const newParts: string[] = [];
    for (const part of parts) {
      newParts.push(...part.split(separator));
    }
    parts = newParts;
  }
  
  // 의미있는 키워드만 추가 (2글자 이상)
  parts.forEach(part => {
    const trimmed = part.trim();
    if (trimmed.length >= 2) {
      keywords.push(trimmed);
    }
  });
  
  return keywords;
}

/**
 * 영문 장소명에서 키워드 추출
 */
function extractEnglishKeywords(name: string): string[] {
  const keywords: string[] = [];
  
  // 공통 접미사 제거
  const suffixes = ['station', 'Station', 'Park', 'Market', 'Street', 'Square', 'Palace', 'Zone'];
  let cleanName = name;
  
  for (const suffix of suffixes) {
    if (cleanName.endsWith(suffix)) {
      cleanName = cleanName.slice(0, -suffix.length).trim();
      keywords.push(cleanName);
      break;
    }
  }
  
  // 단어별로 분리
  const words = name.split(/[\s&·(),.-]+/).filter(word => word.length > 0);
  words.forEach(word => {
    if (word.length >= 2) {
      keywords.push(word);
      keywords.push(word.toLowerCase());
    }
  });
  
  return keywords;
}

/**
 * 카테고리별 추가 키워드 반환
 */
function getCategoryKeywords(category: string): string[] {
  const categoryMap: Record<string, string[]> = {
    '관광특구': ['관광', '특구', '여행', '투어'],
    '고궁·문화유산': ['고궁', '궁궐', '문화유산', '유적', '전통', '역사'],
    '인구밀집지역': ['역', '지하철', '전철', '교통', '번화가'],
    '발달상권': ['상권', '쇼핑', '상가', '시장', '거리', '먹거리'],
    '공원': ['공원', '자연', '산책', '휴식', '녹지', '운동']
  };
  
  return categoryMap[category] || [];
}

/**
 * JSON 파일로 저장
 */
export function saveLocationsToJSON(locations: SupportedLocation[], outputPath: string): void {
  try {
    const jsonData = JSON.stringify(locations, null, 2);
    fs.writeFileSync(outputPath, jsonData, 'utf-8');
    console.log(`Successfully saved ${locations.length} locations to ${outputPath}`);
  } catch (error) {
    console.error('Error saving locations to JSON:', error);
    throw error;
  }
}

/**
 * 카테고리별 통계 출력
 */
export function printCategoryStats(locations: SupportedLocation[]): void {
  const categoryStats: Record<string, number> = {};
  
  locations.forEach(location => {
    categoryStats[location.category] = (categoryStats[location.category] || 0) + 1;
  });
  
  console.log('\n=== 카테고리별 장소 통계 ===');
  Object.entries(categoryStats).forEach(([category, count]) => {
    console.log(`${category}: ${count}개`);
  });
  console.log(`총 장소 수: ${locations.length}개\n`);
}