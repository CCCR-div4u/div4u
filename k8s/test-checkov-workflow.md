# Checkov 워크플로우 테스트

이 파일은 Checkov 보안 검사 워크플로우를 테스트하기 위해 생성되었습니다.

## 테스트 목적
- k8s 디렉터리 변경 감지 확인
- GitHub Actions 워크플로우 트리거 테스트
- OpenAI 분석 및 보고서 생성 테스트
- GitHub Issue 자동 생성 테스트
- Slack 알림 테스트

## 생성 시간
2025-08-20 13:42 UTC

## 워크플로우 기능
1. Checkov를 사용한 Kubernetes 매니페스트 보안 검사
2. OpenAI API를 통한 결과 분석
3. GitHub Issue 자동 생성/업데이트
4. Slack 알림 발송
5. PR 코멘트 추가

이 파일을 푸시하면 워크플로우가 자동으로 실행됩니다.
