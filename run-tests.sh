#!/bin/bash

echo "🧪 Executando Suite de Testes W.A.T.A. Chain"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to run tests and show results
run_tests() {
    local test_name="$1"
    local test_command="$2"
    local test_dir="$3"
    
    echo -e "\n${BLUE}📋 Executando: $test_name${NC}"
    echo "Diretório: $test_dir"
    echo "Comando: $test_command"
    echo "----------------------------------------"
    
    cd "$test_dir"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ $test_name: PASSOU${NC}"
        return 0
    else
        echo -e "${RED}❌ $test_name: FALHOU${NC}"
        return 1
    fi
}

# Track test results
total_tests=0
passed_tests=0

# 1. Testes do Contrato (Hardhat)
echo -e "\n${YELLOW}🔗 TESTES DO CONTRATO${NC}"
if run_tests "Contratos Smart Contract" "npx hardhat test" "contracts"; then
    ((passed_tests++))
fi
((total_tests++))

# 2. Testes do Backend (Jest)
echo -e "\n${YELLOW}⚙️  TESTES DO BACKEND${NC}"
if run_tests "Backend Integration Tests" "yarn test" "backend"; then
    ((passed_tests++))
fi
((total_tests++))

# 3. Testes do Frontend (Jest)
echo -e "\n${YELLOW}🎨 TESTES DO FRONTEND${NC}"
if run_tests "Frontend Component Tests" "yarn test" "frontend"; then
    ((passed_tests++))
fi
((total_tests++))

# 4. Testes de Integração End-to-End
echo -e "\n${YELLOW}🔄 TESTES E2E${NC}"
if run_tests "End-to-End Integration Tests" "yarn test end-to-end" "backend"; then
    ((passed_tests++))
fi
((total_tests++))

# Summary
echo -e "\n${BLUE}📊 RESUMO DOS TESTES${NC}"
echo "=============================================="
echo -e "Total de Suites: $total_tests"
echo -e "Passou: ${GREEN}$passed_tests${NC}"
echo -e "Falhou: ${RED}$((total_tests - passed_tests))${NC}"

if [ $passed_tests -eq $total_tests ]; then
    echo -e "\n${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
    echo -e "${GREEN}✅ Sistema W.A.T.A. Chain está funcionando corretamente${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  ALGUNS TESTES FALHARAM${NC}"
    echo -e "${RED}❌ Verifique os logs acima para detalhes${NC}"
    exit 1
fi
