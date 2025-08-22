#!/bin/bash

ENVIRONMENT=${1:-staging}

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo "Usage: $0 [staging|production]"
    exit 1
fi

echo "🚀 Deploying $ENVIRONMENT environment..."

# 1. Deploy main resources (ArgoCD will handle this automatically)
echo "📦 Applying kustomization..."
kubectl apply -k k8s/environments/$ENVIRONMENT

# 2. Deploy SealedSecrets manually
echo "🔐 Deploying SealedSecrets..."
kubectl apply -f k8s/environments/$ENVIRONMENT/sealed-secrets.yaml

# 3. Restart deployments to pick up secrets
echo "🔄 Restarting deployments..."
kubectl rollout restart deployment -n div4u-$ENVIRONMENT

# 4. Deploy ArgoCD Application
echo "🎯 Deploying ArgoCD Application..."
kubectl apply -f argocd/div4u-$ENVIRONMENT-application.yaml

echo "✅ $ENVIRONMENT deployment completed!"