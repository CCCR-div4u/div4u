#!/bin/bash

set -e

HARBOR_URL="${HARBOR_URL}"
HARBOR_USERNAME="${HARBOR_USERNAME}"
HARBOR_PASSWORD="${HARBOR_PASSWORD}"
PROJECT_NAME="${PROJECT_NAME:-div4u}"

get_auth_header() {
    echo "Authorization: Basic $(echo -n "${HARBOR_USERNAME}:${HARBOR_PASSWORD}" | base64)"
}

# 프로젝트 생성 (자동 스캔 + SBOM 활성화)
ensure_project() {
    response=$(curl -s -w "%{http_code}" -o /dev/null \
        -H "$(get_auth_header)" \
        "${HARBOR_URL}/api/v2.0/projects/${PROJECT_NAME}")
    
    if [[ "$response" == "404" ]]; then
        curl -X POST \
            -H "$(get_auth_header)" \
            -H "Content-Type: application/json" \
            "${HARBOR_URL}/api/v2.0/projects" \
            -d "{
                \"project_name\": \"${PROJECT_NAME}\",
                \"public\": false,
                \"metadata\": {
                    \"auto_scan\": \"true\",
                    \"auto_sbom_generation\": \"true\",
                    \"severity\": \"low\"
                }
            }"
    fi
}

# 자동 스캔 + SBOM 설정
configure_auto_scan() {
    curl -X PUT \
        -H "$(get_auth_header)" \
        -H "Content-Type: application/json" \
        "${HARBOR_URL}/api/v2.0/projects/${PROJECT_NAME}" \
        -d "{
            \"metadata\": {
                \"auto_scan\": \"true\",
                \"auto_sbom_generation\": \"true\",
                \"severity\": \"low\"
            }
        }"
}

ensure_project
configure_auto_scan
echo "Harbor auto-scan and SBOM generation enabled for ${PROJECT_NAME}"