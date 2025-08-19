# Contributing to Div4u Comparison Service

Div4u Comparison Service에 기여해 주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

## 🤝 기여 방법

### 버그 리포트

버그를 발견하셨나요? 다음 정보를 포함하여 [GitHub Issues](https://github.com/your-repo/issues)에 리포트해 주세요:

- **버그 설명**: 무엇이 잘못되었는지 명확하게 설명
- **재현 단계**: 버그를 재현할 수 있는 단계별 설명
- **예상 동작**: 어떻게 동작해야 하는지
- **실제 동작**: 실제로 어떻게 동작하는지
- **환경 정보**: OS, Node.js 버전, 브라우저 등
- **스크린샷**: 가능한 경우 스크린샷 첨부

### 기능 제안

새로운 기능을 제안하고 싶으시나요?

1. 먼저 [GitHub Issues](https://github.com/your-repo/issues)에서 유사한 제안이 있는지 확인
2. 새 이슈를 생성하고 다음 정보 포함:
   - **기능 설명**: 제안하는 기능의 상세 설명
   - **사용 사례**: 왜 이 기능이 필요한지
   - **구현 아이디어**: 어떻게 구현할 수 있는지 (선택사항)

### 코드 기여

#### 개발 환경 설정

1. **저장소 포크 및 클론**
   ```bash
   git clone https://github.com/your-username/div4u.git
   cd div4u/comparison-service
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경변수 설정**
   ```bash
   cp .env.example .env
   # .env 파일에서 SEOUL_API_KEY 설정
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

#### 브랜치 전략

- `main`: 안정적인 프로덕션 코드
- `develop`: 개발 중인 코드 통합
- `feature/*`: 새로운 기능 개발
- `bugfix/*`: 버그 수정
- `hotfix/*`: 긴급 수정

**브랜치 생성 예시**:
```bash
git checkout -b feature/add-location-history
git checkout -b bugfix/fix-cache-issue
git checkout -b docs/update-api-documentation
```

#### 커밋 메시지 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/) 형식을 따릅니다:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**타입**:
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 변경 (포맷팅, 세미콜론 등)
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가 또는 수정
- `chore`: 빌드 프로세스 또는 도구 변경

**예시**:
```bash
feat(api): add location history endpoint
fix(cache): resolve memory leak in cache service
docs(readme): update installation instructions
test(comparison): add unit tests for recommendation algorithm
```

#### 코딩 스타일

**TypeScript 스타일**:
- **들여쓰기**: 2 spaces
- **따옴표**: Single quotes (`'`)
- **세미콜론**: 항상 사용
- **네이밍**: camelCase (변수, 함수), PascalCase (클래스, 인터페이스)

**ESLint 및 Prettier 사용**:
```bash
# 린팅 검사
npm run lint

# 자동 수정
npm run lint:fix

# 포맷팅 (Prettier)
npm run format
```

**코드 예시**:
```typescript
// ✅ 좋은 예시
interface ComparisonResult {
  location: string;
  crowdLevel: CrowdLevel;
  timestamp: string;
}

class ComparisonService {
  private readonly apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async compareLocations(locations: string[]): Promise<ComparisonResult[]> {
    // 구현...
  }
}

// ❌ 나쁜 예시
interface comparisonResult {
  Location: string
  crowd_level: string
  TimeStamp: string
}
```

#### 테스트 작성

모든 새로운 기능과 버그 수정에는 테스트가 포함되어야 합니다.

**테스트 실행**:
```bash
# 모든 테스트 실행
npm test

# 특정 테스트 파일 실행
npm test -- comparisonService.test.ts

# 커버리지 포함
npm test -- --coverage

# Watch 모드
npm run test:watch
```

**테스트 작성 가이드**:
```typescript
// 단위 테스트 예시
describe('ComparisonService', () => {
  let service: ComparisonService;
  
  beforeEach(() => {
    service = new ComparisonService('test-api-key');
  });
  
  it('should compare locations successfully', async () => {
    // Given
    const locations = ['홍대', '강남'];
    
    // When
    const result = await service.compareLocations(locations);
    
    // Then
    expect(result).toHaveLength(2);
    expect(result[0].location).toBe('홍대');
  });
});
```

#### Pull Request 프로세스

1. **브랜치 생성 및 작업**
   ```bash
   git checkout -b feature/your-feature-name
   # 코드 작성 및 테스트
   ```

2. **코드 품질 확인**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

3. **커밋 및 푸시**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

4. **Pull Request 생성**
   - GitHub에서 Pull Request 생성
   - 템플릿에 따라 정보 작성
   - 리뷰어 지정

**Pull Request 템플릿**:
```markdown
## 변경 사항 (Changes)
- [ ] 새로운 기능 추가
- [ ] 버그 수정
- [ ] 문서 업데이트
- [ ] 리팩토링
- [ ] 테스트 추가

## 설명 (Description)
이 PR에서 변경된 내용을 간단히 설명해 주세요.

## 테스트 (Testing)
- [ ] 단위 테스트 추가/수정
- [ ] 통합 테스트 추가/수정
- [ ] 수동 테스트 완료

## 체크리스트 (Checklist)
- [ ] 코드가 프로젝트 스타일 가이드를 따름
- [ ] 자체 리뷰 완료
- [ ] 테스트 추가 및 통과
- [ ] 문서 업데이트 (필요시)
- [ ] 브레이킹 체인지 없음 (또는 명시)

## 관련 이슈 (Related Issues)
Closes #123
```

## 📋 개발 가이드라인

### 아키텍처 원칙

1. **단일 책임 원칙**: 각 클래스와 함수는 하나의 책임만 가져야 함
2. **의존성 주입**: 외부 의존성은 생성자를 통해 주입
3. **에러 처리**: 모든 비동기 작업에 적절한 에러 처리
4. **로깅**: 중요한 작업에 구조화된 로깅 추가

### API 설계 원칙

1. **RESTful**: REST 원칙을 따르는 API 설계
2. **일관성**: 응답 형식과 에러 처리의 일관성 유지
3. **버전 관리**: API 변경 시 하위 호환성 고려
4. **문서화**: 모든 API 엔드포인트 문서화

### 성능 고려사항

1. **캐싱**: 적절한 캐싱 전략 사용
2. **병렬 처리**: 가능한 경우 병렬 처리 활용
3. **메모리 관리**: 메모리 누수 방지
4. **에러 복구**: 외부 서비스 장애에 대한 복구 메커니즘

### 보안 고려사항

1. **입력 검증**: 모든 사용자 입력 검증
2. **API 키 보안**: 환경변수 사용, 하드코딩 금지
3. **CORS 설정**: 적절한 CORS 정책 설정
4. **Rate Limiting**: API 남용 방지

## 🔍 코드 리뷰 가이드라인

### 리뷰어를 위한 가이드

1. **기능성**: 코드가 의도한 대로 작동하는가?
2. **가독성**: 코드가 이해하기 쉬운가?
3. **성능**: 성능상 문제가 없는가?
4. **보안**: 보안 취약점이 없는가?
5. **테스트**: 적절한 테스트가 포함되어 있는가?

### 작성자를 위한 가이드

1. **자체 리뷰**: PR 생성 전 자체 리뷰 수행
2. **작은 PR**: 가능한 한 작은 단위로 PR 생성
3. **명확한 설명**: 변경 사항과 이유를 명확히 설명
4. **테스트 포함**: 모든 변경사항에 대한 테스트 포함

## 📚 리소스

### 문서
- [개발 환경 설정](./docs/development-setup.md)
- [API 문서](./docs/api.md)
- [환경변수 가이드](./docs/environment-variables.md)
- [트러블슈팅](./docs/troubleshooting.md)

### 도구
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Jest 테스팅 가이드](https://jestjs.io/docs/getting-started)
- [ESLint 규칙](https://eslint.org/docs/rules/)
- [Prettier 설정](https://prettier.io/docs/en/configuration.html)

### 커뮤니티
- [GitHub Discussions](https://github.com/your-repo/discussions)
- [Discord 채널](https://discord.gg/your-channel)

## 🏆 기여자 인정

모든 기여자는 README.md의 Contributors 섹션에 추가됩니다. 기여 유형에는 다음이 포함됩니다:

- 💻 코드 기여
- 📖 문서 작성
- 🐛 버그 리포트
- 💡 아이디어 제안
- 🤔 질문 및 토론
- 🎨 디자인
- 🔧 도구 및 인프라

## 📞 도움이 필요하신가요?

기여 과정에서 도움이 필요하시면:

1. [GitHub Issues](https://github.com/your-repo/issues)에 질문 등록
2. [GitHub Discussions](https://github.com/your-repo/discussions)에서 토론
3. 기존 이슈와 PR 확인

---

다시 한 번 Div4u Comparison Service에 기여해 주셔서 감사합니다! 🎉