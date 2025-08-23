# div4u 보안 분석 스크립트

이 디렉터리는 div4u 프로젝트의 Kubernetes 매니페스트 보안 분석을 위한 스크립트를 포함합니다.

## 파일 구조

- `analyze_security.py`: Checkov 보안 스캔 결과 분석 및 OpenAI 연동 스크립트

## 사용법

### 기본 사용법
```bash
python scripts/analyze_security.py checkov-results.json kubernetes
```

### 매개변수
- `checkov-results.json`: Checkov에서 생성된 JSON 결과 파일
- `kubernetes`: 프로젝트 타입 (kubernetes 또는 terraform)

## 환경변수

### 필수 환경변수
- `OPENAI_API_KEY`: OpenAI API 키 (선택적, 없으면 기본 리포트 생성)

### 선택적 환경변수
- `MAX_ISSUES_FOR_AI`: OpenAI로 전송할 최대 이슈 수 (기본값: 15)

## 기능

### 1. 보안 이슈 분류
- 심각도별 분류 (Critical, High, Medium, Low, Unknown)
- 우선순위별 정렬 및 상위 이슈 추출

### 2. OpenAI 분석
- gpt-4o-mini 모델을 사용한 한국어 보안 분석 리포트 생성
- 프로젝트별 맞춤 프롬프트 적용
- API 실패 시 자동 Fallback 리포트 생성

### 3. 보안 강화
- 소스 코드 제외하고 메타데이터만 OpenAI로 전송
- 에러 핸들링 및 안정성 보장

## 출력 형식

### 성공 시
```markdown
## div4u Kubernetes 보안 검사 결과

### 📊 요약
- 총 이슈: N개
- Critical: X개, High: Y개, Medium: Z개, Low: W개

### 🚨 우선 조치 필요 (Critical + High)
1. 이슈명 (심각도)
   - 파일: 경로
   - 리소스: 리소스명
   - 설명: 설명

### 💡 권장 조치사항
- 보안 컨텍스트 설정
- 리소스 제한 설정
- 네트워크 정책 적용
- 이미지 보안 강화
- 권한 최소화
```

### 이슈 없음
```
✅ 보안 이슈가 발견되지 않았습니다. 모든 검사를 통과했습니다!
```

## GitHub Actions 연동

이 스크립트는 `.github/workflows/k8s-security-scan.yaml` 워크플로에서 자동으로 실행됩니다:

1. **트리거**: k8s-test-scenario 디렉터리 변경 시
2. **스캔**: Checkov를 사용한 Kubernetes 보안 검사
3. **분석**: 이 스크립트를 통한 결과 분석
4. **리포팅**: GitHub Issue 생성 및 Slack 알림

## 요구사항 매핑

- **Requirement 2.1**: 심각도별 분류 및 OpenAI 분석
- **Requirement 2.2**: Fallback 리포트 생성
- **Requirement 5.1**: 소스 코드 제외한 메타데이터만 전송
- **Requirement 7.2**: 에러 핸들링 및 안정성 보장

## 문제 해결

### OpenAI API 오류
- API 키 확인: GitHub 시크릿에 `OPENAI_API_KEY` 설정
- 레이트 제한: 자동 재시도 로직 포함
- 네트워크 오류: Fallback 리포트로 자동 전환

### JSON 파싱 오류
- 기본 JSON 구조 자동 생성
- 파일 없음 시 기본값 사용
- 잘못된 형식 시 안전한 처리

## 보안 고려사항

1. **데이터 최소화**: 소스 코드 전문은 OpenAI로 전송하지 않음
2. **시크릿 관리**: API 키는 GitHub 시크릿으로 안전하게 관리
3. **에러 처리**: 모든 외부 API 호출에 대한 안전한 에러 처리
4. **로깅**: 민감한 정보는 로그에 출력하지 않음