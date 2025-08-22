# Kubernetes Deployment Guide

## 🚀 배포 가이드

### ⚠️ 중요: 최초 배포 시 필수 사항
**처음 환경을 구축할 때는 반드시 수동 배포를 먼저 실행한 후 ArgoCD Application을 생성해야 합니다!**

---

## 📋 Staging 환경

### 1️⃣ 최초 배포
```bash
# 전체 리소스 + SealedSecret + ArgoCD Application 배포
./scripts/deploy-all.sh staging
```

### 2️⃣ 일반 재배포 (ArgoCD 자동 sync)
```bash
# Git push 후 ArgoCD가 자동으로 sync
# 단, SealedSecret 변경 시에는 다음 명령어로 수동 배포 필요:
./scripts/deploy-secrets.sh staging
```

### 3️⃣ 환경 삭제
```bash
# 전체 환경 삭제 (리소스 + SealedSecret + ArgoCD Application)
./scripts/delete-all.sh staging
```

---

## 🏭 Production 환경

### 1️⃣ 최초 배포
```bash
# 전체 리소스 + SealedSecret + ArgoCD Application 배포
./scripts/deploy-all.sh production
```

### 2️⃣ 일반 재배포 (ArgoCD 자동 sync)
```bash
# Git push 후 ArgoCD가 자동으로 sync
# 단, SealedSecret 변경 시에는 다음 명령어로 수동 배포 필요:
./scripts/deploy-secrets.sh production
```

### 3️⃣ 환경 삭제
```bash
# 전체 환경 삭제 (리소스 + SealedSecret + ArgoCD Application)
./scripts/delete-all.sh production
```

---

## 🔐 SealedSecret 관리

### 새로운 Secret 생성 및 암호화
```bash
# 1. 일반 Secret 파일 생성
kubectl create secret generic my-secret \
  --from-literal=key=value \
  --dry-run=client -o yaml > secret.yaml

# 2. SealedSecret으로 암호화 
# staging 환경
kubeseal --namespace div4u-staging -o yaml < secret.yaml > k8s/environments/staging/sealed-secret.yaml
# production 환경
kubeseal --namespace div4u-production -o yaml < secret.yaml > k8s/environments/production/sealed-secret.yaml


# 3. sealed-secrets.yaml에 추가 후 배포
./scripts/deploy-secrets.sh staging
./scripts/deploy-secrets.sh production

# (선택) 4. secret.yaml 평문 파일 삭제
rm secret.yaml
# 또는 백업
mv secret.yaml secret.yaml.back
```

---

## 🔄 GitOps 워크플로우

### ArgoCD가 자동 관리하는 리소스
- ✅ Deployment, Service, ConfigMap
- ✅ Ingress, HPA

### 수동으로 관리하는 리소스
- 🔐 SealedSecret (보안상 수동 배포)
- 📦 최초 환경 구축

**이렇게 하면 민감한 정보는 수동으로 안전하게 관리하면서도, 나머지는 GitOps로 완전 자동화할 수 있습니다!**