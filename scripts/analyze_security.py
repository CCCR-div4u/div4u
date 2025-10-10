#!/usr/bin/env python3
"""
Checkov 보안 스캔 결과 분석 및 OpenAI 연동 스크립트
Requirements: 2.1, 2.2, 5.1, 7.2
"""

import json
import os
import sys
import requests
import time
from typing import Dict, List, Any, Optional
from datetime import datetime


class SecurityAnalyzer:
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.slack_webhook_url = os.getenv('SLACK_WEBHOOK_URL_CHECKOV')
        self.max_issues_for_ai = int(os.getenv('MAX_ISSUES_FOR_AI', '15'))
        self.openai_api_url = "https://api.openai.com/v1/chat/completions"
        
    def load_checkov_results(self, json_file: str) -> Dict[str, Any]:
        """Checkov JSON 결과 파일 로드 및 검증"""
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # 기본 구조 검증
            if 'results' not in data:
                print(f"경고: {json_file}에 'results' 키가 없습니다. 기본 구조를 생성합니다.")
                return self._create_default_structure()
                
            return data
        except FileNotFoundError:
            print(f"오류: {json_file} 파일을 찾을 수 없습니다. 기본 구조를 생성합니다.")
            return self._create_default_structure()
        except json.JSONDecodeError as e:
            print(f"오류: JSON 파싱 실패 - {e}. 기본 구조를 생성합니다.")
            return self._create_default_structure()
    
    def _create_default_structure(self) -> Dict[str, Any]:
        """Checkov 실행 실패 시 기본 JSON 구조 생성 (Requirement 7.2)"""
        return {
            "check_type": "unknown",
            "results": {
                "failed_checks": []
            },
            "summary": {
                "passed": 0,
                "failed": 0,
                "skipped": 0,
                "parsing_errors": 0,
                "resource_count": 0,
                "checkov_version": "unknown"
            }
        }
    
    def classify_by_severity(self, failed_checks: List[Dict]) -> Dict[str, List[Dict]]:
        """심각도별 이슈 분류 (Requirement 2.1)"""
        severity_buckets = {
            'CRITICAL': [],
            'HIGH': [],
            'MEDIUM': [],
            'LOW': [],
            'UNKNOWN': []
        }
        
        # Checkov check_id 기반 심각도 매핑
        severity_mapping = {
            # Critical - 보안에 심각한 영향을 미치는 이슈들
            'CKV_K8S_8': 'CRITICAL',   # Liveness Probe 미설정
            'CKV_K8S_9': 'CRITICAL',   # Readiness Probe 미설정
            'CKV_K8S_16': 'CRITICAL',  # 컨테이너가 root로 실행
            'CKV_K8S_17': 'CRITICAL',  # 권한 상승 허용
            'CKV_K8S_20': 'CRITICAL',  # allowPrivilegeEscalation 미설정
            'CKV_K8S_25': 'CRITICAL',  # 컨테이너 이미지 태그가 latest
            'CKV_K8S_30': 'CRITICAL',  # securityContext 미설정
            'CKV_K8S_37': 'CRITICAL',  # 컨테이너가 특권 모드로 실행
            'CKV_K8S_40': 'CRITICAL',  # 컨테이너가 root 파일시스템에 쓰기 가능
            
            # High - 중요한 보안 이슈들
            'CKV_K8S_10': 'HIGH',     # CPU 리소스 제한 미설정
            'CKV_K8S_11': 'HIGH',     # 메모리 리소스 제한 미설정
            'CKV_K8S_12': 'HIGH',     # CPU 리소스 요청 미설정
            'CKV_K8S_13': 'HIGH',     # 메모리 리소스 요청 미설정
            'CKV_K8S_14': 'HIGH',     # 이미지 pull policy가 Always가 아님
            'CKV_K8S_21': 'HIGH',     # 기본 네임스페이스 사용
            'CKV_K8S_22': 'HIGH',     # 기본 서비스 계정 사용
            'CKV_K8S_28': 'HIGH',     # Docker 소켓 마운트
            'CKV_K8S_29': 'HIGH',     # 루트 파일시스템 마운트
            'CKV_K8S_31': 'HIGH',     # seccomp 프로파일 미설정
            'CKV_K8S_35': 'HIGH',     # 컨테이너가 SYS_ADMIN capability 사용
            'CKV_K8S_38': 'HIGH',     # 서비스 계정 토큰 자동 마운트
            'CKV_K8S_39': 'HIGH',     # 컨테이너가 NET_RAW capability 사용
            'CKV_K8S_43': 'HIGH',     # 이미지가 digest로 참조되지 않음
            
            # Medium - 보안 강화를 위한 권장사항들
            'CKV_K8S_15': 'MEDIUM',   # 이미지 레지스트리가 신뢰할 수 없음
            'CKV_K8S_23': 'MEDIUM',   # hostNetwork 사용
            'CKV_K8S_24': 'MEDIUM',   # hostPID 사용
            'CKV_K8S_26': 'MEDIUM',   # 컨테이너가 호스트 IPC 사용
            'CKV_K8S_27': 'MEDIUM',   # 컨테이너가 호스트 포트 사용
            'CKV_K8S_32': 'MEDIUM',   # AppArmor 프로파일 미설정
            'CKV_K8S_33': 'MEDIUM',   # SELinux 옵션 미설정
            'CKV_K8S_34': 'MEDIUM',   # 컨테이너가 추가 capability 사용
            'CKV_K8S_36': 'MEDIUM',   # fsGroup 미설정
            'CKV_K8S_41': 'MEDIUM',   # Service 타입이 NodePort
            'CKV_K8S_42': 'MEDIUM',   # Service 타입이 LoadBalancer
            
            # Low - 모범 사례 및 개선 권장사항들
            'CKV_K8S_18': 'LOW',      # 컨테이너 이름이 기본값
            'CKV_K8S_19': 'LOW',      # 라벨 미설정
            'CKV_K8S_44': 'LOW',      # 리소스 쿼터 미설정
            'CKV_K8S_45': 'LOW',      # 네트워크 정책 미설정
        }
        
        for check in failed_checks:
            check_id = check.get('check_id', '')
            
            # check_id 기반으로 심각도 결정
            severity = severity_mapping.get(check_id, 'MEDIUM')  # 기본값을 MEDIUM으로 설정
            
            # 기존 severity 필드가 있다면 우선 사용
            if check.get('severity'):
                existing_severity = str(check.get('severity')).upper()
                if existing_severity in severity_buckets:
                    severity = existing_severity
            
            # OpenAI 전송용 데이터 정제 (소스 코드 제외 - Requirement 5.1)
            sanitized_check = {
                'check_id': check_id,
                'check_name': check.get('check_name', ''),
                'severity': severity,
                'file_path': check.get('file_path', ''),
                'resource': check.get('resource', ''),
                'description': check.get('description', ''),
                'guideline': check.get('guideline', '')
            }
            
            severity_buckets[severity].append(sanitized_check)
        
        return severity_buckets  
  
    def get_severity_stats(self, severity_buckets: Dict[str, List]) -> Dict[str, int]:
        """심각도별 통계 생성"""
        return {
            'total_issues': sum(len(issues) for issues in severity_buckets.values()),
            'critical': len(severity_buckets['CRITICAL']),
            'high': len(severity_buckets['HIGH']),
            'medium': len(severity_buckets['MEDIUM']),
            'low': len(severity_buckets['LOW']),
            'unknown': len(severity_buckets['UNKNOWN'])
        }
    
    def get_top_issues(self, severity_buckets: Dict[str, List]) -> List[Dict]:
        """우선순위별 상위 이슈 추출"""
        top_issues = []
        
        # 우선순위 순서: CRITICAL -> HIGH -> MEDIUM -> LOW -> UNKNOWN
        for severity in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']:
            issues = severity_buckets[severity]
            top_issues.extend(issues)
            
            # 최대 개수 제한
            if len(top_issues) >= self.max_issues_for_ai:
                break
        
        return top_issues[:self.max_issues_for_ai]
    
    def get_affected_files(self, failed_checks: List[Dict]) -> List[str]:
        """영향받는 파일 목록 추출"""
        files = set()
        for check in failed_checks:
            file_path = check.get('file_path', '')
            if file_path:
                files.add(file_path)
        return sorted(list(files))
    
    def call_openai_api(self, prompt: str) -> Optional[str]:
        """OpenAI API 호출 (에러 핸들링 포함 - Requirement 7.2)"""
        if not self.openai_api_key:
            print("경고: OPENAI_API_KEY가 설정되지 않았습니다. Fallback 리포트를 사용합니다.")
            return None
        
        # API 키 마스킹 강화 (보안 강화 - Requirement 5.2, 5.3)
        if len(self.openai_api_key) < 8:
            masked_key = "***"
        elif len(self.openai_api_key) <= 12:
            masked_key = f"{self.openai_api_key[:3]}...***"
        else:
            masked_key = f"{self.openai_api_key[:4]}...{self.openai_api_key[-3:]}"
        print(f"OpenAI API 호출 시작 (키: {masked_key})")
        
        # API 키 유효성 검증
        if not self.openai_api_key.startswith('sk-'):
            print("경고: OpenAI API 키 형식이 올바르지 않습니다. Fallback 리포트를 사용합니다.")
            return None
        
        headers = {
            'Authorization': f'Bearer {self.openai_api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'Checkov-Security-Analyzer/1.0'
        }
        
        # gpt-4o-mini 모델 사용 (Requirement 2.1)
        payload = {
            'model': 'gpt-4o-mini',
            'messages': [
                {
                    'role': 'system',
                    'content': '''당신은 클라우드 인프라 및 Kubernetes 보안 전문가입니다. 
보안 스캔 결과를 분석하여 개발팀이 실제로 적용할 수 있는 구체적이고 실용적인 한국어 리포트를 작성해주세요.
기술적 정확성과 실무 적용 가능성을 모두 고려하여 분석해주세요.'''
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'max_tokens': 3000,  # 더 상세한 리포트를 위해 토큰 수 증가
            'temperature': 0.2,  # 일관성 있는 분석을 위해 낮은 temperature
            'top_p': 0.9,
            'frequency_penalty': 0.1,
            'presence_penalty': 0.1
        }
        
        max_retries = 3
        retry_delay = 5
        
        for attempt in range(max_retries):
            try:
                print(f"API 호출 시도 {attempt + 1}/{max_retries}")
                response = requests.post(
                    self.openai_api_url,
                    headers=headers,
                    json=payload,
                    timeout=60  # 더 긴 타임아웃
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result['choices'][0]['message']['content']
                    
                    # 사용량 정보 로깅
                    usage = result.get('usage', {})
                    print(f"✅ OpenAI API 호출 성공 - 토큰 사용량: {usage.get('total_tokens', 'N/A')}")
                    return content
                    
                elif response.status_code == 429:
                    print(f"⚠️ 레이트 제한 (429) - {retry_delay}초 후 재시도...")
                    if attempt < max_retries - 1:
                        time.sleep(retry_delay)
                        retry_delay *= 2  # 지수 백오프
                        continue
                    else:
                        print("❌ 최대 재시도 횟수 초과 - Fallback 리포트 사용")
                        return None
                        
                elif response.status_code == 401:
                    print("❌ API 키 인증 실패 - API 키를 확인해주세요")
                    return None
                    
                elif response.status_code == 400:
                    print(f"❌ 잘못된 요청 (400): {response.text}")
                    return None
                    
                else:
                    print(f"⚠️ API 호출 실패 (상태 코드: {response.status_code})")
                    if attempt < max_retries - 1:
                        print(f"{retry_delay}초 후 재시도...")
                        time.sleep(retry_delay)
                        continue
                    else:
                        print(f"응답 내용: {response.text[:200]}...")
                        return None
                        
            except requests.exceptions.Timeout:
                print(f"⚠️ 요청 타임아웃 (시도 {attempt + 1}/{max_retries})")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    continue
                else:
                    print("❌ 최대 재시도 횟수 초과 - 네트워크 연결을 확인해주세요")
                    return None
                    
            except requests.exceptions.ConnectionError:
                print(f"⚠️ 연결 오류 (시도 {attempt + 1}/{max_retries})")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    continue
                else:
                    print("❌ 네트워크 연결 실패")
                    return None
                    
            except requests.exceptions.RequestException as e:
                print(f"⚠️ 요청 오류: {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    continue
                else:
                    return None
                    
            except Exception as e:
                print(f"❌ 예상치 못한 오류: {str(e)}")
                return None
        
        return None    

    def generate_openai_prompt(self, project_type: str, severity_stats: Dict, top_issues: List[Dict], affected_files: List[str]) -> str:
        """OpenAI용 프롬프트 생성 (프로젝트별 맞춤 - Requirement 2.3)"""
        # 프로젝트별 상세 컨텍스트 정의
        project_contexts = {
            'terraform': {
                'name': 'bluesunnywings-eks-tf-sunny',
                'description': 'AWS EKS 클러스터 Terraform 인프라 프로젝트',
                'focus_areas': ['IAM 권한 관리', 'VPC 보안 설정', 'EKS 클러스터 보안', '암호화 설정', '로깅 및 모니터링'],
                'common_issues': ['과도한 IAM 권한', '암호화 미설정', '퍼블릭 액세스 허용', '로깅 비활성화']
            },
            'kubernetes': {
                'name': 'div4u',
                'description': 'Kubernetes 매니페스트 테스트 및 보안 검증 프로젝트',
                'focus_areas': ['컨테이너 보안 컨텍스트', '리소스 제한', '네트워크 정책', 'RBAC 설정', '이미지 보안'],
                'common_issues': ['root 권한 실행', '리소스 제한 미설정', '보안 컨텍스트 누락', '프로브 미설정']
            }
        }
        
        context = project_contexts.get(project_type, {
            'name': project_type,
            'description': f'{project_type} 프로젝트',
            'focus_areas': ['보안 설정', '권한 관리', '네트워크 보안'],
            'common_issues': ['보안 설정 누락', '과도한 권한']
        })
        
        # 심각도별 우선순위 메시지 생성
        priority_message = ""
        if severity_stats['critical'] > 0:
            priority_message = f"🚨 **긴급**: Critical 이슈 {severity_stats['critical']}개가 발견되어 즉시 조치가 필요합니다."
        elif severity_stats['high'] > 0:
            priority_message = f"⚠️ **중요**: High 이슈 {severity_stats['high']}개가 발견되어 우선 조치가 필요합니다."
        elif severity_stats['medium'] > 0:
            priority_message = f"📋 **주의**: Medium 이슈 {severity_stats['medium']}개가 발견되었습니다."
        else:
            priority_message = f"✅ **양호**: 심각한 보안 이슈는 발견되지 않았습니다."
        
        prompt = f"""당신은 {context['description']} 전문 보안 분석가입니다.

## 프로젝트 정보
- **프로젝트명**: {context['name']}
- **설명**: {context['description']}
- **주요 보안 영역**: {', '.join(context['focus_areas'])}

## 스캔 결과 요약
{priority_message}

### 심각도별 분포
- 총 이슈: **{severity_stats['total_issues']}개**
- Critical: **{severity_stats['critical']}개** (즉시 조치 필요)
- High: **{severity_stats['high']}개** (우선 조치 필요)  
- Medium: **{severity_stats['medium']}개** (계획적 조치)
- Low: **{severity_stats['low']}개** (개선 권장)

## 발견된 주요 이슈들
"""
        
        # 상위 이슈들을 심각도별로 그룹화하여 표시
        severity_groups = {'CRITICAL': [], 'HIGH': [], 'MEDIUM': [], 'LOW': []}
        for issue in top_issues[:15]:
            severity = issue.get('severity', 'UNKNOWN')
            if severity in severity_groups:
                severity_groups[severity].append(issue)
        
        issue_count = 1
        for severity in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
            if severity_groups[severity]:
                severity_emoji = {'CRITICAL': '🔴', 'HIGH': '🟠', 'MEDIUM': '🟡', 'LOW': '🔵'}
                prompt += f"\n### {severity_emoji[severity]} {severity} 이슈들\n"
                
                for issue in severity_groups[severity][:5]:  # 각 심각도별 최대 5개
                    prompt += f"""
**{issue_count}. {issue['check_name']}**
- 심각도: {issue['severity']}
- 파일: `{issue['file_path']}`
- 리소스: `{issue['resource']}`
- 설명: {issue['description']}
"""
                    issue_count += 1
        
        prompt += f"""
## 영향받는 파일들
{', '.join(f'`{file}`' for file in affected_files[:10])}

## 분석 요청사항
다음 구조로 **한국어**로 상세한 보안 분석 리포트를 작성해주세요:

### 1. 🎯 전체 상황 요약
- 현재 보안 상태 평가 (위험도: 높음/보통/낮음)
- 가장 시급한 문제점 3가지
- 전반적인 보안 성숙도 평가

### 2. 🚨 긴급 조치 필요 사항 (Critical + High)
각 이슈별로:
- 구체적인 위험성 설명
- 실제 공격 시나리오
- 단계별 해결 방법 (코드 예시 포함)

### 3. 📋 계획적 개선 사항 (Medium + Low)
- 보안 강화를 위한 개선 방안
- 구현 우선순위 및 일정 제안

### 4. 🛡️ {context['name']} 프로젝트 맞춤 권장사항
- {project_type} 환경 특화 보안 모범 사례
- 자동화 가능한 보안 검사 방법
- 팀 내 보안 프로세스 개선 방안
- 정기 점검 체크리스트

### 5. 🔄 다음 단계 실행 계획
- 1주일 내 조치사항
- 1개월 내 개선사항  
- 장기 보안 로드맵

**중요**: 모든 설명은 개발팀이 실제로 적용할 수 있는 구체적이고 실용적인 내용으로 작성해주세요."""
        
        return prompt
    
    def generate_fallback_report(self, project_type: str, severity_stats: Dict, severity_buckets: Dict[str, List], affected_files: List[str]) -> str:
        """OpenAI 실패 시 기본 리포트 생성 (Requirement 2.2)"""
        project_contexts = {
            'terraform': {
                'name': 'bluesunnywings-eks-tf-sunny',
                'description': 'AWS EKS 클러스터 Terraform 인프라 프로젝트',
                'icon': '🏗️'
            },
            'kubernetes': {
                'name': 'div4u',
                'description': 'Kubernetes 매니페스트 테스트 및 보안 검증 프로젝트',
                'icon': '☸️'
            }
        }
        
        context = project_contexts.get(project_type, {
            'name': project_type,
            'description': f'{project_type} 프로젝트',
            'icon': '🔧'
        })
        
        # 위험도 평가
        risk_level = "낮음"
        risk_emoji = "🟢"
        if severity_stats['critical'] > 0:
            risk_level = "매우 높음"
            risk_emoji = "🔴"
        elif severity_stats['high'] > 0:
            risk_level = "높음"
            risk_emoji = "🟠"
        elif severity_stats['medium'] > 0:
            risk_level = "보통"
            risk_emoji = "🟡"
        
        report = f"""# {context['icon']} {context['name']} 보안 검사 결과

## 🎯 전체 상황 요약

**프로젝트**: {context['description']}  
**위험도**: {risk_emoji} **{risk_level}**  
**검사 시간**: {datetime.now().strftime('%Y년 %m월 %d일 %H:%M:%S')}

### 📊 심각도별 분포
| 심각도 | 개수 | 상태 |
|--------|------|------|
| 🔴 Critical | **{severity_stats['critical']}개** | {'⚠️ 즉시 조치 필요' if severity_stats['critical'] > 0 else '✅ 양호'} |
| 🟠 High | **{severity_stats['high']}개** | {'⚠️ 우선 조치 필요' if severity_stats['high'] > 0 else '✅ 양호'} |
| 🟡 Medium | **{severity_stats['medium']}개** | {'📋 계획적 조치' if severity_stats['medium'] > 0 else '✅ 양호'} |
| 🔵 Low | **{severity_stats['low']}개** | {'💡 개선 권장' if severity_stats['low'] > 0 else '✅ 양호'} |
| **총계** | **{severity_stats['total_issues']}개** | - |

"""
        
        # 긴급 조치 필요 사항
        priority_issues = severity_buckets['CRITICAL'] + severity_buckets['HIGH']
        if priority_issues:
            report += """## 🚨 긴급 조치 필요 사항

다음 이슈들은 보안에 심각한 영향을 미칠 수 있으므로 **즉시 조치**가 필요합니다:

"""
            for i, issue in enumerate(priority_issues[:10], 1):
                severity_emoji = "🔴" if issue['severity'] == 'CRITICAL' else "🟠"
                report += f"""### {severity_emoji} {i}. {issue['check_name']}

- **심각도**: {issue['severity']}
- **파일**: `{issue['file_path']}`
- **리소스**: `{issue['resource']}`
- **설명**: {issue['description']}
- **가이드라인**: {issue.get('guideline', 'N/A')}

"""
        else:
            report += """## ✅ 긴급 조치 필요 사항

Critical 및 High 심각도의 보안 이슈가 발견되지 않았습니다. 현재 보안 상태가 양호합니다.

"""
        
        # 계획적 개선 사항
        medium_low_issues = severity_buckets['MEDIUM'] + severity_buckets['LOW']
        if medium_low_issues:
            report += f"""## 📋 계획적 개선 사항

다음 {len(medium_low_issues)}개 이슈들은 보안 강화를 위해 개선을 권장합니다:

"""
            for i, issue in enumerate(medium_low_issues[:8], 1):
                severity_emoji = "🟡" if issue['severity'] == 'MEDIUM' else "🔵"
                report += f"""**{severity_emoji} {i}. {issue['check_name']}** ({issue['severity']})
- 파일: `{issue['file_path']}` | 리소스: `{issue['resource']}`

"""
        
        # 영향받는 파일
        if affected_files:
            report += f"""## 📁 영향받는 파일 ({len(affected_files)}개)

"""
            for file in affected_files[:15]:
                report += f"- `{file}`\n"
            
            if len(affected_files) > 15:
                report += f"- ... 외 {len(affected_files) - 15}개 파일\n"
        
        # 프로젝트별 맞춤 권장사항
        report += f"""
## 🛡️ {context['name']} 프로젝트 맞춤 권장사항

"""
        
        if project_type == 'kubernetes':
            report += """### Kubernetes 보안 모범 사례

#### 🔒 컨테이너 보안
- **보안 컨텍스트 설정**: 모든 컨테이너에 적절한 `securityContext` 적용
  ```yaml
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    allowPrivilegeEscalation: false
    readOnlyRootFilesystem: true
  ```

#### 📊 리소스 관리
- **리소스 제한**: CPU/메모리 limits 및 requests 설정
  ```yaml
  resources:
    requests:
      memory: "64Mi"
      cpu: "250m"
    limits:
      memory: "128Mi"
      cpu: "500m"
  ```

#### 🌐 네트워크 보안
- **네트워크 정책**: NetworkPolicy를 통한 트래픽 제어
- **서비스 메시**: Istio 등을 활용한 서비스 간 통신 보안

#### 🔍 모니터링 및 감사
- **프로브 설정**: Liveness, Readiness, Startup 프로브 구성
- **로깅**: 중앙화된 로그 수집 및 분석 시스템 구축
"""
        else:  # terraform
            report += """### Terraform 인프라 보안 모범 사례

#### 🔐 암호화 및 데이터 보호
- **저장 데이터 암호화**: S3, EBS, RDS 등 모든 스토리지 암호화 활성화
- **전송 데이터 암호화**: HTTPS/TLS 강제 적용
- **KMS 키 관리**: AWS KMS를 통한 암호화 키 중앙 관리

#### 🛡️ 접근 제어
- **IAM 최소 권한**: 필요한 최소한의 권한만 부여
- **MFA 강제**: 관리자 계정에 다중 인증 필수 적용
- **보안 그룹**: 필요한 포트만 개방, 소스 IP 제한

#### 📝 감사 및 모니터링
- **CloudTrail**: 모든 API 호출 로깅 활성화
- **VPC Flow Logs**: 네트워크 트래픽 모니터링
- **Config Rules**: 리소스 구성 규정 준수 자동 검사
"""
        
        report += f"""
## 🔄 다음 단계 실행 계획

### 📅 1주일 내 조치사항
{f"- Critical 이슈 {severity_stats['critical']}개 즉시 해결" if severity_stats['critical'] > 0 else "- ✅ 긴급 조치 사항 없음"}
{f"- High 이슈 {severity_stats['high']}개 우선 해결" if severity_stats['high'] > 0 else ""}
- 보안 스캔 결과 팀 내 공유 및 논의
- 자동화된 보안 검사 파이프라인 점검

### 📅 1개월 내 개선사항
{f"- Medium 이슈 {severity_stats['medium']}개 계획적 해결" if severity_stats['medium'] > 0 else ""}
- 보안 정책 문서 업데이트
- 팀 보안 교육 및 가이드라인 수립
- 정기 보안 리뷰 프로세스 구축

### 📅 장기 보안 로드맵
- 보안 자동화 도구 확대 적용
- 제로 트러스트 아키텍처 도입 검토
- 보안 메트릭 및 KPI 수립
- 인시던트 대응 계획 수립

## 📞 추가 지원

- **Checkov 문서**: https://www.checkov.io/
- **보안 가이드라인**: 각 클라우드 제공업체의 보안 모범 사례 참조
- **커뮤니티**: DevSecOps 커뮤니티 및 보안 전문가 네트워크 활용

---
*🤖 이 리포트는 Checkov 정적 분석 도구를 통해 자동 생성되었습니다.*  
*📅 생성 시간: {datetime.now().strftime('%Y년 %m월 %d일 %H:%M:%S')}*  
*⚠️ OpenAI 분석을 사용할 수 없어 기본 리포트로 생성되었습니다.*
"""
        
        return report  
  
    def send_slack_notification(self, severity_stats: Dict, project_type: str, branch: str = None, trigger_reason: str = None, issue_url: str = None) -> bool:
        """Slack 알림 전송 (Requirements: 3.1, 3.2, 3.3)"""
        if not self.slack_webhook_url:
            print("경고: SLACK_WEBHOOK_URL_CHECKOV가 설정되지 않았습니다. Slack 알림을 건너뜁니다.")
            return False
        
        # 프로젝트별 컨텍스트
        project_contexts = {
            'terraform': {
                'name': 'bluesunnywings-eks-tf-sunny',
                'icon': '🏗️',
                'type_display': 'Terraform'
            },
            'kubernetes': {
                'name': 'div4u',
                'icon': '☸️',
                'type_display': 'Kubernetes'
            }
        }
        
        context = project_contexts.get(project_type, {
            'name': project_type,
            'icon': '🔧',
            'type_display': project_type.title()
        })
        
        # 위험도 및 색상 결정
        total_issues = severity_stats['total_issues']
        critical_count = severity_stats['critical']
        high_count = severity_stats['high']
        medium_count = severity_stats['medium']
        low_count = severity_stats['low']
        
        if critical_count > 0:
            color = "danger"  # 빨간색
            risk_emoji = "🚨"
            risk_text = "매우 높음"
        elif high_count > 0:
            color = "warning"  # 주황색
            risk_emoji = "⚠️"
            risk_text = "높음"
        elif medium_count > 0:
            color = "#ffeb3b"  # 노란색
            risk_emoji = "📋"
            risk_text = "보통"
        elif total_issues > 0:
            color = "good"  # 초록색
            risk_emoji = "💡"
            risk_text = "낮음"
        else:
            color = "good"  # 초록색
            risk_emoji = "✅"
            risk_text = "양호"
        
        # 메시지 제목 및 요약 생성
        if total_issues == 0:
            title_text = f"{context['icon']} {context['name']} 보안 검사 완료"
            summary_text = "보안 이슈가 발견되지 않았습니다. 모든 검사를 통과했습니다! 🎉"
        else:
            title_text = f"{context['icon']} {context['name']} 보안 검사 결과"
            if critical_count > 0 or high_count > 0:
                summary_text = f"{risk_emoji} **{total_issues}개 보안 이슈 발견** - 즉시 조치가 필요합니다!"
            else:
                summary_text = f"{risk_emoji} **{total_issues}개 보안 이슈 발견** - 계획적 개선을 권장합니다."
        
        # Slack 메시지 필드 구성
        fields = [
            {
                "title": "프로젝트",
                "value": f"{context['name']} ({context['type_display']})",
                "short": True
            },
            {
                "title": "발견된 이슈",
                "value": f"{total_issues}개" if total_issues > 0 else "없음",
                "short": True
            }
        ]
        
        # 브랜치 정보 추가
        if branch:
            fields.append({
                "title": "브랜치",
                "value": f"`{branch}`",
                "short": True
            })
        
        # 실행 이유 추가
        if trigger_reason:
            reason_display = {
                'push': '코드 Push',
                'pull_request': 'Pull Request',
                'schedule': '정기 스캔',
                'workflow_dispatch': '수동 실행'
            }.get(trigger_reason, trigger_reason)
            
            fields.append({
                "title": "실행 이유",
                "value": reason_display,
                "short": True
            })
        
        # 심각도별 분포 (이슈가 있을 때만)
        if total_issues > 0:
            severity_text = []
            if critical_count > 0:
                severity_text.append(f"🔴 Critical: {critical_count}개")
            if high_count > 0:
                severity_text.append(f"🟠 High: {high_count}개")
            if medium_count > 0:
                severity_text.append(f"🟡 Medium: {medium_count}개")
            if low_count > 0:
                severity_text.append(f"🔵 Low: {low_count}개")
            
            fields.append({
                "title": "심각도별 분포",
                "value": "\n".join(severity_text),
                "short": False
            })
        
        # 메시지 본문 구성
        message_text = summary_text
        if issue_url:
            message_text += f"\n\n📋 **상세 분석 리포트**: {issue_url}"
        
        # Slack 웹훅 페이로드 구성
        payload = {
            "text": title_text,
            "attachments": [
                {
                    "color": color,
                    "fields": fields,
                    "text": message_text,
                    "footer": "Checkov 보안 스캔",
                    "footer_icon": "https://www.checkov.io/favicon.ico",
                    "ts": int(time.time())
                }
            ]
        }
        
        # Slack 웹훅 호출
        try:
            print(f"Slack 알림 전송 중... (이슈: {total_issues}개)")
            response = requests.post(
                self.slack_webhook_url,
                json=payload,
                timeout=30,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                print("✅ Slack 알림 전송 성공")
                return True
            else:
                print(f"⚠️ Slack 알림 전송 실패 (상태 코드: {response.status_code})")
                print(f"응답 내용: {response.text}")
                return False
                
        except requests.exceptions.Timeout:
            print("⚠️ Slack 알림 전송 타임아웃")
            return False
        except requests.exceptions.ConnectionError:
            print("⚠️ Slack 연결 오류")
            return False
        except requests.exceptions.RequestException as e:
            print(f"⚠️ Slack 알림 전송 오류: {str(e)}")
            return False
        except Exception as e:
            print(f"❌ Slack 알림 전송 중 예상치 못한 오류: {str(e)}")
            return False
  
    def generate_issue_metadata(self, severity_stats: Dict, severity_buckets: Dict[str, List], project_type: str) -> Dict[str, Any]:
        """GitHub Issue 생성을 위한 메타데이터 생성 (Requirement 2.4)"""
        # 우선순위 결정
        priority = "LOW"
        if severity_stats['critical'] > 0:
            priority = "CRITICAL"
        elif severity_stats['high'] > 0:
            priority = "HIGH"
        elif severity_stats['medium'] > 0:
            priority = "MEDIUM"
        
        # 프로젝트별 컨텍스트
        project_contexts = {
            'terraform': {
                'name': 'bluesunnywings-eks-tf-sunny',
                'type_label': 'terraform',
                'icon': '🏗️'
            },
            'kubernetes': {
                'name': 'div4u',
                'type_label': 'kubernetes', 
                'icon': '☸️'
            }
        }
        
        context = project_contexts.get(project_type, {
            'name': project_type,
            'type_label': project_type,
            'icon': '🔧'
        })
        
        # 라벨 생성
        labels = ['security', 'checkov', 'automated', context['type_label']]
        labels.append(f"priority:{priority.lower()}")
        
        # 이슈 제목 생성
        title = f"{context['name']} {context['type_label'].title()} 보안 검사 결과: {severity_stats['total_issues']}개 이슈 발견 ({priority})"
        
        return {
            'title': title,
            'labels': labels,
            'priority': priority,
            'project_name': context['name'],
            'project_icon': context['icon'],
            'severity_stats': severity_stats
        }
    
    def analyze_checkov_results(self, json_file: str, project_type: str = 'kubernetes') -> str:
        """메인 분석 함수 - Checkov 결과 분석 및 리포트 생성"""
        print(f"보안 분석 시작: {json_file} (프로젝트 타입: {project_type})")
        
        # 1. Checkov 결과 로드
        data = self.load_checkov_results(json_file)
        failed_checks = data.get('results', {}).get('failed_checks', [])
        
        print(f"발견된 이슈: {len(failed_checks)}개")
        
        if len(failed_checks) == 0:
            return "✅ 보안 이슈가 발견되지 않았습니다. 모든 검사를 통과했습니다!"
        
        # 2. 심각도별 분류
        severity_buckets = self.classify_by_severity(failed_checks)
        severity_stats = self.get_severity_stats(severity_buckets)
        
        # 3. 상위 이슈 및 영향받는 파일 추출
        top_issues = self.get_top_issues(severity_buckets)
        affected_files = self.get_affected_files(failed_checks)
        
        print(f"심각도 분포 - Critical: {severity_stats['critical']}, High: {severity_stats['high']}, Medium: {severity_stats['medium']}, Low: {severity_stats['low']}")
        
        # 4. GitHub Issue 메타데이터 생성 및 출력 (Requirement 2.4)
        issue_metadata = self.generate_issue_metadata(severity_stats, severity_buckets, project_type)
        
        # 환경변수로 메타데이터 출력 (GitHub Actions에서 사용)
        print(f"ISSUE_TITLE={issue_metadata['title']}")
        print(f"ISSUE_LABELS={','.join(issue_metadata['labels'])}")
        print(f"ISSUE_PRIORITY={issue_metadata['priority']}")
        print(f"CRITICAL_COUNT={severity_stats['critical']}")
        print(f"HIGH_COUNT={severity_stats['high']}")
        print(f"MEDIUM_COUNT={severity_stats['medium']}")
        print(f"LOW_COUNT={severity_stats['low']}")
        
        # 5. OpenAI 분석 시도
        if self.openai_api_key and severity_stats['total_issues'] > 0:
            print("OpenAI 분석을 시도합니다...")
            prompt = self.generate_openai_prompt(project_type, severity_stats, top_issues, affected_files)
            ai_report = self.call_openai_api(prompt)
            
            if ai_report:
                print("✅ OpenAI 분석 완료")
                return ai_report
        
        # 6. Fallback 리포트 생성
        print("Fallback 리포트를 생성합니다...")
        return self.generate_fallback_report(project_type, severity_stats, severity_buckets, affected_files)


def main():
    """메인 실행 함수"""
    if len(sys.argv) < 2:
        print("사용법: python analyze_security.py <checkov_json_file> [project_type] [--metadata-only] [--slack-notify]")
        print("project_type: kubernetes (기본값) 또는 terraform")
        print("--metadata-only: GitHub Issue 메타데이터만 출력")
        print("--slack-notify: Slack 알림 전송 (환경변수: GITHUB_REF, GITHUB_EVENT_NAME, ISSUE_URL)")
        sys.exit(1)
    
    json_file = sys.argv[1]
    project_type = sys.argv[2] if len(sys.argv) > 2 else 'kubernetes'
    metadata_only = '--metadata-only' in sys.argv
    slack_notify = '--slack-notify' in sys.argv
    
    if project_type not in ['kubernetes', 'terraform']:
        print(f"경고: 지원되지 않는 프로젝트 타입 '{project_type}'. 기본값 'kubernetes'를 사용합니다.")
        project_type = 'kubernetes'
    
    analyzer = SecurityAnalyzer()
    
    if metadata_only:
        # 메타데이터만 출력 (GitHub Actions에서 환경변수 설정용)
        data = analyzer.load_checkov_results(json_file)
        failed_checks = data.get('results', {}).get('failed_checks', [])
        
        if len(failed_checks) == 0:
            print("TOTAL_ISSUES=0")
            print("CRITICAL_COUNT=0")
            print("HIGH_COUNT=0")
            print("MEDIUM_COUNT=0")
            print("LOW_COUNT=0")
            print("ISSUE_PRIORITY=NONE")
            return
        
        severity_buckets = analyzer.classify_by_severity(failed_checks)
        severity_stats = analyzer.get_severity_stats(severity_buckets)
        issue_metadata = analyzer.generate_issue_metadata(severity_stats, severity_buckets, project_type)
        
        print(f"TOTAL_ISSUES={severity_stats['total_issues']}")
        print(f"CRITICAL_COUNT={severity_stats['critical']}")
        print(f"HIGH_COUNT={severity_stats['high']}")
        print(f"MEDIUM_COUNT={severity_stats['medium']}")
        print(f"LOW_COUNT={severity_stats['low']}")
        print(f"ISSUE_PRIORITY={issue_metadata['priority']}")
        print(f"ISSUE_TITLE={issue_metadata['title']}")
        print(f"ISSUE_LABELS={','.join(issue_metadata['labels'])}")
    elif slack_notify:
        # Slack 알림 전송 모드
        data = analyzer.load_checkov_results(json_file)
        failed_checks = data.get('results', {}).get('failed_checks', [])
        
        severity_buckets = analyzer.classify_by_severity(failed_checks)
        severity_stats = analyzer.get_severity_stats(severity_buckets)
        
        # GitHub Actions 환경변수에서 정보 추출
        github_ref = os.getenv('GITHUB_REF', '')
        branch = github_ref.replace('refs/heads/', '') if github_ref.startswith('refs/heads/') else github_ref
        trigger_reason = os.getenv('GITHUB_EVENT_NAME', 'unknown')
        issue_url = os.getenv('ISSUE_URL', '')
        
        # Slack 알림 전송
        success = analyzer.send_slack_notification(
            severity_stats=severity_stats,
            project_type=project_type,
            branch=branch,
            trigger_reason=trigger_reason,
            issue_url=issue_url
        )
        
        if success:
            print("✅ Slack 알림 전송 완료")
        else:
            print("⚠️ Slack 알림 전송 실패 (파이프라인은 계속 진행)")
    else:
        # 전체 분석 리포트 생성
        report = analyzer.analyze_checkov_results(json_file, project_type)
        print("\n" + "="*80)
        print("보안 분석 리포트")
        print("="*80)
        print(report)


if __name__ == "__main__":
    main()