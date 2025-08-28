#!/bin/bash

ENVIRONMENT=${1:-staging}

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo "Usage: $0 [staging|production]"
    exit 1
fi

echo "🗑️ Deleting $ENVIRONMENT environment..."

# 1. Delete ArgoCD Application first
echo "🎯 Deleting ArgoCD Application..."
kubectl delete -f argocd/div4u-$ENVIRONMENT-application.yaml

# 2. Delete SealedSecrets
echo "🔐 Deleting SealedSecrets..."
kubectl delete -f k8s/environments/$ENVIRONMENT/sealed-secrets.yaml

# 3. Delete main resources
echo "📦 Deleting kustomization..."
kubectl delete -k k8s/environments/$ENVIRONMENT

echo "✅ $ENVIRONMENT deletion completed!"