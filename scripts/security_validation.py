#!/usr/bin/env python3
"""
보안 검증 및 환경변수 마스킹 유틸리티
Requirements: 5.2, 5.3, 7.1, 7.2, 7.3
"""

import os
import re
import sys
import json
from typing import Dict, List, Optional, Tuple


class SecurityValidator:
    """보안 검증 및 환경변수 관리 클래스"""
    
    def __init__(self):
        self.sensitive_patterns = [
            r'sk-[a-zA-Z0-9]{48,}',  # OpenAI API 키
            r'xoxb-[0-9]{11,}-[0-9]{11,}-[a-zA-Z0-9]{24,}',  # Slack Bot Token
            r'xoxp-[0-9]{11,}-[0-9]{11,}-[0-9]{11,}-[a-zA-Z0-9]{32,}',  # Slack User Token
            r'ghp_[a-zA-Z0-9]{36}',  # GitHub Personal Access Token
            r'ghs_[a-zA-Z0-9]{36}',  # GitHub App Token
            r'AKIA[0-9A-Z]{16}',  # AWS Access Key ID
            r'[0-9a-zA-Z/+]{40}',  # AWS Secret Access Key (일반적인 패턴)
        ]
        
    def validate_environment_variables(self) -> Dict[str, any]:
        """환경변수 검증 및 보안 상태 확인"""
        validation_result = {
            'status': 'success',
            'warnings': [],
            'errors': [],
            'masked_vars': {},
            'security_score': 100
        }
        
        # 필수 환경변수 목록
        required_vars = ['GITHUB_REPOSITORY', 'GITHUB_REF', 'GITHUB_SHA']
        optional_vars = ['OPENAI_API_KEY', 'SLACK_WEBHOOK_URL_CHECKOV', 'FAIL_ON_SEVERITY']
        
        # 필수 환경변수 확인
        for var in required_vars:
            if not os.getenv(var):
                validation_result['errors'].append(f"필수 환경변수 누락: {var}")
                validation_result['security_score'] -= 20
        
        # 선택적 환경변수 확인 및 마스킹
        for var in optional_vars:
            value = os.getenv(var)
            if value:
                masked_value = self.mask_sensitive_value(var, value)
                validation_result['masked_vars'][var] = masked_value
                
                # 보안 검증
                security_issues = self.validate_secret_format(var, value)
                if security_issues:
                    validation_result['warnings'].extend(security_issues)
                    validation_result['security_score'] -= 5 * len(security_issues)
        
        # 전체 환경변수에서 민감한 정보 스캔
        sensitive_leaks = self.scan_for_sensitive_data()
        if sensitive_leaks:
            validation_result['errors'].extend(sensitive_leaks)
            validation_result['security_score'] -= 30
        
        # 최종 상태 결정
        if validation_result['errors']:
            validation_result['status'] = 'error'
        elif validation_result['warnings']:
            validation_result['status'] = 'warning'
        
        return validation_result
    
    def mask_sensitive_value(self, var_name: str, value: str) -> str:
        """민감한 값 마스킹 처리"""
        if not value:
            return "***"
        
        # 변수별 맞춤 마스킹
        if var_name == 'OPENAI_API_KEY':
            if value.startswith('sk-') and len(value) > 10:
                return f"sk-{value[3:7]}...{value[-4:]}"
            else:
                return "sk-***"
        
        elif var_name == 'SLACK_WEBHOOK_URL_CHECKOV':
            if 'hooks.slack.com' in value:
                parts = value.split('/')
                if len(parts) >= 6:
                    return f"https://hooks.slack.com/services/***/{parts[-2][:3]}***/{parts[-1][:3]}***"
                else:
                    return "https://hooks.slack.com/services/***"
            else:
                return "***"
        
        elif var_name in ['GITHUB_TOKEN', 'GH_TOKEN']:
            if value.startswith('ghp_') and len(value) > 10:
                return f"ghp_{value[4:8]}...{value[-4:]}"
            elif value.startswith('ghs_') and len(value) > 10:
                return f"ghs_{value[4:8]}...{value[-4:]}"
            else:
                return "gh***"
        
        elif 'AWS' in var_name:
            if len(value) > 8:
                return f"{value[:4]}...{value[-4:]}"
            else:
                return "***"
        
        else:
            # 기본 마스킹
            if len(value) <= 8:
                return "***"
            elif len(value) <= 16:
                return f"{value[:2]}...{value[-2:]}"
            else:
                return f"{value[:4]}...{value[-4:]}"
    
    def validate_secret_format(self, var_name: str, value: str) -> List[str]:
        """시크릿 형식 검증"""
        issues = []
        
        if var_name == 'OPENAI_API_KEY':
            if not value.startswith('sk-'):
                issues.append("OpenAI API 키가 'sk-'로 시작하지 않습니다")
            if len(value) < 51:  # sk- + 48자
                issues.append("OpenAI API 키 길이가 너무 짧습니다")
        
        elif var_name == 'SLACK_WEBHOOK_URL_CHECKOV':
            if not value.startswith('https://hooks.slack.com/'):
                issues.append("Slack 웹훅 URL이 올바른 형식이 아닙니다")
            if len(value.split('/')) < 6:
                issues.append("Slack 웹훅 URL 구조가 올바르지 않습니다")
        
        elif var_name == 'FAIL_ON_SEVERITY':
            valid_values = ['none', 'low', 'medium', 'high', 'critical']
            if value.lower() not in valid_values:
                issues.append(f"FAIL_ON_SEVERITY 값이 올바르지 않습니다. 유효한 값: {', '.join(valid_values)}")
        
        return issues
    
    def scan_for_sensitive_data(self) -> List[str]:
        """환경변수에서 민감한 데이터 패턴 스캔"""
        issues = []
        
        # GitHub Actions 환경에서 제외할 변수들
        excluded_vars = {
            'PATH', 'HOME', 'USER', 'SHELL', 'PWD', 'OLDPWD', 'TERM',
            'GITHUB_WORKSPACE', 'GITHUB_REPOSITORY', 'GITHUB_REF', 'GITHUB_SHA',
            'GITHUB_RUN_ID', 'GITHUB_RUN_NUMBER', 'GITHUB_ACTOR', 'GITHUB_EVENT_NAME',
            'RUNNER_OS', 'RUNNER_ARCH', 'RUNNER_NAME', 'RUNNER_WORKSPACE'
        }
        
        for var_name, var_value in os.environ.items():
            if var_name in excluded_vars or not var_value:
                continue
            
            # 민감한 패턴 검사
            for pattern in self.sensitive_patterns:
                if re.search(pattern, var_value):
                    issues.append(f"환경변수 {var_name}에서 민감한 데이터 패턴 발견")
                    break
        
        return issues
    
    def generate_security_report(self) -> str:
        """보안 검증 리포트 생성"""
        validation_result = self.validate_environment_variables()
        
        report = f"""# 🔒 보안 검증 리포트

## 📊 전체 보안 점수: {validation_result['security_score']}/100

### ✅ 검증 상태: {validation_result['status'].upper()}

"""
        
        # 환경변수 상태
        if validation_result['masked_vars']:
            report += "### 🔐 감지된 민감한 환경변수\n\n"
            for var, masked_value in validation_result['masked_vars'].items():
                report += f"- **{var}**: `{masked_value}`\n"
            report += "\n"
        
        # 경고사항
        if validation_result['warnings']:
            report += "### ⚠️ 경고사항\n\n"
            for warning in validation_result['warnings']:
                report += f"- {warning}\n"
            report += "\n"
        
        # 오류사항
        if validation_result['errors']:
            report += "### ❌ 오류사항\n\n"
            for error in validation_result['errors']:
                report += f"- {error}\n"
            report += "\n"
        
        # 보안 권장사항
        report += """### 🛡️ 보안 권장사항

#### 시크릿 관리
- 모든 API 키와 토큰은 GitHub Secrets에 저장하세요
- 시크릿은 정기적으로 로테이션하세요
- 불필요한 권한은 제거하세요

#### 네트워크 보안
- HTTPS/TLS 연결만 사용하세요
- SSL 인증서 검증을 활성화하세요
- 타임아웃 설정을 적절히 구성하세요

#### 로깅 및 모니터링
- 민감한 정보는 로그에 출력하지 마세요
- 실패한 인증 시도를 모니터링하세요
- 비정상적인 API 호출 패턴을 감지하세요

---
*보안 검증 완료 시간: {self._get_current_time()}*
"""
        
        return report
    
    def _get_current_time(self) -> str:
        """현재 시간 반환"""
        from datetime import datetime
        return datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')
    
    def print_environment_summary(self):
        """환경변수 요약 출력 (GitHub Actions용)"""
        validation_result = self.validate_environment_variables()
        
        print("🔒 보안 검증 결과:")
        print(f"  상태: {validation_result['status']}")
        print(f"  보안 점수: {validation_result['security_score']}/100")
        
        if validation_result['masked_vars']:
            print("  감지된 시크릿:")
            for var, masked_value in validation_result['masked_vars'].items():
                print(f"    {var}: {masked_value}")
        
        if validation_result['warnings']:
            print("  경고:")
            for warning in validation_result['warnings']:
                print(f"    ⚠️ {warning}")
        
        if validation_result['errors']:
            print("  오류:")
            for error in validation_result['errors']:
                print(f"    ❌ {error}")
        
        # GitHub Actions 출력 변수 설정
        print(f"SECURITY_STATUS={validation_result['status']}")
        print(f"SECURITY_SCORE={validation_result['security_score']}")
        print(f"HAS_SECRETS={'true' if validation_result['masked_vars'] else 'false'}")
        
        return validation_result['status'] == 'success'


def main():
    """메인 실행 함수"""
    if len(sys.argv) > 1 and sys.argv[1] == '--report':
        # 보안 리포트 생성
        validator = SecurityValidator()
        report = validator.generate_security_report()
        print(report)
    else:
        # 환경변수 검증 및 요약 출력
        validator = SecurityValidator()
        success = validator.print_environment_summary()
        sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()