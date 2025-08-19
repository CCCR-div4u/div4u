# 개발 가이드 🚀

## 현재 상황
- Docker/Kubernetes 설정 완료 ✅
- 팀원이 GitHub Actions CI/CD 구현 예정 🔄
- 서비스 추가 개발 필요 🛠️

## 브랜치 전략

### 메인 브랜치
- `main` - 프로덕션 준비 완료 코드
- `develop` - 개발 통합 브랜치

### 기능 브랜치
- `feature/service-improvements` - 서비스 기능 개선
- `feature/cicd-setup` - CI/CD 파이프라인 구축
- `feature/ui-enhancements` - UI/UX 개선
- `feature/performance-optimization` - 성능 최적화

## 개발 워크플로우

### 1. 서비스 수정 작업
```bash
# 새 기능 브랜치 생성
git checkout -b feature/service-improvements

# 개발 작업 진행
# - 프론트엔드/백엔드 코드 수정
# - 새로운 기능 추가
# - 버그 수정

# 로컬 테스트
npm run dev  # 또는 docker-compose -f docker-compose.dev.yml up

# 커밋 및 푸시
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin feature/service-improvements
```

### 2. CI/CD 구축 작업 (팀원)
```bash
# CI/CD 브랜치 생성
git checkout -b feature/cicd-setup

# GitHub Actions 워크플로우 생성
mkdir -p .github/workflows
# workflow 파일들 생성

# Docker/K8s 설정 검증 및 수정
# CI/CD 파이프라인 테스트

git add .
git commit -m "ci: GitHub Actions CI/CD 파이프라인 추가"
git push origin feature/cicd-setup
```

### 3. 통합 및 배포
```bash
# develop 브랜치로 머지
git checkout develop
git merge feature/service-improvements
git merge feature/cicd-setup

# 테스트 및 검증 후 main으로 머지
git checkout main
git merge develop

# 자동 배포 (CI/CD 파이프라인 실행)
```

## 🔧 개발 환경 설정

### 로컬 개발
```bash
# 개발 서버 실행
npm run dev  # 프론트엔드/백엔드 각각

# 또는 Docker Compose 사용
docker-compose -f docker-compose.dev.yml up
```

### Docker 테스트
```bash
# 이미지 빌드 및 테스트
./docker-scripts.sh dev

# 프로덕션 환경 테스트
./docker-scripts.sh prod
```

### Kubernetes 테스트
```bash
# 로컬 클러스터에 배포
cd k8s
./deploy.sh deploy

# 상태 확인
./deploy.sh status
```

## 📋 주의사항

### Docker/K8s 설정 수정 시
1. **Dockerfile 수정** 시 이미지 빌드 테스트 필수
2. **docker-compose.yml 수정** 시 로컬 환경에서 검증
3. **K8s 매니페스트 수정** 시 로컬 클러스터에서 테스트
4. **포트 변경** 시 모든 설정 파일 동기화

### CI/CD 파이프라인 고려사항
1. **환경변수** 관리 (GitHub Secrets)
2. **Docker 이미지 태깅** 전략
3. **테스트 자동화** 포함
4. **배포 전략** (Blue-Green, Rolling Update)

## 🚨 충돌 방지 가이드

### 파일 수정 시 주의사항
```bash
# 이 파일들을 수정할 때는 팀원과 협의 필요
- Dockerfile
- docker-compose.yml
- k8s/*.yaml
- package.json (scripts 섹션)
- .env.example
```

### 커뮤니케이션
1. **큰 변경사항**은 사전에 팀원과 논의
2. **Docker/K8s 관련 수정**은 CI/CD 담당자와 협의
3. **포트나 환경변수 변경**은 반드시 공유

## 🎯 권장 작업 순서

### Phase 1: 서비스 개선 (현재)
- [ ] 기능 추가/수정
- [ ] 버그 수정
- [ ] UI/UX 개선
- [ ] 로컬 테스트

### Phase 2: CI/CD 구축 (팀원)
- [ ] GitHub Actions 워크플로우 작성
- [ ] Docker 이미지 자동 빌드
- [ ] 테스트 자동화
- [ ] K8s 자동 배포

### Phase 3: 통합 테스트
- [ ] CI/CD 파이프라인 테스트
- [ ] 전체 시스템 통합 테스트
- [ ] 성능 테스트
- [ ] 보안 검증

### Phase 4: 프로덕션 배포
- [ ] 프로덕션 환경 설정
- [ ] 모니터링 설정
- [ ] 로그 수집 설정
- [ ] 백업 전략 수립

## 📞 문제 발생 시

### Docker 관련 문제
```bash
# 컨테이너 로그 확인
docker-compose logs

# 이미지 재빌드
docker-compose build --no-cache
```

### K8s 관련 문제
```bash
# Pod 상태 확인
kubectl get pods -n div4u

# 로그 확인
kubectl logs -f deployment/div4u-backend -n div4u
```

### CI/CD 관련 문제
- GitHub Actions 로그 확인
- Secrets 설정 확인
- 권한 문제 확인

---

**결론: 현재 디렉터리에서 브랜치 전략을 사용하여 안전하게 개발을 진행하는 것을 추천합니다! 🎉**