#!/usr/bin/env bash
set -euo pipefail

cd /root/task

echo "==> [1/5] Installing dependencies (npm ci)..."
if ! npm ci; then
  echo "npm ci failed; falling back to npm install for first-time lockfile materialization."
  npm install
fi

echo "==> [2/5] Starting LocalStack (docker compose up -d)..."
docker compose up -d

echo "==> [3/5] Waiting for LocalStack health..."
ATTEMPTS=0
MAX_ATTEMPTS=30
until curl -sf http://127.0.0.1:4566/_localstack/health >/dev/null 2>&1; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
    echo "LocalStack did not become healthy in time. Recent logs:"
    docker compose logs --tail 40 localstack || true
    echo "FAILURE: LocalStack readiness check failed."
    exit 1
  fi
  echo "   ...still waiting for LocalStack (attempt ${ATTEMPTS}/${MAX_ATTEMPTS})"
  docker compose logs --tail 5 localstack || true
  sleep 5
done
echo "   LocalStack is healthy."

echo "==> [4/5] Building TypeScript project..."
npm run build

echo "==> [5/5] Verifying CDK synthesis for both environments..."
npx cdk synth -c env=dev >/dev/null
npx cdk synth -c env=staging >/dev/null

echo ""
echo "SUCCESS: Environment is ready. Dependencies installed, LocalStack healthy, project builds, and CDK synthesizes for dev and staging."
echo "Note: The assertion test suite is intentionally red until the task is solved."
exit 0
