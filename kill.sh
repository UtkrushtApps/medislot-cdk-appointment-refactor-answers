#!/usr/bin/env bash
set -uo pipefail

echo "==> [1/9] Starting cleanup..."

cd /root/task 2>/dev/null || true

echo "==> [2/9] Stopping docker compose services..."
docker compose down || true

echo "==> [3/9] Removing docker compose volumes..."
docker compose down -v || true

echo "==> [4/9] Removing task-specific Docker networks..."
docker network rm task_default 2>/dev/null || true
docker network rm medislot_default 2>/dev/null || true

echo "==> [5/9] Removing task-specific Docker images..."
docker rmi -f localstack/localstack:3.4 || true

echo "==> [6/9] Pruning leftover Docker resources..."
docker system prune -a --volumes -f || true

echo "==> [7/9] Removing generated local artifacts..."
rm -rf /root/task/node_modules || true
rm -rf /root/task/cdk.out || true
rm -rf /root/task/coverage || true
rm -rf /root/task/dist || true
rm -rf /root/task/.localstack || true
rm -f /root/task/*.log || true

echo "==> [8/9] Removing /root/task..."
rm -rf /root/task || true

echo "==> [9/9] Cleanup completed successfully!"
