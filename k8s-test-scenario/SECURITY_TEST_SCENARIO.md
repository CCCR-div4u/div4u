# 🔒 div4u Kubernetes 보안 검사 워크플로우 테스트 시나리오

## ⚠️ 중요 안내
**이 테스트는 feature/k8s-security-scan 브랜치에서만 실행되며, 메인 브랜치에는 절대 영향을 주지 않습니다.**

## 📋 테스트 개요

### 목적
- div4u Kubernetes 보안 검사 워크플로우의 정상 작동 확인
- Checkov 보안 스캔 도구의 취약점 탐지 능력 검증
- OpenAI 분석 및 GitHub Issue 자동 생성 기능 테스트
- Slack 알림 시스템 동작 확인

### 테스트 환경
- **브랜치**: `feature/k8s-security-scan` (격리된 테스트 환경)
- **워크플로우**: `.github/workflows/k8s-security-scan.yaml`
- **테스트 파일**: 
  - `k8s/test-vulnerable-deployment.yaml`
  - `k8s/test-insecure-pod.yaml`

## 🎯 테스트 시나리오

### 시나리오 1: 취약점 탐지 테스트
**목표**: Checkov가 다양한 보안 취약점을 정확히 탐지하는지 확인

#### 예상 탐지 취약점 (총 20+ 개)

##### Critical 레벨 (즉시 수정 필요)
1. **Privileged Container** - `privileged: true`
2. **Host Network Access** - `hostNetwork: true`
3. **Host PID Namespace** - `hostPID: true`
4. **Docker Socket Mount** - `/var/run/docker.sock` 마운트
5. **Root Filesystem Mount** - 호스트 `/` 디렉터리 마운트

##### High 레벨 (우선 수정 필요)
6. **Root User Execution** - `runAsUser: 0`
7. **Privilege Escalation** - `allowPrivilegeEscalation: true`
8. **Dangerous Capabilities** - `SYS_ADMIN`, `NET_ADMIN` 등
9. **Hardcoded Secrets** - 환경변수에 패스워드/API 키
10. **Excessive RBAC Permissions** - 모든 리소스에 대한 전체 권한

##### Medium 레벨 (검토 필요)
11. **Missing Resource Limits** - CPU/Memory 제한 없음
12. **Outdated Images** - `nginx:1.14`, `ubuntu:16.04`
13. **Insecure Ports** - SSH(22), MySQL(3306) 포트 노출
14. **ConfigMap Secrets** - ConfigMap에 민감 정보 저장
15. **NodePort Exposure** - 고정 NodePort 사용

##### Low 레벨 (개선 권장)
16. **Read-Write Root Filesystem** - `readOnlyRootFilesystem: false`
17. **Default Service Account** - 기본 서비스 어카운트 사용
18. **Missing Security Context** - Pod 레벨 보안 컨텍스트 없음
19. **Debug Mode Enabled** - 프로덕션에서 디버그 모드
20. **Weak Base64 Encoding** - Secret의 약한 인코딩

### 시나리오 2: 워크플로우 단계별 테스트

#### 2.1 변경사항 감지 (detect-changes)
- **입력**: k8s/ 디렉터리 내 YAML 파일 변경
- **예상 결과**: `should_scan: true`, `scan_reason: k8s 디렉터리 변경`

#### 2.2 보안 스캔 실행 (security-scan)
- **Checkov 설치**: Python 3.11 + Checkov 최신 버전
- **매니페스트 수집**: 모든 YAML 파일을 `results/all-manifests.yaml`로 통합
- **스캔 실행**: JSON 및 SARIF 형식으로 결과 생성
- **예상 결과**: 20+ 개의 보안 이슈 탐지

#### 2.3 OpenAI 분석 (openai-analysis)
- **입력**: Checkov JSON 결과
- **처리**: GPT-4o-mini 모델로 한국어 분석 보고서 생성
- **예상 결과**: 
  - 상세한 보안 분석 보고서 (한국어)
  - 우선순위별 이슈 분류
  - 구체적인 수정 방법 제시

#### 2.4 GitHub Issue 생성 (create-issue)
- **조건**: `issue_count != '0'` (보안 이슈 발견 시에만)
- **예상 결과**:
  - Issue 제목: "🔒 div4u K8s 보안 검사 결과: 20+개 이슈 발견 (CRITICAL)"
  - 라벨: `['security', 'kubernetes', 'checkov', 'critical']`
  - 상세한 분석 보고서 및 조치 방법 포함
  - 완료 체크리스트 제공

#### 2.5 Slack 알림 (slack-notification)
- **조건**: 항상 실행 (`if: always()`)
- **예상 결과**:
  - 🚨 이모지와 함께 보안 이슈 발견 알림
  - 발견된 이슈 개수 표시
  - GitHub Issue 링크 버튼 제공

#### 2.6 SARIF 업로드 (upload-sarif)
- **대상**: GitHub Security 탭
- **예상 결과**: Code Scanning 결과에 Checkov 보안 이슈 표시

#### 2.7 아티팩트 업로드 (upload-artifacts)
- **포함 파일**: 
  - `reports/checkov-results.json`
  - `reports/checkov-results.sarif`
  - `results/all-manifests.yaml`
- **보존 기간**: 30일

## 🧪 테스트 실행 방법

### 자동 트리거 (권장)
```bash
# 1. 취약한 테스트 파일 푸시 (이미 완료)
git add k8s/test-*.yaml
git commit -m "test: 보안 검사 워크플로우 테스트"
git push origin feature/k8s-security-scan

# 2. GitHub Actions에서 자동 실행 확인
# - PR 생성 시 자동 트리거
# - k8s/ 디렉터리 변경 감지로 자동 실행
```

### 수동 트리거
```bash
# GitHub CLI 사용
gh workflow run k8s-security-scan.yaml --ref feature/k8s-security-scan

# 또는 GitHub 웹 인터페이스에서
# Actions > Kubernetes Security Scan > Run workflow
```

## ✅ 예상 테스트 결과

### 성공 시나리오
1. **워크플로우 실행**: ✅ 모든 단계 성공적 완료
2. **취약점 탐지**: ✅ 20+ 개 보안 이슈 발견
3. **OpenAI 분석**: ✅ 한국어 보안 보고서 생성
4. **GitHub Issue**: ✅ 상세한 보안 이슈 보고서 자동 생성
5. **Slack 알림**: ✅ 보안 이슈 발견 알림 전송
6. **SARIF 업로드**: ✅ GitHub Security 탭에 결과 표시
7. **아티팩트**: ✅ 모든 결과 파일 30일간 보존

### 실패 시나리오 대응
- **Checkov 실행 실패**: 빈 JSON 파일 생성으로 후속 단계 계속 진행
- **OpenAI API 실패**: 기본 보고서 생성으로 대체
- **Slack 알림 실패**: 로그에 오류 기록, 워크플로우는 계속 진행
- **Issue 생성 실패**: 로그에 오류 기록, 다른 단계는 정상 진행

## 📊 성능 지표

### 예상 실행 시간
- **전체 워크플로우**: 3-5분
- **Checkov 스캔**: 30-60초
- **OpenAI 분석**: 10-30초
- **Issue/알림 생성**: 5-10초

### 리소스 사용량
- **Runner**: ubuntu-latest (GitHub-hosted)
- **Python**: 3.11
- **메모리**: 일반적인 GitHub Actions 제한 내
- **스토리지**: 아티팩트 약 1-5MB

## 🔍 검증 체크리스트

### 워크플로우 실행 후 확인사항
- [ ] GitHub Actions에서 워크플로우 성공 완료
- [ ] 새로운 GitHub Issue 생성 확인
- [ ] Issue에 상세한 보안 분석 보고서 포함 확인
- [ ] Issue 라벨이 올바르게 설정됨 (`security`, `kubernetes`, `checkov`, `critical`)
- [ ] Slack 채널에 보안 알림 수신 확인
- [ ] GitHub Security 탭에 Code Scanning 결과 표시 확인
- [ ] Actions 아티팩트에서 결과 파일 다운로드 가능 확인

### 보안 이슈 내용 검증
- [ ] Critical 이슈들이 올바르게 탐지됨
- [ ] High 이슈들이 올바르게 분류됨
- [ ] 한국어 분석 보고서가 이해하기 쉽게 작성됨
- [ ] 구체적인 수정 방법이 제시됨
- [ ] 완료 체크리스트가 포함됨

## 🧹 테스트 후 정리

### 테스트 파일 제거
```bash
# 테스트 완료 후 취약한 파일들 제거
git rm k8s/test-vulnerable-deployment.yaml
git rm k8s/test-insecure-pod.yaml
git commit -m "cleanup: 보안 테스트 파일 제거"
git push origin feature/k8s-security-scan
```

### 생성된 Issue 정리
- 테스트로 생성된 GitHub Issue는 수동으로 닫기
- 라벨을 `test-completed`로 변경하여 테스트 완료 표시

## 📝 테스트 결과 기록

### 실행 정보
- **테스트 일시**: 2025-08-20 21:11 UTC
- **브랜치**: feature/k8s-security-scan
- **커밋 해시**: [실행 후 기록]
- **워크플로우 실행 ID**: [실행 후 기록]

### 결과 요약
- **탐지된 이슈 수**: [실행 후 기록]
- **생성된 Issue 번호**: [실행 후 기록]
- **실행 시간**: [실행 후 기록]
- **성공/실패 여부**: [실행 후 기록]

---
---

**⚠️ 주의사항**: 이 테스트는 feature 브랜치에서만 실행되며, 메인 브랜치에는 절대 영향을 주지 않습니다. 테스트 완료 후 취약한 파일들은 반드시 제거해야 합니다.
