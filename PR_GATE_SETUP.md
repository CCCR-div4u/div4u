# Kubernetes PR Gate 설정 가이드

## 개요

이 문서는 div4u 레포지토리의 Kubernetes 보안 스캔 PR Gate 기능 설정 방법을 설명합니다.

## 빠른 설정

### 1. 환경변수 설정

GitHub 레포지토리 → Settings → Secrets and variables → Actions → Variables

```
Name: FAIL_ON_SEVERITY
Value: medium  # 권장값
```

### 2. 브랜치 보호 규칙 설정

GitHub 레포지토리 → Settings → Branches → Add rule

- **Branch name pattern**: `main`
- **Require status checks**: ✅
- **Required status check**: `Kubernetes Security Analysis`

## 임계치 설정 가이드

### 권장 설정: `medium`

```bash
FAIL_ON_SEVERITY=medium
```

**차단 조건:**
- Critical 이슈 ≥ 1개
- High 이슈 ≥ 3개
- Medium 이슈 ≥ 5개

**적용 이유:**
- Kubernetes는 컨테이너 보안이 중요하므로 Medium 이슈까지 관리
- div4u는 웹 애플리케이션으로 보안 취약점이 직접적인 위험

### 대안 설정

#### 엄격한 보안 정책
```bash
FAIL_ON_SEVERITY=low
```
- 총 이슈 ≥ 10개 차단

#### 개발 환경용
```bash
FAIL_ON_SEVERITY=high
```
- Critical ≥ 1개 또는 High ≥ 3개

#### 모니터링만
```bash
FAIL_ON_SEVERITY=none
```
- 차단하지 않고 알림만 제공

## 일반적인 Kubernetes 보안 이슈

### Critical 이슈 예시
- 컨테이너가 root 권한으로 실행
- 호스트 네트워크 모드 사용
- 권한 있는 컨테이너 실행

### High 이슈 예시
- Liveness/Readiness Probe 미설정
- 리소스 제한 미설정
- 보안 컨텍스트 미설정

### Medium 이슈 예시
- 이미지 태그에 'latest' 사용
- 환경변수에 민감 정보 노출
- 네트워크 정책 미설정

### 해결 방법
1. Checkov 문서 참조: https://www.checkov.io/5.Policy%20Index/kubernetes.html
2. Kubernetes 보안 모범 사례 적용
3. 생성된 GitHub Issue의 수정 가이드 참조

## 테스트 방법

### 1. 취약한 Kubernetes 매니페스트로 테스트

k8s-test-scenario 디렉터리에 다음 파일 생성:

```yaml
# k8s-test-scenario/test-vulnerable-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vulnerable-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: vulnerable-app
  template:
    metadata:
      labels:
        app: vulnerable-app
    spec:
      containers:
      - name: app
        image: nginx:latest  # 취약점: latest 태그 사용
        ports:
        - containerPort: 80
        securityContext:
          runAsUser: 0  # 취약점: root 권한으로 실행
          privileged: true  # 취약점: 권한 있는 컨테이너
        # 취약점: 리소스 제한 없음
        # 취약점: Liveness/Readiness Probe 없음
```

### 2. PR 생성 후 워크플로 확인

1. k8s-test-scenario 디렉터리에 위 파일을 커밋하여 PR 생성
2. GitHub Actions에서 "Kubernetes Security Analysis" 워크플로 실행 확인
3. PR Gate 차단 동작 확인

## 보안 이슈 해결 예시

### 안전한 Deployment 예시

```yaml
# k8s-test-scenario/secure-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: secure-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: secure-app
  template:
    metadata:
      labels:
        app: secure-app
    spec:
      containers:
      - name: app
        image: nginx:1.21.6  # 구체적인 버전 태그 사용
        ports:
        - containerPort: 80
        securityContext:
          runAsNonRoot: true  # 비root 사용자로 실행
          runAsUser: 1000
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        resources:  # 리소스 제한 설정
          limits:
            cpu: 500m
            memory: 512Mi
          requests:
            cpu: 250m
            memory: 256Mi
        livenessProbe:  # Liveness Probe 설정
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:  # Readiness Probe 설정
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 문제 해결

### PR Gate가 예상대로 작동하지 않는 경우

1. **환경변수 확인**
   ```bash
   # GitHub Actions 로그에서 확인
   🚪 PR Gate 검사 시작 (임계치: medium)
   ```

2. **스캔 대상 확인**
   - k8s-test-scenario 디렉터리에 변경사항이 있는지 확인
   - YAML 파일이 올바른 형식인지 확인

3. **브랜치 보호 규칙 확인**
   - Settings → Branches에서 규칙 확인
   - "Kubernetes Security Analysis" 체크 상태 확인

### 긴급 머지가 필요한 경우

1. **임시 설정 변경**
   ```bash
   FAIL_ON_SEVERITY=none
   ```

2. **관리자 권한 사용**
   - 브랜치 보호 규칙 일시 비활성화
   - 머지 후 즉시 복원

## div4u 프로젝트 특화 가이드

### 주요 보안 고려사항

1. **웹 애플리케이션 보안**
   - 컨테이너 권한 최소화
   - 네트워크 정책 적용
   - 시크릿 관리 강화

2. **마이크로서비스 아키텍처**
   - 서비스 간 통신 보안
   - RBAC 설정
   - 이미지 보안 스캔

### 권장 보안 설정

```yaml
# 모든 Deployment에 적용할 기본 보안 설정
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
    - ALL

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

## 모니터링

### 주요 메트릭
- k8s-test-scenario 디렉터리 변경 빈도
- 컨테이너 보안 이슈 발견 빈도
- 이미지 보안 스캔 결과

### 정기 검토 항목
- 컨테이너 이미지 업데이트 주기
- 보안 정책 적용 현황
- 개발팀 보안 인식 수준

## 관련 문서

- [div4u 프로젝트 README](README.md)
- [Kubernetes 보안 가이드](KUBERNETES.md)
- [Checkov Kubernetes 규칙](https://www.checkov.io/5.Policy%20Index/kubernetes.html)
- [Kubernetes 공식 보안 문서](https://kubernetes.io/docs/concepts/security/)