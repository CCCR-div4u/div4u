#!/bin/bash

ENVIRONMENT=${1:-staging}

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo "Usage: $0 [staging|production]"
    exit 1
fi

echo "🔐 Deploying SealedSecrets for $ENVIRONMENT environment..."
kubectl apply -f k8s/environments/$ENVIRONMENT/sealed-secrets.yaml

echo "✅ SealedSecrets deployed successfully!"