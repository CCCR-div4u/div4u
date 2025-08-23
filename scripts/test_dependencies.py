#!/usr/bin/env python3
"""
의존성 패키지 테스트 스크립트
"""

import sys
import os

def test_imports():
    """필수 패키지 import 테스트"""
    print("🔍 Python 환경 및 패키지 테스트 시작...")
    print(f"Python 버전: {sys.version}")
    print(f"Python 경로: {sys.executable}")
    print(f"현재 작업 디렉터리: {os.getcwd()}")
    
    # 필수 패키지 테스트
    packages = ['json', 'os', 'sys', 'requests', 'time', 'datetime']
    
    for package in packages:
        try:
            __import__(package)
            print(f"✅ {package}: 정상")
        except ImportError as e:
            print(f"❌ {package}: 실패 - {e}")
            return False
    
    # OpenAI 패키지 테스트 (선택적)
    try:
        import openai
        print(f"✅ openai: 정상 (버전: {openai.__version__ if hasattr(openai, '__version__') else 'unknown'})")
    except ImportError:
        print("⚠️ openai: 미설치 (선택적 패키지)")
    
    # 환경변수 확인
    print("\n🔍 환경변수 확인:")
    env_vars = ['OPENAI_API_KEY', 'SLACK_WEBHOOK_URL_CHECKOV', 'MAX_ISSUES_FOR_AI']
    for var in env_vars:
        value = os.getenv(var)
        if value:
            if 'KEY' in var or 'URL' in var:
                print(f"✅ {var}: 설정됨 (***)")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"⚠️ {var}: 미설정")
    
    print("\n✅ 의존성 테스트 완료")
    return True

if __name__ == "__main__":
    success = test_imports()
    sys.exit(0 if success else 1)