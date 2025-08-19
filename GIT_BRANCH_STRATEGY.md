# Git Branch Strategy - div4u Project

## 🌳 Branch Structure

```
main (Production)
├── develop (Integration)
├── feature/[feature-name] (Feature Development)
├── hotfix/[issue-name] (Emergency Fixes)
└── pipeline/[pipeline-name] (CI/CD Updates)
```

## 📋 Branch Types & Responsibilities

### 🎯 Main Branches

| Branch | Purpose | Trigger | Responsible |
|--------|---------|---------|-------------|
| `main` | Production-ready code | Manual merge from develop | Both teams |
| `develop` | Integration & testing | Auto-merge from features | Both teams |

### 🔧 Supporting Branches

| Branch Type | Naming | Purpose | Owner | Merge To |
|-------------|--------|---------|-------|----------|
| `feature/*` | `feature/user-chat-ui` | New features | Developer | `develop` |
| `hotfix/*` | `hotfix/security-patch` | Emergency fixes | Both | `main` + `develop` |
| `pipeline/*` | `pipeline/add-security-scan` | CI/CD updates | Pipeline Team | `develop` |

## 👥 Team Responsibilities

### 🔨 개발 담당 팀원
- **Primary Branches**: `feature/*`, `develop`
- **Workflow**: `feature` → `develop` → `main`
- **Focus**: Application code, UI/UX, business logic

### ⚙️ 파이프라인 담당 팀원  
- **Primary Branches**: `pipeline/*`, `develop`
- **Workflow**: `pipeline` → `develop` → `main`
- **Focus**: CI/CD, infrastructure, deployment configs

## 🔄 Workflow Process

### 1. Feature Development (개발 팀원)
```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/chat-interface

# 2. Develop and commit
git add .
git commit -m "feat: add chat interface component"

# 3. Push and create PR to develop
git push origin feature/chat-interface
# Create PR: feature/chat-interface → develop
```

### 2. Pipeline Updates (파이프라인 팀원)
```bash
# 1. Create pipeline branch from develop
git checkout develop
git pull origin develop
git checkout -b pipeline/add-sonar-quality-gate

# 2. Update CI/CD configs
git add .github/workflows/
git commit -m "ci: add SonarQube quality gate"

# 3. Push and create PR to develop
git push origin pipeline/add-sonar-quality-gate
# Create PR: pipeline/add-sonar-quality-gate → develop
```

### 3. Release Process (Both Teams)
```bash
# 1. Test on develop branch
# 2. Create PR: develop → main
# 3. Review and approve together
# 4. Merge to main (triggers production deployment)
```

### 4. Hotfix Process (Emergency)
```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# 2. Apply fix and test
git add .
git commit -m "fix: resolve critical security vulnerability"

# 3. Merge to both main and develop
git push origin hotfix/critical-security-fix
# Create PRs: hotfix → main AND hotfix → develop
```

## 🚀 CI/CD Integration

### Current Pipeline Triggers
```yaml
on:
  push:
    branches: [main]  # Production deployment
    paths: ['backend/**', 'frontend/**', 'comparison/**']
```

### Recommended Pipeline Updates
```yaml
on:
  push:
    branches: 
      - main      # Production deployment
      - develop   # Staging deployment
  pull_request:
    branches: 
      - main      # Pre-production validation
      - develop   # Integration testing
```

## 📏 Branch Rules & Protection

### Main Branch Protection
- ✅ Require PR reviews (2 approvers)
- ✅ Require status checks (CI/CD pipeline)
- ✅ Require up-to-date branches
- ✅ Restrict pushes (no direct commits)
- ✅ Require signed commits

### Develop Branch Protection  
- ✅ Require PR reviews (1 approver)
- ✅ Require status checks (build + test)
- ✅ Allow force pushes (for rebasing)

## 🏷️ Commit Message Convention

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix  
- `ci`: CI/CD changes
- `docs`: Documentation
- `style`: Code formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### Examples
```bash
feat(frontend): add chat interface with Foru character
fix(backend): resolve API timeout issue
ci(pipeline): add security scanning with Trivy
docs(readme): update deployment instructions
```

## 🔄 Merge Strategies

### Feature → Develop
- **Strategy**: Squash and merge
- **Reason**: Clean history, single commit per feature

### Develop → Main
- **Strategy**: Create merge commit
- **Reason**: Preserve integration history

### Hotfix → Main/Develop
- **Strategy**: Create merge commit
- **Reason**: Track emergency fixes clearly

## 📅 Release Schedule

### Regular Releases
- **Frequency**: Weekly (Fridays)
- **Process**: develop → main
- **Review**: Both teams required

### Hotfix Releases
- **Frequency**: As needed
- **Process**: hotfix → main + develop
- **Review**: Expedited (1 approver)

## 🛠️ Git Commands Cheat Sheet

### Daily Workflow
```bash
# Start new feature
git checkout develop && git pull origin develop
git checkout -b feature/my-feature

# Update from develop
git checkout develop && git pull origin develop
git checkout feature/my-feature && git rebase develop

# Clean up branches (AFTER PR is merged)
# ⚠️ 주의: PR이 merge된 후에만 실행!
git branch -d feature/completed-feature        # 로컬 브랜치 삭제
git push origin --delete feature/completed-feature  # 원격 브랜치 삭제

# 브랜치 삭제 전 확인 (안전한 방법)
git log --oneline feature/completed-feature  # 커밋 기록 확인
git branch --merged develop                  # merge된 브랜치만 표시
```

### Emergency Hotfix
```bash
# Create hotfix
git checkout main && git pull origin main
git checkout -b hotfix/urgent-fix

# Deploy hotfix
git push origin hotfix/urgent-fix
# Create PR to main (immediate)
# Create PR to develop (sync)
```

## 🚨 Important Rules

### ❌ Never Do
- Direct commits to `main` or `develop`
- Force push to protected branches
- Delete `main` or `develop` branches
- Merge without PR review
- Delete branches before PR is merged

### ✅ Always Do
- Create PR for all changes
- Write descriptive commit messages
- Test before creating PR
- Keep branches up-to-date
- Delete merged feature branches (after PR merge)
- Verify branch is merged before deletion

## 🔍 Branch Deletion 안전 가이드

### 브랜치 삭제와 기록 보존
```bash
# ✅ 안전한 삭제 순서
1. PR이 merge되었는지 확인
2. 로컬에서 develop/main 브랜치로 전환
3. 브랜치 삭제 실행

# 기록은 어디에 남아있나?
- GitHub PR 기록 (영구 보존)
- develop/main 브랜치의 merge commit
- Git reflog (로컬, 90일간)
```

### 삭제 전 확인 명령어
```bash
# 1. PR이 merge되었는지 확인
git branch --merged develop | grep feature/my-feature

# 2. 커밋이 develop에 포함되었는지 확인
git log --oneline develop | grep "feat: my feature"

# 3. GitHub에서 PR 상태 확인 (Merged 표시)
```

### 실수로 삭제했을 때 복구
```bash
# 로컬 브랜치 복구 (reflog 이용)
git reflog                           # 삭제된 브랜치의 마지막 커밋 찾기
git checkout -b feature/recovered <commit-hash>

# 원격 브랜치 복구 (GitHub에서)
# GitHub → Branches → View all branches → Restore
```

## 🔍 Branch Monitoring

### Health Checks
- **Stale Branches**: Delete after 30 days
- **Large PRs**: Split into smaller changes
- **Merge Conflicts**: Resolve promptly
- **Failed Builds**: Fix before merge

### Team Communication
- **PR Reviews**: Tag relevant team member
- **Breaking Changes**: Notify in team chat
- **Hotfixes**: Immediate team notification
- **Release**: Coordinate deployment timing

## 📊 Success Metrics

- **PR Review Time**: < 24 hours
- **Build Success Rate**: > 95%
- **Hotfix Frequency**: < 1 per week
- **Branch Cleanup**: Weekly
- **Deployment Success**: > 99%

---

**Last Updated**: 2024-01-XX  
**Next Review**: Monthly team meeting