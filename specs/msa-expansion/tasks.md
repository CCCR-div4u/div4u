# Implementation Plan

- [x] 1. Comparison Service 프로젝트 초기 설정



  - comparison-service/ 디렉터리 생성 및 독립적인 Node.js 프로젝트 초기화
  - package.json 생성 및 필요한 의존성 설치 (express, axios, cors, dotenv, typescript)
  - TypeScript 설정 파일 생성 (tsconfig.json)
  - 환경변수 설정 파일 생성 (.env, .env.example)
  - 기본 Express 서버 구조 생성 (src/app.ts, src/server.ts)




  - _Requirements: 4.1, 4.2_

- [ ] 2. Comparison Service API 엔드포인트 구현
  - POST /api/comparison/compare 엔드포인트 구현



  - GET /api/comparison/health 헬스체크 엔드포인트 구현
  - 요청/응답 데이터 타입 정의 (ComparisonRequest, ComparisonResponse)
  - 에러 처리 미들웨어 구현 (ComparisonServiceError)
  - CORS 설정 및 보안 미들웨어 구현
  - _Requirements: 1.1, 1.2, 4.5_




- [ ] 3. 서울시 API 연동 및 자연어 처리 구현
  - 서울시 공공 API 호출 함수 구현 (기존 Core API 로직 참조)
  - 자연어 처리 로직 구현 (장소명 추출 및 매칭)
  - 120개 장소 데이터 로딩 시스템 구현




  - API 호출 실패 시 재시도 로직 및 에러 처리 구현
  - 병렬 처리를 통한 여러 장소 동시 조회 최적화
  - _Requirements: 1.1, 1.2, 5.2_




- [ ] 4. 혼잡도 비교 분석 로직 구현
  - ComparisonAnalyzer 클래스 구현 (평균 혼잡도 계산)
  - 혼잡도 점수화 시스템 구현 (여유:1, 보통:2, 약간붐빔:3, 붐빔:4)
  - 혼잡도별 분포 통계 계산 기능 구현
  - 최적 선택지 추천 로직 구현 (가장 덜 혼잡한 곳 + 이유)



  - 대안 옵션 제안 기능 구현 (상위 2개 대안)
  - _Requirements: 1.3, 1.4_

- [ ] 5. 캐싱 및 성능 최적화 구현
  - 메모리 기반 캐싱 시스템 구현 (5분 TTL)











  - 병렬 API 호출 최적화 (Promise.allSettled 활용)
  - 응답 시간 개선을 위한 데이터 압축 구현
  - 메모리 사용량 모니터링 및 최적화
  - API 호출 제한 및 레이트 리미팅 구현
  - _Requirements: 1.5, 7.2_




- [ ] 6. 로컬 개발 환경 테스트
  - Comparison Service 로컬 서버 실행 (포트 3002)
  - Postman 또는 curl을 통한 API 엔드포인트 테스트
  - 여러 장소 비교 기능 테스트 (홍대, 강남, 명동 등)




  - 에러 처리 테스트 (잘못된 장소명, API 실패 등)
  - 성능 테스트 (동시 요청 처리, 응답 시간 측정)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_




- [ ] 7. 프론트엔드 API 서비스 통합
  - frontend/src/services/comparisonApi.ts 파일 생성
  - ComparisonApiService 클래스 구현 (axios 기반)
  - 환경변수 설정 (VITE_COMPARISON_API_URL=http://localhost:3002)
  - API 호출 에러 처리 및 타임아웃 설정



  - TypeScript 타입 정의 (ComparisonServiceResponse 등)
  - _Requirements: 6.3, 6.4_

- [x] 8. 기존 CongestionComparison 컴포넌트 수정
  - 기존 CongestionComparison 컴포넌트에 새로운 API 서비스 연동
  - 새로운 Comparison Service 호출 로직 추가
  - 서비스 실패 시 기존 Core API로 폴백 로직 구현
  - 향상된 비교 분석 결과 UI 표시 (평균 혼잡도, 추천 등)
  - 에러 상태 및 로딩 상태 UI 개선
  - _Requirements: 6.1, 6.2, 6.4_

- [ ] 9. 비교 분석 결과 UI 개선
  - 평균 혼잡도 표시 컴포넌트 구현
  - 혼잡도별 분포 차트 구현 (막대 그래프 또는 도넛 차트)
  - 최적 선택지 추천 카드 구현 (이유 설명 포함)
  - 대안 옵션 표시 UI 구현
  - 비교 결과 순위 표시 개선 (1위, 2위, 3위 등)
  - _Requirements: 1.3, 1.4, 6.5_

- [ ] 10. 서비스 독립성 테스트
  - 기존 Frontend + Core API 서비스 정상 작동 확인
  - Comparison Service 중단 시 기존 서비스 영향 없음 확인
  - 새로운 서비스 장애 시 폴백 동작 테스트
  - 포트 충돌 없음 확인 (3001: Core API, 3002: Comparison)
  - 메모리 및 CPU 사용량 독립성 확인
  - _Requirements: 4.3, 7.1, 7.3_

- [ ] 11. 통합 테스트 및 사용자 플로우 검증
  - 전체 사용자 플로우 테스트 (메인 페이지 → 비교 서비스 → 결과 확인)
  - 여러 장소 동시 비교 기능 전체 테스트
  - 다양한 시나리오 테스트 (모든 곳이 붐빔, 모든 곳이 여유 등)
  - 브라우저 호환성 테스트 (Chrome, Firefox, Safari)
  - 모바일 반응형 테스트
  - _Requirements: 모든 요구사항_

- [ ] 12. 단위 테스트 및 통합 테스트 작성
  - Comparison Service API 엔드포인트 테스트 작성 (Jest + Supertest)
  - ComparisonAnalyzer 로직 단위 테스트 작성
  - 서울시 API 연동 테스트 작성 (Mock 데이터 활용)
  - 프론트엔드 ComparisonApiService 테스트 작성
  - CongestionComparison 컴포넌트 테스트 작성 (React Testing Library)
  - _Requirements: 모든 요구사항_

- [ ] 13. 문서화 및 배포 준비
  - Comparison Service README.md 작성 (설치, 실행, API 문서)
  - API 엔드포인트 문서 작성 (Swagger 또는 Markdown)
  - 로컬 개발 환경 설정 가이드 작성
  - 환경변수 설정 가이드 작성
  - 트러블슈팅 가이드 작성
  - _Requirements: 7.4_

- [ ] 14. Docker 컨테이너화 (선택사항)
  - Comparison Service Dockerfile 작성
  - docker-compose.yml에 새로운 서비스 추가
  - 컨테이너 환경에서의 통합 테스트
  - 컨테이너 간 네트워크 통신 확인
  - 프로덕션 배포를 위한 이미지 최적화
  - _Requirements: 4.4_

- [ ] 15. 성능 모니터링 및 최적화
  - 응답 시간 모니터링 구현 (평균, 최대, 최소)
  - 메모리 사용량 모니터링 구현
  - API 호출 성공률 모니터링 구현
  - 병목 지점 식별 및 최적화
  - 로그 시스템 구현 (Winston 또는 기본 console.log)
  - _Requirements: 7.1, 7.2, 7.5_

- [ ] 16. 코드 리뷰 및 리팩토링
  - 코드 품질 검토 (ESLint, Prettier 적용)
  - 타입 안전성 검토 (TypeScript strict 모드)
  - 보안 취약점 검토 (API 키 노출, CORS 설정 등)
  - 성능 최적화 검토 (불필요한 API 호출 제거)
  - 코드 중복 제거 및 재사용성 개선
  - _Requirements: 모든 요구사항_

- [ ] 17. GitHub 커밋 및 푸시 준비
  - .gitignore 파일 업데이트 (node_modules, .env 등)
  - 커밋 메시지 작성 가이드라인 준비
  - 브랜치 전략 수립 (feature/comparison-service)
  - Pull Request 템플릿 작성
  - 팀원과의 코드 리뷰 프로세스 준비
  - _Requirements: 모든 요구사항_