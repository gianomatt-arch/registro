#!/bin/bash

# Script di test per verificare l'installazione di Registro Elettronico

echo "🧪 Testing Registro Elettronico Installation"
echo "=============================================="
echo ""

# Colori
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Contatori
PASSED=0
FAILED=0

# Funzione test
test_url() {
    local url=$1
    local name=$2
    
    echo -n "Testing $name... "
    if curl -s -o /dev/null -w "%{http_code}" "$url" > /tmp/status.txt 2>/dev/null; then
        status=$(cat /tmp/status.txt)
        if [ "$status" -eq 200 ] || [ "$status" -eq 301 ] || [ "$status" -eq 302 ]; then
            echo -e "${GREEN}✓ OK${NC} (HTTP $status)"
            ((PASSED++))
        else
            echo -e "${RED}✗ FAIL${NC} (HTTP $status)"
            ((FAILED++))
        fi
    else
        echo -e "${RED}✗ FAIL${NC} (No response)"
        ((FAILED++))
    fi
}

test_port() {
    local port=$1
    local name=$2
    
    echo -n "Testing port $port ($name)... "
    if nc -z localhost $port 2>/dev/null; then
        echo -e "${GREEN}✓ OPEN${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ CLOSED${NC}"
        ((FAILED++))
    fi
}

test_docker() {
    local container=$1
    local name=$2
    
    echo -n "Testing Docker container $name... "
    if docker-compose ps | grep -q "$container"; then
        echo -e "${GREEN}✓ RUNNING${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ NOT RUNNING${NC}"
        ((FAILED++))
    fi
}

# Test Docker Containers
echo "📦 Docker Containers:"
test_port 8080 "Keycloak"
test_port 5432 "PostgreSQL"
test_port 3306 "MySQL"
test_port 5000 "Flask"
test_port 4200 "Angular"
echo ""

# Test Services
echo "🔗 Services:"
test_url "http://localhost:8080" "Keycloak"
test_url "http://localhost:5000/health" "Flask Health"
test_url "http://localhost:4200" "Angular"
echo ""

# Test API Endpoints
echo "📡 API Endpoints:"
TOKEN="test-token"
test_url "http://localhost:5000/health" "GET /health"
echo ""

# Test Files
echo "📁 Required Files:"
files=(
    "docker-compose.yml"
    "setup-keycloak.sh"
    "registroBackend/app.py"
    "registroBackend/auth.py"
    "registroBackend/database.py"
    "registroFrontend/package.json"
    "registroFrontend/angular.json"
)

for file in "${files[@]}"; do
    echo -n "Checking $file... "
    if [ -f "/workspaces/registro/$file" ]; then
        echo -e "${GREEN}✓ EXISTS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ MISSING${NC}"
        ((FAILED++))
    fi
done
echo ""

# Summary
echo "=============================================="
echo "📊 Test Summary:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! Application is ready.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check logs above.${NC}"
    exit 1
fi
