// Jest 테스트 설정 파일

// 환경변수 설정
process.env.NODE_ENV = 'test';
process.env.SEOUL_API_KEY = 'test-api-key';
process.env.CACHE_TTL_MINUTES = '1';

// 콘솔 로그 억제 (필요시)
if (process.env.SUPPRESS_LOGS === 'true') {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
}

// 전역 테스트 타임아웃 설정
jest.setTimeout(10000);

// 더미 테스트 (setup 파일이 테스트 스위트로 인식되지 않도록)
describe('Test Setup', () => {
  it('should setup test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});