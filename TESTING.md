# 🧪 W.A.T.A. Chain - Guia de Testes

Este documento descreve como executar os testes unitários e de integração para o MVP da W.A.T.A. Chain.

## 📋 Visão Geral

O projeto inclui duas suítes de testes:

1. **Testes Unitários** - Contrato inteligente `PESContract.sol` (Hardhat)
2. **Testes de Integração** - Backend Node.js + Express (Jest + Supertest)

## 🔹 Testes Unitários - Smart Contract

### Pré-requisitos

```bash
cd contracts
yarn install
```

### Executar Testes

```bash
# Executar todos os testes
yarn test

# Executar testes com relatório de gas
yarn test --gas-reporter

# Executar testes com cobertura
yarn hardhat coverage
```

### Testes Cobertos

- ✅ **Criação de Contratos**
  - Deve permitir criação com parâmetros válidos
  - Deve rejeitar baseValue = 0 ou hectares = 0
  - Deve emitir evento `AgreementCreated`

- ✅ **Registro de Auditoria**
  - Deve registrar auditHash corretamente
  - Deve emitir evento `AuditRecorded`

- ✅ **Solicitação de Pagamento**
  - Deve permitir requestPayment e emitir `PaymentRequested`
  - Deve calcular valor correto (baseValue * hectares)
  - Deve impedir pagamento para contratos inexistentes

- ✅ **Controle de Acesso**
  - Verificar permissões de owner
  - Testar funções view públicas

### Exemplo de Saída

```
  PESContract
    Deployment
      ✓ Should set the right owner
      ✓ Should start with zero agreements
    Agreement Creation
      ✓ Should create agreement with valid parameters and emit event
      ✓ Should reject agreement creation with zero baseValue
      ✓ Should reject agreement creation with zero hectares
    Payment Request
      ✓ Should request payment and emit PaymentRequested event
      ✓ Should calculate payment amount correctly

  25 passing (2.3s)
```

## 🔹 Testes de Integração - Backend

### Pré-requisitos

```bash
cd backend
yarn install
```

### Configuração

Os testes usam:
- **SQLite in-memory** para database
- **Mocks da Hedera SDK** para evitar chamadas reais à blockchain
- **Supertest** para testes de API

### Executar Testes

```bash
# Executar todos os testes
yarn test

# Executar em modo watch
yarn test:watch

# Executar com cobertura
yarn test:coverage
```

### Testes Cobertos

#### 🔸 POST /api/agreements
- ✅ Deve retornar 201 e salvar no DB
- ✅ Deve chamar `createAgreement` no contrato (mockado)
- ✅ Deve rejeitar dados incompletos (400)

#### 🔸 POST /api/readings/simulate
- ✅ Deve gerar leitura válida (0-20 NTU)
- ✅ Deve retornar JSON com dados corretos
- ✅ Deve rejeitar sem agreementId (400)

#### 🔸 POST /api/readings/submit
- ✅ Deve aceitar leitura válida
- ✅ Deve salvar no DB e chamar `recordAudit`
- ✅ Deve rejeitar turbidez fora do range (400)

#### 🔸 POST /api/payments/trigger-check
- ✅ **Conformidade OK**: Deve aprovar pagamento (média ≤ 10 NTU)
- ✅ **Não-conformidade**: Deve reprovar (média > 10 NTU)
- ✅ Deve chamar `requestPayment` no contrato
- ✅ Deve criar registro de pagamento no DB

#### 🔸 Endpoints de Consulta
- ✅ GET /api/agreements - Listar contratos
- ✅ GET /api/readings/recent - Leituras recentes
- ✅ GET /api/payments/stats - Estatísticas de pagamento
- ✅ GET /api/health - Health check

### Exemplo de Saída

```
 PASS  __tests__/integration.test.ts
  W.A.T.A. Chain Integration Tests
    Health Check
      ✓ should return healthy status (45ms)
    POST /api/agreements - Agreement Creation
      ✓ should create agreement successfully and return 201 (67ms)
      ✓ should reject agreement with missing required fields (23ms)
    POST /api/readings/simulate - Reading Simulation
      ✓ should generate valid turbidity reading (0-20 NTU) (34ms)
    POST /api/payments/trigger-check - Payment Trigger
      ✓ should approve payment for compliant readings (≤10 NTU) (89ms)
      ✓ should reject payment for non-compliant readings (>10 NTU) (76ms)

  28 passing (1.2s)

----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |   87.45 |    73.21 |   89.47 |   86.92 |
----------|---------|----------|---------|---------|-------------------
```

## 🔹 Mocks e Simulações

### Hedera SDK Mock

Os testes de integração usam mocks completos da Hedera SDK:

```typescript
// Mock das principais classes
jest.mock('@hashgraph/sdk', () => ({
  Client: { forTestnet: jest.fn().mockReturnValue({...}) },
  ContractExecuteTransaction: jest.fn().mockImplementation(() => ({...})),
  // ... outros mocks
}))
```

### Database In-Memory

```typescript
// Configuração para testes
process.env.DB_PATH = ':memory:'
```

## 🔹 CI/CD Integration

### GitHub Actions (exemplo)

```yaml
name: Tests
on: [push, pull_request]
jobs:
  contract-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd contracts && yarn install && yarn test
  
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd backend && yarn install && yarn test:coverage
```

## 🔹 Executar Todos os Testes

Para executar toda a suíte de testes do projeto:

```bash
# Na raiz do projeto
./run-all-tests.sh
```

Ou manualmente:

```bash
# Testes do contrato
cd contracts && yarn test

# Testes do backend
cd ../backend && yarn test

# Voltar para raiz
cd ..
```

## 🔹 Debugging

### Logs de Teste

Para habilitar logs durante os testes:

```bash
# Backend
DEBUG=true yarn test

# Contrato (verbose)
yarn hardhat test --verbose
```

### Problemas Comuns

1. **Timeout nos testes**: Aumentar timeout no jest.config.js
2. **Erro de porta ocupada**: Os testes usam porta aleatória (PORT=0)
3. **Mock não funcionando**: Verificar ordem dos imports

## 🔹 Métricas de Cobertura

### Metas de Cobertura

- **Contratos**: > 90% cobertura de linhas
- **Backend**: > 85% cobertura de linhas
- **Funções críticas**: 100% cobertura

### Relatórios

```bash
# Gerar relatório HTML
cd backend && yarn test:coverage
# Abrir: backend/coverage/lcov-report/index.html
```

## 🔹 Próximos Passos

1. **Testes E2E**: Integração completa frontend + backend + contrato
2. **Testes de Performance**: Load testing dos endpoints
3. **Testes de Segurança**: Validação de inputs e ataques
4. **Testes de Rede**: Hedera Testnet real (não mockada)

---

## 📞 Suporte

Para dúvidas sobre os testes:

1. Verificar logs de erro detalhados
2. Consultar documentação do Jest/Hardhat
3. Revisar mocks da Hedera SDK
4. Verificar configuração de ambiente (.env.test)
