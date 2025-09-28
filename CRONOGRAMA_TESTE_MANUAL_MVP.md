# 🧪 Cronograma de Teste Manual - W.A.T.A. MVP

## 📋 Visão Geral do Sistema

### **Arquitetura Analisada:**
- **Backend**: 7 rotas principais (agreements, auth, oracle, payments, readings, hedera, batchScheduler)
- **Contratos**: OracleManager + PESContract com threshold de 70%
- **Serviços**: Oracle, Relayer, Hedera, HCS, HFS integrados
- **Automação**: Pagamentos 100% automatizados via event listeners

---

## 🎯 **OBJETIVOS PRINCIPAIS DO TESTE**

### ✅ **Pagamentos 100% Automatizados**: Score ≥ 70 → pagamento automático
### ✅ **Fluxo Completo**: Acordo → Leituras → Validação → Pagamento funciona end-to-end  
### ✅ **Teste de sistema de oráculos**
### ✅ **Auditoria Robusta**: HCS + HFS sempre integrados
### ✅ **Transferências HBAR**: Investidor → Contrato → Produtor

---

## 📅 **CRONOGRAMA DE TESTE (4-6 horas)**

### **FASE 1: Setup e Preparação (30 min)**

#### 1.1. Verificar Ambiente
```bash
# Backend
cd backend && yarn start  # Porta 3001

# Frontend  
cd frontend && yarn dev    # Porta 5173

# Contratos (se necessário)
cd contracts && yarn deploy
```

#### 1.2. Validações Iniciais
- [ ] Backend rodando em `http://localhost:3001`
- [ ] Frontend rodando em `http://localhost:5173`
- [ ] Contratos deployados na Hedera Testnet
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados inicializado

#### 1.3. Verificar Status do Sistema
```bash
# Testar conectividade
curl http://localhost:3001/api/agreements
curl http://localhost:3001/api/oracle/stats
curl http://localhost:3001/api/payments/stats
```

---

### **FASE 2: Teste de Criação de Acordos (45 min)**

#### 2.1. Teste de Registro de Contrato
**Endpoint**: `POST /api/agreements`

**Dados de Teste:**
```json
{
  "producerName": "João Silva",
  "producerAddress": "0x386960838e34953603e77a143fD87af5E5A3351b",
  "baseValue": 100,
  "hectares": 50,
  "locationLat": -23.5505,
  "locationLng": -46.6333,
  "durationDays": 365
}
```

**Validações:**
- [x] Contrato criado com sucesso
- [x] Hash do acordo gerado
- [x] ID do blockchain atribuído
- [x] Transação na Hedera confirmada
- [x] Status "Active" no banco de dados

#### 2.2. Teste de Múltiplos Acordos
- [x] Criar 3 acordos diferentes
- [x] Verificar isolamento entre acordos
- [x] Validar contadores incrementais
- [x] Testar diferentes valores e hectares

#### 2.3. Teste de Validação de Dados
```json
// Teste de dados inválidos
{
  "producerName": "",
  "producerAddress": "invalid_address",
  "baseValue": -100,
  "hectares": 0
}
```
- [ ] Validação de campos obrigatórios
- [ ] Validação de endereços Ethereum
- [ ] Validação de valores positivos

---

### **FASE 3: Teste de Sistema de Leituras (60 min)**

#### 3.1. Simulação de Leituras de Sensores
**Endpoint**: `POST /api/readings`

**Cenários de Teste:**

##### **Cenário A: Leituras de Boa Qualidade**
```json
{
  "agreementId": 1,
  "turbidityNtu": 8,
  "locationLat": -23.5505,
  "locationLng": -46.6333,
  "isSimulated": true
}
```
- [x] Criar 10 leituras com turbidez 5-15 NTU
- [x] Validar timestamps corretos
- [ ] Verificar geolocalização

##### **Cenário B: Leituras de Qualidade Média**
```json
{
  "turbidityNtu": 25,
  "isSimulated": true
}
```
- [ ] Criar 5 leituras com turbidez 20-30 NTU
- [ ] Verificar classificação de qualidade

##### **Cenário C: Leituras Inválidas**
```json
// Teste de valores fora do range
{
  "turbidityNtu": 150,  // > 100 NTU
  "isSimulated": true
}
{
  "turbidityNtu": -5,    // < 0 NTU
  "isSimulated": true
}
```
- [ ] Leituras > 100 NTU rejeitadas
- [ ] Leituras < 0 NTU rejeitadas
- [ ] Mensagens de erro apropriadas

#### 3.2. Teste de Detecção de Outliers
```json
// Criar outliers extremos
{
  "turbidityNtu": 95,  // Outlier extremo
  "isSimulated": true
}
```
- [ ] Sistema detecta outliers
- [ ] Outliers são filtrados do cálculo
- [ ] Score não é afetado por outliers

---

### **FASE 4: Teste do Sistema de Oráculo (90 min)**

#### 4.1. Processamento de Batches
**Endpoint**: `POST /api/oracle/process`

**Teste Individual:**
```json
{
  "agreementId": 1,
  "hoursBack": 168
}
```

**Validações:**
- [ ] Batch processado com sucesso
- [ ] Score calculado corretamente (0-100)
- [ ] Leituras válidas vs inválidas contadas
- [ ] Hash de auditoria gerado
- [ ] Transação na Hedera confirmada

#### 4.2. Teste de Cálculo de Score

##### **Score Alto (≥ 70) - Pagamento Aprovado**
- [ ] Score ≥ 70 → Pagamento aprovado automaticamente
- [ ] Event `PaymentApproved` emitido
- [ ] Status "approved" no banco
- [ ] Relayer processa pagamento

##### **Score Baixo (< 70) - Pagamento Rejeitado**
- [ ] Score < 70 → Pagamento rejeitado
- [ ] Event `PaymentApproved` NÃO emitido
- [ ] Status "rejected" no banco
- [ ] Logs de auditoria registrados

#### 4.3. Teste de Processamento em Lote
**Endpoint**: `POST /api/oracle/process-all`

- [ ] Todos os acordos ativos processados
- [ ] Resultados individuais reportados
- [ ] Erros isolados não afetam outros acordos
- [ ] Estatísticas atualizadas

#### 4.4. Validação de Regras de Negócio

##### **Threshold de 70%**
```javascript
// Teste via API
const testScores = [65, 70, 75, 80, 85, 90, 95];

testScores.forEach(score => {
  // Simular score específico
  // Verificar se pagamento é aprovado/rejeitado corretamente
});
```

- [ ] Score 65 → Rejeitado
- [ ] Score 70 → Aprovado
- [ ] Score 75+ → Aprovado

---

### **FASE 5: Teste de Automação de Pagamentos (60 min)**

#### 5.1. Teste de Event Listeners
**Verificar se o RelayerService está funcionando:**

```bash
# Verificar logs do backend
tail -f backend/logs/relayer.log
```

- [ ] RelayerService inicializado
- [ ] Event listeners ativos
- [ ] Conexão com contrato estabelecida

#### 5.2. Teste de Fluxo Automático

##### **Cenário: Score ≥ 70**
1. Processar batch com score alto
2. **VALIDAR**:
   - [ ] Event `PaymentApproved` detectado
   - [ ] Relayer processa automaticamente
   - [ ] Pagamento executado na Hedera
   - [ ] Status atualizado para "completed"
   - [ ] HCS + HFS integrados

##### **Cenário: Score < 70**
1. Processar batch com score baixo
2. **VALIDAR**:
   - [ ] Event `PaymentApproved` NÃO emitido
   - [ ] Pagamento não processado
   - [ ] Status permanece "rejected"
   - [ ] Logs de auditoria registrados

#### 5.3. Teste de Transferências HBAR

##### **Fluxo: Investidor → Contrato → Produtor**
```json
// 1. Investidor contribui
POST /api/payments/contribute/1
{
  "amount": 5000,
  "investorAddress": "0xInvestorAddress"
}

// 2. Verificar investimento
GET /api/payments/investments/1

// 3. Processar pagamento (automático)
// 4. Verificar transferência
```

- [ ] Investimento registrado no contrato
- [ ] HBAR transferido para contrato
- [ ] Pagamento automático para produtor
- [ ] Saldo do contrato atualizado

---

### **FASE 6: Teste de Sistema de Auditoria (45 min)**

#### 6.1. Teste de Integração HCS
**Verificar logs de auditoria:**

```bash
# Verificar logs HCS
curl http://localhost:3001/api/oracle/logs
```

- [ ] Transações registradas no HCS
- [ ] Hashes de auditoria únicos
- [ ] Timestamps corretos
- [ ] Dados imutáveis

#### 6.2. Teste de Integração HFS
**Verificar arquivos de auditoria:**

- [ ] Relatórios salvos no HFS
- [ ] Metadados corretos
- [ ] Acessibilidade dos arquivos
- [ ] Integridade dos dados

#### 6.3. Teste de Rastreabilidade
**Verificar cadeia de auditoria:**

- [ ] Leitura → Batch → Score → Pagamento
- [ ] Cada etapa tem hash único
- [ ] Links entre etapas verificáveis
- [ ] Logs completos disponíveis

---

### **FASE 7: Teste de Interface e Dashboard (30 min)**

#### 7.1. Teste do Dashboard Principal
**Acessar**: `http://localhost:5173`

- [ ] Métricas em tempo real
- [ ] Contratos ativos listados
- [ ] Leituras recentes exibidas
- [ ] Status de pagamentos atualizado

#### 7.2. Teste de Navegação
- [ ] Aba "Contracts" funcional
- [ ] Aba "Monitoring" funcional  
- [ ] Aba "Audit" funcional
- [ ] Aba "Notifications" funcional

#### 7.3. Teste de Responsividade
- [ ] Interface responsiva
- [ ] Dados atualizados automaticamente
- [ ] Loading states apropriados
- [ ] Tratamento de erros

---

### **FASE 8: Teste de Casos de Erro (30 min)**

#### 8.1. Teste de Conectividade
```bash
# Parar backend temporariamente
# Testar recuperação
```

- [ ] Frontend trata desconexão graciosamente
- [ ] Reconexão automática
- [ ] Mensagens de erro apropriadas

#### 8.2. Teste de Dados Inválidos
- [ ] APIs rejeitam dados inválidos
- [ ] Mensagens de erro claras
- [ ] Sistema não quebra com dados malformados

#### 8.3. Teste de Segurança
- [ ] Apenas oráculos autorizados processam
- [ ] Validação de assinaturas
- [ ] Acesso restrito por roles

---

## 🎯 **CRITÉRIOS DE SUCESSO**

### **Funcionalidades Core**
- [ ] ✅ **Pagamentos 100% Automatizados**: Score ≥ 70 → pagamento automático
- [ ] ✅ **Fluxo Completo**: Acordo → Leituras → Validação → Pagamento funciona end-to-end
- [ ] ✅ **Sistema de Oráculo**: Validação robusta com detecção de outliers
- [ ] ✅ **Auditoria Robusta**: HCS + HFS sempre integrados
- [ ] ✅ **Transferências HBAR**: Investidor → Contrato → Produtor

### **Validação de Dados**
- [ ] Leituras fora do range (0-100 NTU) são rejeitadas
- [ ] Outliers extremos são detectados e filtrados
- [ ] Cross-validation entre sensores (simulada)
- [ ] Assinatura criptográfica dos batches

### **Automação**
- [ ] Relayer processa pagamentos aprovados
- [ ] Logs de auditoria completos
- [ ] Transações registradas na Hedera
- [ ] Status de pagamentos atualizados

### **Interface**
- [ ] Dashboard com métricas em tempo real
- [ ] Audit dashboard funcional
- [ ] Navegação entre abas
- [ ] Tratamento de erros e loading states

### **Segurança**
- [ ] Apenas oráculos autorizados processam batches
- [ ] Validação de dados de entrada
- [ ] Auditoria completa de ações
- [ ] Recuperação de erros

---

## 📊 **RELATÓRIO DE TESTE**

### **Checklist de Validação**
- [ ] **FASE 1**: Setup e Preparação
- [ ] **FASE 2**: Criação de Acordos
- [ ] **FASE 3**: Sistema de Leituras
- [ ] **FASE 4**: Sistema de Oráculo
- [ ] **FASE 5**: Automação de Pagamentos
- [ ] **FASE 6**: Sistema de Auditoria
- [ ] **FASE 7**: Interface e Dashboard
- [ ] **FASE 8**: Casos de Erro

### **Métricas de Sucesso**
- **Tempo Total**: 4-6 horas
- **Cobertura**: 100% das funcionalidades core
- **Automação**: 100% dos pagamentos automatizados
- **Auditoria**: 100% das ações rastreáveis

### **Pontos Críticos**
1. **Threshold de 70%** deve ser respeitado rigorosamente
2. **Event listeners** devem estar sempre ativos
3. **HCS + HFS** devem estar integrados em todas as operações
4. **Transferências HBAR** devem ser verificáveis na blockchain

---

## 🚨 **TROUBLESHOOTING**

### **Problemas Comuns**
- **Backend não conecta**: Verificar porta 3001 e variáveis de ambiente
- **Oráculo falha**: Verificar ORACLE_ADDRESS e ORACLE_PRIVATE_KEY
- **Pagamentos não processam**: Verificar RelayerService e event listeners
- **Scores baixos**: Verificar qualidade das leituras e detecção de outliers

### **Comandos de Diagnóstico**
```bash
# Verificar status do sistema
curl http://localhost:3001/api/oracle/stats
curl http://localhost:3001/api/payments/stats

# Verificar logs
tail -f backend/logs/relayer.log
tail -f backend/logs/oracle.log
```

---

**🎯 O teste é considerado APROVADO quando todos os critérios de sucesso são atendidos e o fluxo completo funciona sem intervenção manual.**
