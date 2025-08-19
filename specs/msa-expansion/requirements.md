# Requirements Document

## Introduction

기존 div4u 서울 혼잡도 서비스를 점진적으로 마이크로서비스 아키텍처(MSA)로 확장하는 시스템입니다. 기존 서비스(Frontend + Core API)는 그대로 유지하면서, 새로운 기능들을 독립적인 마이크로서비스로 추가합니다. 첫 번째 단계로 혼잡도 비교 서비스를 구현하고, 이후 단계적으로 예측 및 지도 서비스를 추가할 예정입니다. 각 새로운 서비스는 기존 시스템에 영향을 주지 않고 독립적으로 배포됩니다.

## Requirements

### Requirement 1: 혼잡도 비교 서비스 (Comparison Service)

**User Story:** As a 사용자, I want 여러 장소의 혼잡도를 동시에 비교할 수 있기를, so that 가장 덜 혼잡한 장소를 선택할 수 있다

#### Acceptance Criteria

1. WHEN 사용자가 혼잡도 비교 페이지에 접속 THEN 시스템 SHALL 최대 10개 장소를 동시에 비교할 수 있는 인터페이스를 제공한다
2. WHEN 사용자가 장소를 추가 THEN 시스템 SHALL 실시간으로 해당 장소의 혼잡도를 조회하여 비교 목록에 추가한다
3. WHEN 비교 목록에 2개 이상의 장소가 있을 때 THEN 시스템 SHALL 가장 혼잡한 곳과 가장 여유로운 곳을 하이라이트하여 표시한다
4. WHEN 비교 결과를 표시 THEN 시스템 SHALL 혼잡도 순위, 색상 코딩, 추천 메시지를 제공한다
5. WHEN 사용자가 비교 목록을 업데이트 THEN 시스템 SHALL 실시간으로 순위를 재계산하여 표시한다

### Requirement 2: 혼잡도 예측 서비스 (Prediction Service)

**User Story:** As a 사용자, I want 특정 장소의 12시간 후까지의 혼잡도 예측을 받을 수 있기를, so that 방문 시간을 미리 계획할 수 있다

#### Acceptance Criteria

1. WHEN 사용자가 예측 서비스를 요청 THEN 시스템 SHALL 서울시 공공 API의 예측 데이터를 활용하여 12시간 후까지의 혼잡도를 제공한다
2. WHEN 예측 결과를 제공 THEN 시스템 SHALL 시간대별 혼잡도 그래프와 최적 방문 시간을 추천한다
3. WHEN 예측 데이터를 표시 THEN 시스템 SHALL 1시간 단위로 구분된 예측 혼잡도와 신뢰도를 제공한다
4. WHEN 현재 시간과 예측 시간을 비교 THEN 시스템 SHALL 혼잡도 변화 트렌드를 시각적으로 표시한다
5. WHEN 예측 데이터가 없을 때 THEN 시스템 SHALL 현재 혼잡도 기반 일반적인 패턴 정보를 제공한다

### Requirement 3: 지도 기반 혼잡도 서비스 (Map Service)

**User Story:** As a 사용자, I want 지도상에서 서울시 전체 혼잡도를 한눈에 볼 수 있기를, so that 지역별 혼잡도를 직관적으로 파악할 수 있다

#### Acceptance Criteria

1. WHEN 사용자가 지도 서비스에 접속 THEN 시스템 SHALL 서울시 지도 위에 120개 장소의 혼잡도를 색상으로 표시한다
2. WHEN 지도에서 특정 장소를 클릭 THEN 시스템 SHALL 해당 장소의 상세 혼잡도 정보를 팝업으로 표시한다
3. WHEN 혼잡도 데이터를 시각화 THEN 시스템 SHALL 색상 코딩(빨강-붐빔, 주황-약간붐빔, 노랑-보통, 초록-여유)으로 표시한다
4. WHEN 사용자가 지도를 확대/축소 THEN 시스템 SHALL 적절한 클러스터링과 마커 크기 조정을 제공한다
5. WHEN 실시간 업데이트가 필요 THEN 시스템 SHALL 5분마다 자동으로 혼잡도 데이터를 갱신한다

### Requirement 4: 점진적 MSA 아키텍처 구현

**User Story:** As a 개발자, I want 기존 서비스에 영향을 주지 않고 새로운 기능을 독립적인 마이크로서비스로 추가할 수 있기를, so that 안정성을 유지하면서 확장할 수 있다

#### Acceptance Criteria

1. WHEN 새로운 서비스를 추가 THEN 시스템 SHALL 기존 Frontend와 Core API 서비스는 그대로 유지한다
2. WHEN Comparison Service를 구현 THEN 시스템 SHALL 기존 서비스와 독립적으로 개발하고 배포할 수 있다
3. WHEN 새로운 서비스가 실패 THEN 시스템 SHALL 기존 실시간 혼잡도 서비스는 정상 작동을 유지한다
4. WHEN 서비스를 배포 THEN 시스템 SHALL 기존 Kubernetes 클러스터에 새로운 Pod를 추가하는 방식으로 배포한다
5. WHEN 서비스 간 통신이 필요 THEN 시스템 SHALL 기존 Core API를 통해 데이터를 공유하거나 직접 서울시 API를 호출한다

### Requirement 5: 서비스 간 통신 및 데이터 동기화

**User Story:** As a 시스템, I want 마이크로서비스 간 효율적으로 데이터를 공유할 수 있기를, so that 일관된 사용자 경험을 제공할 수 있다

#### Acceptance Criteria

1. WHEN Core API가 혼잡도 데이터를 조회 THEN 시스템 SHALL 해당 데이터를 다른 서비스와 공유할 수 있다
2. WHEN Comparison Service가 여러 장소를 비교 THEN 시스템 SHALL Core API를 통해 실시간 데이터를 조회한다
3. WHEN Prediction Service가 예측을 수행 THEN 시스템 SHALL 서울시 API의 예측 데이터를 효율적으로 조회할 수 있다
4. WHEN Map Service가 지도를 렌더링 THEN 시스템 SHALL 모든 장소의 혼잡도 데이터를 일괄 조회할 수 있다
5. WHEN 데이터 불일치가 발생 THEN 시스템 SHALL 자동으로 데이터 동기화를 수행한다

### Requirement 6: 단계적 프론트엔드 확장

**User Story:** As a 사용자, I want 기존 서비스는 그대로 이용하면서 새로운 기능도 사용할 수 있기를, so that 서비스 중단 없이 향상된 기능을 경험할 수 있다

#### Acceptance Criteria

1. WHEN 사용자가 메인 페이지에 접속 THEN 시스템 SHALL 기존 서비스 카드는 그대로 유지하고 새로운 비교 서비스 카드를 추가한다
2. WHEN 사용자가 기존 서비스를 선택 THEN 시스템 SHALL 기존과 동일하게 작동한다
3. WHEN 사용자가 새로운 비교 서비스를 선택 THEN 시스템 SHALL 새로운 Comparison Service API를 호출한다
4. WHEN 새로운 서비스가 불가능 THEN 시스템 SHALL 기존 서비스는 정상 작동하고 새 서비스만 폴백 메시지를 표시한다
5. WHEN 향후 서비스를 추가 THEN 시스템 SHALL 기존 서비스에 영향 없이 새로운 메뉴와 페이지를 추가할 수 있다

### Requirement 7: 기존 서비스 안정성 보장

**User Story:** As a 운영자, I want 새로운 서비스 추가가 기존 서비스에 영향을 주지 않기를, so that 서비스 안정성을 유지할 수 있다

#### Acceptance Criteria

1. WHEN 새로운 서비스를 배포 THEN 시스템 SHALL 기존 Frontend와 Core API Pod는 재시작하지 않는다
2. WHEN 새로운 서비스에 오류가 발생 THEN 시스템 SHALL 기존 실시간 혼잡도 조회 기능은 정상 작동한다
3. WHEN 새로운 서비스가 높은 부하를 받을 때 THEN 시스템 SHALL 기존 서비스의 성능에 영향을 주지 않는다
4. WHEN 데이터베이스를 사용 THEN 시스템 SHALL 새로운 서비스는 별도의 데이터베이스 또는 스키마를 사용한다
5. WHEN 서울시 API를 호출 THEN 시스템 SHALL 새로운 서비스는 독립적인 API 키와 호출 제한을 관리한다

### Requirement 8: 성능 및 모니터링

**User Story:** As a 운영자, I want 각 마이크로서비스의 성능을 모니터링할 수 있기를, so that 시스템 안정성을 보장할 수 있다

#### Acceptance Criteria

1. WHEN 각 서비스가 실행 THEN 시스템 SHALL 헬스체크 엔드포인트를 제공한다
2. WHEN 서비스 호출이 발생 THEN 시스템 SHALL 응답 시간과 성공률을 로깅한다
3. WHEN 서비스 부하가 증가 THEN 시스템 SHALL 자동으로 Pod를 스케일링한다
4. WHEN 서비스 오류가 발생 THEN 시스템 SHALL 알림을 발송하고 로그를 기록한다
5. WHEN 시스템 메트릭을 조회 THEN 시스템 SHALL Grafana 대시보드를 통해 실시간 모니터링을 제공한다