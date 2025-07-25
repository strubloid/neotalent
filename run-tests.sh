#!/bin/bash

echo "=== Starting Test Runner ==="
echo "=== Checking Container Status ==="
# docker-compose ps

echo ""
echo "=== Running Backend Tests ==="
docker-compose exec -T backend npm test 2>&1

echo ""
echo "=== Running Frontend Tests ==="
docker-compose exec -T frontend npm test -- --coverage --ci --watchAll=false 2>&1

echo ""
echo "=== Test Runner Complete ==="
