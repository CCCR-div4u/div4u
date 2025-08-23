# ZAP DAST Configuration

이 디렉토리는 OWASP ZAP을 이용한 DAST(Dynamic Application Security Testing) 스캔 설정을 포함합니다.

## 파일 설명

### rules.tsv
- ZAP 스캔 규칙 설정 파일
- 특정 취약점 검사를 IGNORE하여 false positive를 줄임
- 주로 정보성 알림이나 낮은 위험도 항목들을 제외

### context.xml
- ZAP 스캔 컨텍스트 설정
- 스캔 대상 URL 패턴 정의
- 제외할 리소스 패턴 설정 (CSS, JS, 이미지 파일 등)
- 기술 스택 정보 설정

### policy.policy
- ZAP 스캔 정책 설정
- 각 취약점 검사의 강도와 레벨 설정
- 중요한 보안 취약점에 집중

## DAST 스캔 실행

DAST 스캔은 **staging 환경에서만** 자동으로 실행됩니다:

1. GitHub Actions 워크플로우에서 staging 배포 후 실행
2. ZAP Full Scan을 통해 웹 애플리케이션 보안 검사
3. 결과를 Slack으로 알림 및 GitHub Artifacts에 저장

## 스캔 결과

- **High Risk**: 즉시 수정이 필요한 심각한 보안 취약점
- **Medium Risk**: 보안 강화를 위해 수정 권장
- **Low Risk**: 정보성 또는 낮은 위험도 항목

## 설정 수정

필요에 따라 다음 파일들을 수정할 수 있습니다:

- `rules.tsv`: 특정 규칙을 활성화/비활성화
- `context.xml`: 스캔 범위 조정
- `policy.policy`: 스캔 강도 조정