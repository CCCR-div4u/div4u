# Harbor 보안 스캔 및 SBOM 설정 가이드

## 🛡️ 자동 보안 스캔 설정

Harbor에서 이미지 push 후 자동으로 Trivy 스캔과 SBOM을 생성하도록 설정되었습니다.

### 설정된 기능

1. **자동 스캔**: 이미지 push 시 자동으로 Trivy 보안 스캔 실행
2. **SBOM 생성**: Software Bill of Materials 자동 생성
3. **취약점 차단**: 심각한 취약점이 있는 이미지 배포 방지
4. **서명 검증**: Cosign을 통한 이미지 서명 및 검증

### Harbor 프로젝트 설정

```bash
# Harbor 설정 스크립트 실행
./scripts/configure-harbor.sh
```

### 설정 내용

- **프로젝트명**: `div4u-staging`, `div4u-production`
- **자동 스캔**: 활성화 (모든 심각도 레벨)
- **SBOM 생성**: 활성화
- **이미지 서명**: Cosign 사용

### 스캔 결과 확인

1. **Harbor UI**: 
   - Staging: `https://harbor.bluesunnywings.com/harbor/projects/div4u-staging/repositories`
   - Production: `https://harbor.bluesunnywings.com/harbor/projects/div4u-production/repositories`

2. **API 조회**:
   ```bash
   curl -H "Authorization: Basic $(echo -n 'username:password' | base64)" \
        "https://harbor.bluesunnywings.com/api/v2.0/projects/div4u-staging/repositories/div4u-frontend/artifacts/latest/scan"
   ```

### SBOM 다운로드

```bash
# SBOM 다운로드
curl -H "Authorization: Basic $(echo -n 'username:password' | base64)" \
     "https://harbor.bluesunnywings.com/api/v2.0/projects/div4u-staging/repositories/div4u-frontend/artifacts/latest/additions/sboms" \
     -o sbom.json
```

### 취약점 리포트 확인

Harbor UI에서 각 이미지의 취약점 상세 정보를 확인할 수 있습니다:
- Critical/High 취약점 목록
- CVE 상세 정보
- 수정 권장사항

### 자동화된 워크플로우

1. 코드 push → GitHub Actions 트리거
2. 보안 스캔 (Trivy) 실행
3. Harbor 프로젝트 설정 확인/업데이트
4. 이미지 빌드 및 push
5. Harbor 자동 스캔 트리거
6. SBOM 자동 생성
7. 취약점 검사 및 배포 승인/차단

이 설정으로 모든 이미지가 자동으로 보안 검사를 받고, 안전한 이미지만 배포됩니다.