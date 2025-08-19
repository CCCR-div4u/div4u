# Implementation Plan

- [x] 1. 프로젝트 초기 설정 및 구조 생성

  - 프론트엔드(React + TypeScript + Vite)와 백엔드(Node.js + Express + TypeScript) 프로젝트 구조 생성
  - 필요한 의존성 패키지 설치 (React Router, axios, Tailwind CSS 등)
  - 환경변수 설정 파일 생성 (.env, .env.example)
  - 기본 라우팅 구조 및 페이지 스켈레톤 생성 (HomePage, CrowdPredictionPage, ComingSoonPage)
  - 기본 Express 서버 설정 및 헬스체크 엔드포인트 구현
  - _Requirements: 6.1, 6.2_


- [x] 2. 서울시 120개 장소 데이터 시스템 구축

  - seoul_place.tsv.txt 파일을 파싱하여 JSON 형태로 변환하는 스크립트 작성
  - SupportedLocation 인터페이스 구현 및 120개 장소 데이터 구조 생성
  - 장소 카테고리별 분류 시스템 구현 (관광특구, 인구밀집지역, 발달상권, 공원, 고궁·문화유산)
  - 백엔드에 장소 데이터 로딩 및 관리 시스템 구현
  - _Requirements: 3.1, 3.2_





- [x] 3. 자연어 처리 및 장소 매칭 시스템 구현

  - 자연어 질의에서 장소 키워드 추출 로직 구현 (불용어 제거)





  - Fuzzy matching 알고리즘 구현 (Levenshtein distance 또는 유사도 계산)
  - 키워드 기반 장소 매칭 및 신뢰도 점수 계산 시스템 구현



  - 매칭 실패 시 유사 장소 제안 기능 구현
  - _Requirements: 2.2, 3.2_

- [x] 4. 서울시 공공 API 연동 서비스 구현


  - 서울시 실시간 도시데이터 API 호출 함수 구현
  - XML 응답 파싱 로직 구현 (AREA_CONGEST_LVL, AREA_CONGEST_MSG 추출)
  - API 호출 실패 시 재시도 로직 및 에러 처리 구현
  - 환경변수를 통한 API 키 관리 시스템 구현
  - _Requirements: 3.1, 3.3, 3.4_

- [x] 5. 백엔드 RESTful API 엔드포인트 구현


  - POST /api/congestion/query 엔드포인트 구현 (자연어 질의 처리)
  - 요청/응답 데이터 검증 미들웨어 구현
  - 에러 처리 미들웨어 및 구조화된 로깅 시스템 구현
  - API 응답 형식 표준화 및 타입 정의
  - _Requirements: 2.2, 3.1, 3.4_

- [x] 6. shadcn/ui 컴포넌트 시스템 구축



  - shadcn/ui 설치 및 기본 설정
  - Button, Card, Input, Badge 등 필요한 UI 컴포넌트 설치
  - 커스텀 스타일링 및 테마 설정
  - 컴포넌트 라이브러리 구조 정리
  - _Requirements: 1.1, 1.2, 2.1_




- [x] 7. 메인 페이지 UI 구현

  - HomePage 컴포넌트 완전 구현 (현재는 기본 스켈레톤만 존재)
  - 4개 서비스 카드 버튼 구현 (2x2 그리드 레이아웃)



  - 서비스 카드 호버 애니메이션 구현 (shadow, scale-105 효과)
  - 캐릭터 중앙 배치 및 제목/설명 텍스트 구현
  - _Requirements: 1.1, 1.2, 1.3_


- [x] 8. 기본 캐릭터 컴포넌트 구현


  - CharacterGuide 컴포넌트 기본 구조 구현
  - 캐릭터.png 이미지 최적화 및 로딩 시스템 구현
  - 혼잡도별 기본 상태 관리 시스템 구현 (붐빔, 약간 붐빔, 보통, 여유)
  - 기본 CSS 애니메이션 구현 (scale, opacity 변화)
  - _Requirements: 1.1, 4.1, 4.2_

- [x] 9. 혼잡도 서비스 페이지 기본 레이아웃 구현


  - CrowdPredictionPage 컴포넌트 완전 구현 (현재는 기본 스켈레톤만 존재)
  - 헤더 네비게이션 구현 (뒤로가기, 홈 버튼)
  - 2열 그리드 레이아웃 구현 (왼쪽: 질의, 오른쪽: 결과)
  - 자연어 질의 입력창 및 검색 버튼 구현
  - _Requirements: 2.1, 2.3, 2.4_

- [x] 10. 자연어 질의 UI 및 예시 질문 시스템 구현



  - 자연어 입력창 구현 (placeholder, Enter 키 지원)
  - 예시 질문 버튼들 구현 (클릭 시 입력창에 자동 입력)
  - 로딩 상태 UI 구현 (캐릭터 + 로딩 메시지)
  - 빈 상태 UI 구현 (캐릭터 + 안내 메시지)
  - _Requirements: 2.2, 2.5_

- [x] 11. 프론트엔드-백엔드 API 통신 구현



  - axios 기반 API 호출 함수 구현
  - 요청/응답 타입 정의 및 타입 안전성 확보
  - 에러 처리 및 사용자 친화적 에러 메시지 표시
  - 타임아웃 처리 (30초) 및 재시도 로직 구현
  - _Requirements: 2.2, 3.1_

- [x] 12. 혼잡도 결과 표시 시스템 구현





  - 검색 결과 카드 UI 구현 (장소명, 시간, 혼잡도 레벨)
  - 혼잡도별 색상 배지 구현 (붐빔-빨강, 약간붐빔-주황, 보통-노랑, 여유-초록)
  - 서울시 데이터 기반 안내 메시지 표시
  - 캐릭터 말풍선을 통한 결과 안내 구현
  - _Requirements: 4.1, 4.6, 4.7_

- [x] 13. 고급 캐릭터 애니메이션 시스템 구현



  - 혼잡도별 표정 변화 오버레이 구현 (stressed, worried, normal, happy)
  - 파티클 시스템 구현 (땀방울, 반짝임, 하트, 스트레스 효과)
  - 복합 애니메이션 구현 (shake, pulse, bounce, float, wiggle)
  - 배경 오라 효과 구현 (혼잡도별 색상 및 blur 효과)
  - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 14. 애니메이션 시퀀스 및 전환 효과 구현



  - 애니메이션 시퀀스 시스템 구현 (phases, duration, loop)
  - 부드러운 전환 효과 구현 (smooth, bounce, elastic)
  - 혼잡도 변경 시 캐릭터 상태 전환 애니메이션 구현
  - 성능 최적화를 위한 애니메이션 최적화 구현
  - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 15. 준비 중인 서비스 페이지 개선



  - ComingSoonPage 컴포넌트 개선 (현재는 기본 메시지만 존재)
  - 공사 중 아이콘 및 안내 메시지 표시
  - 뒤로가기/홈 버튼 기능 구현
  - 혼잡도 예측 서비스 추천 메시지 구현
  - _Requirements: 1.5_

- [x] 16. 반응형 웹 디자인 구현



  - 모바일 화면 대응 레이아웃 구현
  - 데스크톱/태블릿/모바일 브레이크포인트 설정
  - 터치 인터페이스 최적화 (버튼 크기, 간격 조정)
  - 다양한 화면 크기에서의 캐릭터 및 UI 요소 최적화
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 17. 로컬 개발 환경 테스트 및 통합



  - 프론트엔드 개발 서버 실행 및 기본 기능 테스트
  - 백엔드 개발 서버 실행 및 API 엔드포인트 테스트
  - 서울시 API 연동 테스트 (실제 API 호출)
  - 전체 사용자 플로우 테스트 (자연어 질의 → 결과 표시)
  - _Requirements: 모든 요구사항_

- [x] 18. 단위 테스트 및 통합 테스트 구현






  - 프론트엔드 컴포넌트 단위 테스트 작성 (Jest + React Testing Library)
  - 백엔드 API 엔드포인트 테스트 작성 (Jest + Supertest)
  - 자연어 처리 로직 테스트 작성
  - 캐릭터 애니메이션 상태 테스트 작성
  - _Requirements: 모든 요구사항_

- [ ] 19. Docker 컨테이너화 구현


  - 프론트엔드 Dockerfile 작성 (multi-stage build)
  - 백엔드 Dockerfile 작성
  - docker-compose.dev.yml 작성 (로컬 개발용)
  - 컨테이너 환경에서의 통합 테스트 실행
  - _Requirements: 6.2, 6.4_

- [ ] 20. Kubernetes 배포 매니페스트 작성
  - 프론트엔드 Deployment 및 Service 매니페스트 작성
  - 백엔드 Deployment 및 Service 매니페스트 작성
  - API 키 Secret 매니페스트 작성
  - Ingress 설정 및 로드 밸런서 구성
  - _Requirements: 6.4_

- [x] 19. 스마트 추천 시스템 개선




  - 키워드 기반 추천 알고리즘 개선 (카테고리 간 연관성 고려)
  - "강남역" 검색 시 "강남 MICE 관광특구" 등 관련 장소 추천 기능 구현
  - 지역명 기반 유사도 계산 로직 추가 (공통 키워드 매칭)
  - 추천 장소 다양성 확보를 위한 카테고리 믹스 알고리즘 구현
  - _Requirements: 6.1, 6.3, 6.4, 6.5_




- [ ] 20. Docker 컨테이너화 구현
  - 프론트엔드 Dockerfile 작성 (multi-stage build)
  - 백엔드 Dockerfile 작성



  - docker-compose.dev.yml 작성 (로컬 개발용)
  - 컨테이너 환경에서의 통합 테스트 실행
  - _Requirements: 7.2, 7.4_

- [ ] 21. Kubernetes 배포 매니페스트 작성
  - 프론트엔드 Deployment 및 Service 매니페스트 작성
  - 백엔드 Deployment 및 Service 매니페스트 작성
  - API 키 Secret 매니페스트 작성
  - Ingress 설정 및 로드 밸런서 구성
  - _Requirements: 7.4_

- [ ] 22. 성능 최적화 및 배포 준비
  - 프론트엔드 번들 최적화 (code splitting, lazy loading)
  - 캐릭터.png 이미지 최적화 및 WebP 변환
  - 백엔드 API 응답 캐싱 구현 (Redis, 5분 TTL)
  - 프로덕션 환경 설정 및 보안 강화
  - _Requirements: 7.3, 7.4_