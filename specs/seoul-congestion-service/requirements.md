# Requirements Document

## Introduction

서울시 실시간 도시데이터 API를 활용하여 사용자가 원하는 지역의 혼잡도를 자연어 질의를 통해 조회할 수 있는 웹/모바일 서비스입니다. 사용자는 귀여운 캐릭터가 있는 메인 페이지에서 혼잡도 예측 서비스를 선택하고, 자연어로 장소를 검색하여 실시간 혼잡도 정보를 4단계로 확인할 수 있습니다.

## Requirements

### Requirement 1: 메인 페이지 UI

**User Story:** As a 사용자, I want 메인 페이지에서 귀여운 캐릭터와 서비스 메뉴를 볼 수 있기를, so that 직관적으로 서비스를 선택할 수 있다

#### Acceptance Criteria

1. WHEN 사용자가 메인 페이지에 접속 THEN 시스템 SHALL blue-50 to purple-50 그라데이션 배경에 캐릭터.png 이미지를 사용한 귀여운 캐릭터를 페이지 중앙에 표시한다
2. WHEN 메인 페이지가 로드 THEN 시스템 SHALL 4개의 서비스 카드 버튼(실시간 혼잡도 📍, 혼잡도 예측 🔮, 혼잡도 비교 📊, 기타 ⚙️)을 2x2 그리드로 표시한다
3. WHEN 사용자가 서비스 카드에 호버 THEN 시스템 SHALL 카드에 그림자 효과와 scale-105 애니메이션을 적용한다
4. WHEN 사용자가 혼잡도 예측 또는 실시간 혼잡도 버튼을 클릭 THEN 시스템 SHALL 해당 서비스 페이지로 이동한다
5. WHEN 사용자가 아직 구현되지 않은 서비스를 클릭 THEN 시스템 SHALL "준비 중인 서비스" 안내 페이지를 표시한다

### Requirement 2: 혼잡도 서비스 페이지 레이아웃

**User Story:** As a 사용자, I want 자연어로 장소를 검색하여 혼잡도를 확인할 수 있기를, so that 원하는 지역의 현재 상황을 쉽게 파악할 수 있다

#### Acceptance Criteria

1. WHEN 사용자가 혼잡도 서비스 페이지에 접속 THEN 시스템 SHALL 상단에 뒤로가기, 홈 버튼과 서비스 제목이 있는 헤더를 표시한다
2. WHEN 페이지가 로드 THEN 시스템 SHALL 왼쪽에 자연어 질의 카드, 오른쪽에 검색 결과 카드를 2열 그리드로 표시한다
3. WHEN 사용자가 자연어 질의 카드에서 장소를 입력 THEN 시스템 SHALL 예시 질문 버튼들을 제공한다
4. WHEN 사용자가 검색 버튼을 클릭하거나 Enter를 누름 THEN 시스템 SHALL 로딩 상태에서 캐릭터와 로딩 메시지를 표시한다
5. WHEN 검색 결과가 없을 때 THEN 시스템 SHALL 캐릭터와 함께 "어디로 가고 싶은지 알려주세요!" 메시지를 표시한다

### Requirement 3: 서울시 API 연동

**User Story:** As a 시스템, I want 서울시 실시간 도시데이터 API를 호출하여 혼잡도 정보를 가져올 수 있기를, so that 사용자에게 정확한 실시간 데이터를 제공할 수 있다

#### Acceptance Criteria

1. WHEN 장소명이 확정 THEN 시스템 SHALL http://openapi.seoul.go.kr:8088/{API_KEY}/xml/citydata/1/5/{AREA_NM} 형식으로 API를 호출한다
2. WHEN API 응답을 받음 THEN 시스템 SHALL AREA_CONGEST_LVL 값을 파싱하여 혼잡도 레벨을 추출한다
3. WHEN API 응답을 받음 THEN 시스템 SHALL AREA_CONGEST_MSG 값을 파싱하여 혼잡도 메시지를 추출한다
4. IF API 호출이 실패 THEN 시스템 SHALL 사용자에게 오류 메시지를 표시한다

### Requirement 4: 인터랙티브 캐릭터 혼잡도 표시

**User Story:** As a 사용자, I want 혼잡도 정보를 캐릭터가 생동감 있게 알려주기를, so that 재미있고 직관적으로 정보를 이해할 수 있다

#### Acceptance Criteria

1. WHEN 혼잡도 데이터를 받음 THEN 시스템 SHALL 캐릭터.png 이미지를 기반으로 한 캐릭터가 말풍선으로 혼잡도 레벨(붐빔, 약간 붐빔, 보통, 여유)을 안내한다
2. WHEN 혼잡도가 "붐빔" THEN 시스템 SHALL 캐릭터에 스트레스 받은 표정, 빨간 오라, 땀방울 이모티콘, shake 애니메이션을 적용한다
3. WHEN 혼잡도가 "약간 붐빔" THEN 시스템 SHALL 캐릭터에 약간 걱정스러운 표정과 주황색 오라를 적용한다
4. WHEN 혼잡도가 "보통" THEN 시스템 SHALL 캐릭터를 기본 상태로 표시한다
5. WHEN 혼잡도가 "여유" THEN 시스템 SHALL 캐릭터에 행복한 표정, 초록 오라, 축하 이모티콘, 확대 효과를 적용한다
6. WHEN 혼잡도 정보를 표시 THEN 시스템 SHALL 혼잡도별 색상 배지(붐빔-빨강, 약간붐빔-주황, 보통-노랑, 여유-초록)를 표시한다
7. WHEN 혼잡도 결과를 표시 THEN 시스템 SHALL 서울시 데이터 기반 안내 메시지를 하단에 표시한다

### Requirement 5: 반응형 웹 디자인

**User Story:** As a 사용자, I want 웹과 모바일에서 모두 편리하게 서비스를 이용할 수 있기를, so that 언제 어디서나 혼잡도를 확인할 수 있다

#### Acceptance Criteria

1. WHEN 사용자가 데스크톱에서 접속 THEN 시스템 SHALL 데스크톱에 최적화된 레이아웃을 표시한다
2. WHEN 사용자가 모바일에서 접속 THEN 시스템 SHALL 모바일에 최적화된 레이아웃을 표시한다
3. WHEN 화면 크기가 변경 THEN 시스템 SHALL 자동으로 레이아웃을 조정한다

### Requirement 6: 스마트 검색 및 추천 시스템

**User Story:** As a 사용자, I want 검색 기록을 확인하고 관련 장소를 추천받을 수 있기를, so that 더 편리하게 원하는 장소를 찾을 수 있다

#### Acceptance Criteria

1. WHEN 사용자가 장소를 검색 THEN 시스템 SHALL 검색 기록을 로컬 스토리지에 저장한다
2. WHEN 사용자가 검색창을 클릭 THEN 시스템 SHALL "최근 검색" 목록을 표시한다
3. WHEN 사용자가 특정 장소를 검색 THEN 시스템 SHALL "혹시 이런 장소를 찾으시나요?" 문구와 함께 관련 장소들을 추천한다
4. WHEN 추천 장소를 생성 THEN 시스템 SHALL 검색된 장소와 유사한 키워드를 가진 장소들을 포함한다
5. WHEN 추천 장소를 생성 THEN 시스템 SHALL 검색된 장소와 다른 카테고리의 관련 장소들도 포함한다
6. WHEN 추천 목록을 표시 THEN 시스템 SHALL 검색된 장소는 추천 목록에서 제외한다

### Requirement 7: MSA 아키텍처 지원

**User Story:** As a 개발자, I want 서비스를 확장 가능한 마이크로서비스 아키텍처로 구성할 수 있기를, so that EKS 클러스터에 효율적으로 배포하고 향후 추가 서비스를 쉽게 확장할 수 있다

#### Acceptance Criteria

1. WHEN 시스템을 설계 THEN 시스템 SHALL 프론트엔드와 백엔드 API 서비스로 분리한다
2. WHEN 각 서비스를 개발 THEN 시스템 SHALL 독립적으로 배포 가능한 컨테이너로 구성한다
3. WHEN 백엔드 서비스를 구성 THEN 시스템 SHALL 향후 혼잡도 예측, 혼잡도 비교 서비스 추가를 고려한 확장 가능한 구조로 설계한다
4. WHEN EKS에 배포 THEN 시스템 SHALL Kubernetes 매니페스트를 통해 배포 가능해야 한다