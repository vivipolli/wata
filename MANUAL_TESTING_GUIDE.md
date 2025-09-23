# 🧪 Guia de Teste Manual - W.A.T.A. Phase 2

## 📋 Pré-requisitos

### 1. Ambiente Configurado
```bash
# Backend
cd backend
yarn
yarn start  # Deve rodar na porta 3001

# Frontend (nova aba do terminal)
cd frontend
yarn 
yarn dev  # Deve rodar na porta 5173
```

### 2. Verificar Configuração
- ✅ Backend rodando em `http://localhost:3001`
- ✅ Frontend rodando em `http://localhost:5173`
- ✅ Contratos deployados na Hedera Testnet
- ✅ Variáveis de ambiente configuradas

---

## 🎯 Caso de Uso: Fluxo Completo do Oráculo

### **Cenário**: Produtor rural com acordo PES que será avaliado pelo oráculo

---

## 📝 PASSO 1: Verificar Status Inicial

### 1.1. Acessar Dashboard Principal
1. Abra `http://localhost:5173`
2. **VALIDAR**: Página carrega sem erros
3. **VALIDAR**: Header mostra "W.A.T.A. Chain" com status "Online" (bolinha verde)
4. **VALIDAR**: Navegação tem 5 abas: Dashboard, Contracts, Monitoring, Audit, Notifications

### 1.2. Verificar Métricas Iniciais
**No Dashboard principal, verificar cards de estatísticas:**

| Métrica | Valor Esperado | Validação |
|---------|----------------|-----------|
| Active Contracts | 0 ou mais | ✅ Número não negativo |
| Pending Payments | 0 | ✅ Inicialmente zero |
| Last Turbidity | 0 NTU | ✅ Sem leituras iniciais |
| Compliance Rate | 0% | ✅ Sem dados históricos |
| Oracle Score | 0% | ✅ Sem validações ainda |
| Validation Rate | 0% | ✅ Sem atividade do oráculo |

---

## 📝 PASSO 2: Criar Acordo PES

### 2.1. Navegar para Contratos
1. Clique na aba **"Contracts"**
2. **VALIDAR**: Página de registro de contratos carrega
3. **VALIDAR**: Formulário com campos obrigatórios visível

### 2.2. Preencher Dados do Produtor
**Preencher o formulário com dados de teste:**

```
Producer Name: João Silva
Producer Address: 0x386960838e34953603e77a143fD87af5E5A3351b
Base Value: 100
Hectares: 50
Location (Lat): -23.5505
Location (Lng): -46.6333
Duration (days): 365
```

### 2.3. Registrar Contrato
1. Clique em **"Register Contract"**
2. **VALIDAR**: Loading aparece no botão
3. **VALIDAR**: Após alguns segundos, mensagem de sucesso
4. **VALIDAR**: Contrato aparece na lista abaixo do formulário

### 2.4. Verificar Contrato Criado
**Na lista de contratos, validar:**
- ✅ Nome do produtor: "João Silva"  
- ✅ Endereço correto
- ✅ Valor base: 100 HBAR/ha
- ✅ Hectares: 50
- ✅ Status: "Active"
- ✅ Hash do acordo gerado automaticamente

---

## 📝 PASSO 3: Simular Leituras de Sensores

### 3.1. Navegar para Monitoramento
1. Clique na aba **"Monitoring"**
2. **VALIDAR**: Página de monitoramento carrega
3. **VALIDAR**: Lista de leituras (inicialmente vazia)

### 3.2. Gerar Leituras Simuladas
**Para criar um cenário de teste robusto, vamos simular diferentes tipos de leituras:**

#### Leituras de Boa Qualidade (Score Alto)
1. Clique em **"Simulate Reading"** 5 vezes
2. **VALIDAR**: Cada clique gera uma nova leitura
3. **VALIDAR**: Valores de turbidez entre 5-15 NTU (boa qualidade)
4. **VALIDAR**: Timestamp atual em cada leitura

#### Leituras de Qualidade Média
1. Continue clicando **"Simulate Reading"** mais 3 vezes
2. **VALIDAR**: Valores podem variar entre 10-25 NTU

#### Verificar Lista de Leituras
**Na lista de leituras, validar:**
- ✅ Pelo menos 8 leituras criadas
- ✅ Valores de turbidez variados
- ✅ Todas marcadas como "Simulated: Yes"
- ✅ Timestamps em ordem decrescente (mais recente primeiro)
- x Localização preenchida 

---

## 📝 PASSO 4: Testar Sistema de Oráculo

### 4.1. Navegar para Dashboard de Auditoria
1. Clique na aba **"Audit"**
2. **VALIDAR**: Dashboard de auditoria carrega
3. **VALIDAR**: Estatísticas do oráculo visíveis no topo
4. **VALIDAR**: Lista de acordos no lado esquerdo
5. **VALIDAR**: Área de batches no lado direito (vazia inicialmente)

### 4.2. Verificar Estatísticas do Oráculo
**No topo da página, verificar cards:**

| Estatística | Valor Inicial | Validação |
|-------------|---------------|-----------|
| Pending Batches | 0 | ✅ Sem batches processados |
| Recent Validations | 0 | ✅ Sem validações ainda |
| Recent Submissions | 0 | ✅ Sem submissões |
| Success Rate | 0% | ✅ Sem histórico |

### 4.3. Processar Batch Individual
1. **VALIDAR**: Acordo "João Silva" aparece na lista da esquerda
2. Clique no botão **"Process"** ao lado do acordo
3. **VALIDAR**: Botão muda para "Processing..." temporariamente
4. **VALIDAR**: Após processamento (5-10 segundos):
   - ✅ Mensagem de sucesso ou erro
   - ✅ Estatísticas do oráculo atualizadas
   - ✅ Batch aparece na área direita

### 4.4. Analisar Resultado do Batch
**No painel de batches (lado direito), verificar:**

#### Badge de Score
- 🟢 **Verde (80-100)**: "Score: XX.X" - Excelente qualidade
- 🟡 **Amarelo (70-79)**: "Score: XX.X" - Boa qualidade  
- 🔴 **Vermelho (<70)**: "Score: XX.X" - Qualidade insuficiente

#### Métricas do Batch
- ✅ **Readings**: Número total de leituras processadas
- ✅ **Avg Turbidity**: Média de turbidez calculada
- ✅ **Outliers**: Número de outliers detectados
- ✅ **Status**: "submitted" (enviado ao contrato)

#### Hash de Auditoria
- ✅ **Audit Hash**: Hash criptográfico do batch (formato: abc12345...xyz67890)

---

## 📝 PASSO 5: Validar Regras de Negócio do Oráculo

### 5.1. Teste de Validação de Leituras

#### Criar Leituras Inválidas (Teste Manual via API)
**Abra o console do navegador (F12) e execute:**

```javascript
// Teste 1: Leitura fora do range (>100 NTU)
fetch('http://localhost:3001/api/readings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agreementId: 1, // Use o ID do acordo criado
    turbidityNtu: 150, // INVÁLIDO: > 100
    locationLat: -23.5505,
    locationLng: -46.6333,
    isSimulated: true
  })
})

// Teste 2: Leitura fora do range (<0 NTU)  
fetch('http://localhost:3001/api/readings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agreementId: 1,
    turbidityNtu: -5, // INVÁLIDO: < 0
    locationLat: -23.5505,
    locationLng: -46.6333,
    isSimulated: true
  })
})
```

#### Processar Batch com Leituras Inválidas
1. Volte para a aba **"Audit"**
2. Clique **"Process"** novamente no acordo
3. **VALIDAR**: 
   - ✅ Batch processa apenas leituras válidas
   - ✅ "Invalid Readings" > 0 (mostra leituras rejeitadas)
   - ✅ Score pode ser menor devido a menos dados válidos

### 5.2. Teste de Threshold de Pagamento

#### Cenário A: Score ≥ 70 (Pagamento Aprovado)
**Se o score do batch for ≥ 70:**
1. Vá para aba **"Dashboard"** principal
2. **VALIDAR**: 
   - ✅ "Pending Payments" aumentou em 1
   - ✅ "Oracle Score" mostra valor ≥ 70
3. Vá para aba **"Monitoring"** 
4. **VALIDAR**: Pode aparecer nova entrada de pagamento processado

#### Cenário B: Score < 70 (Pagamento Rejeitado)
**Se o score for < 70:**
1. **VALIDAR**: "Pending Payments" permanece igual
2. **VALIDAR**: Batch é registrado mas sem pagamento
3. **VALIDAR**: Logs de auditoria mostram validação sem aprovação

### 5.3. Teste de Detecção de Outliers

#### Criar Outliers Extremos
**No console do navegador:**

```javascript
// Criar várias leituras normais
for(let i = 0; i < 5; i++) {
  fetch('http://localhost:3001/api/readings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agreementId: 1,
      turbidityNtu: 8, // Valor normal
      locationLat: -23.5505,
      locationLng: -46.6333,
      isSimulated: true
    })
  })
}

// Criar outliers extremos
fetch('http://localhost:3001/api/readings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agreementId: 1,
    turbidityNtu: 95, // OUTLIER EXTREMO
    locationLat: -23.5505,
    locationLng: -46.6333,
    isSimulated: true
  })
})
```

#### Validar Detecção
1. Processe novo batch na aba **"Audit"**
2. **VALIDAR**:
   - ✅ "Outliers Detected" > 0
   - ✅ Outliers extremos são rejeitados
   - ✅ Score reflete apenas leituras válidas

---

## 📝 PASSO 6: Testar Automação de Pagamentos

### 6.1. Verificar Logs de Atividade
**Na aba "Audit", seção "Recent Oracle Activity":**

#### Logs Esperados (em ordem cronológica)
1. ✅ **"batch validated"**: Batch foi validado pelo oráculo
2. ✅ **"batch submitted"**: Batch foi enviado ao contrato
3. ✅ **"payment processed"**: Pagamento foi processado (se score ≥ 70)

#### Validar Detalhes dos Logs
- ✅ **Timestamp**: Data/hora de cada ação
- ✅ **Agreement ID**: Referência ao acordo correto
- ✅ **Transaction Hash**: Hash da transação na Hedera
- ✅ **Details**: Informações específicas (score, valor, etc.)

### 6.2. Processar Múltiplos Acordos
1. Crie mais 2-3 acordos usando o formulário de contratos
2. Gere leituras para cada acordo
3. Use **"Process All"** na aba Audit
4. **VALIDAR**:
   - ✅ Todos os acordos são processados
   - ✅ Estatísticas globais atualizadas
   - ✅ Batches aparecem para cada acordo

---

## 📝 PASSO 7: Validar Dashboard Atualizado

### 7.1. Verificar Métricas Finais
**Volte para a aba "Dashboard" e valide as métricas:**

| Métrica | Valor Esperado | Validação |
|---------|----------------|-----------|
| Active Contracts | ≥ 1 | ✅ Acordos criados |
| Pending Payments | Variável | ✅ Baseado em scores ≥ 70 |
| Last Turbidity | Última leitura | ✅ Valor da última simulação |
| Compliance Rate | % leituras ≤ 10 NTU | ✅ Baseado na qualidade |
| Oracle Score | Score médio | ✅ Reflete qualidade geral |
| Validation Rate | % sucessos | ✅ Submissões vs validações |

### 7.2. Verificar Histórico de Leituras
**Na seção "Recent Turbidity Readings":**
- ✅ Últimas 5 leituras mostradas
- ✅ Valores com indicador de qualidade (Good/Poor)
- ✅ Timestamps corretos
- ✅ Botão "Simulate Reading" funcional

### 7.3. Verificar Contratos Ativos
**Na seção "Active Agreements":**
- ✅ Lista todos os acordos criados
- ✅ Status "Active" para acordos válidos
- ✅ Informações corretas (produtor, valor, hectares)

---

## 🚨 Casos de Teste de Erro

### 8.1. Teste de Oráculo Não Autorizado
**Para testar segurança:**
1. Modifique temporariamente `ORACLE_ADDRESS` no `.env` do backend
2. Tente processar um batch
3. **VALIDAR**: Erro de autorização é exibido

### 8.2. Teste de Acordo Inexistente
1. No console, tente processar acordo inexistente:
```javascript
fetch('http://localhost:3001/api/oracle/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ agreementId: 999 })
})
```
2. **VALIDAR**: Erro "Agreement not found" retornado

### 8.3. Teste de Conectividade
1. Pare o backend (`Ctrl+C`)
2. Tente usar qualquer funcionalidade do frontend
3. **VALIDAR**: Erros de conexão são tratados graciosamente
4. Reinicie o backend e teste recuperação

---

## ✅ Checklist de Validação Completa

### Funcionalidades Core
- [ ] Criação de acordos PES
- [ ] Simulação de leituras de sensores  
- [ ] Processamento de batches pelo oráculo
- [ ] Cálculo correto de scores (0-100)
- [ ] Aprovação automática para scores ≥ 70
- [ ] Rejeição para scores < 70

### Validação de Dados
- [ ] Leituras fora do range (0-100 NTU) são rejeitadas
- [ ] Outliers extremos são detectados e filtrados
- [ ] Cross-validation entre sensores (simulada)
- [ ] Assinatura criptográfica dos batches

### Automação
- [ ] Relayer processa pagamentos aprovados
- [ ] Logs de auditoria completos
- [ ] Transações registradas na Hedera
- [ ] Status de pagamentos atualizados

### Interface de Usuário
- [ ] Dashboard com métricas em tempo real
- [ ] Audit dashboard funcional
- [ ] Navegação entre abas
- [ ] Tratamento de erros e loading states

### Segurança
- [ ] Apenas oráculos autorizados processam batches
- [ ] Validação de dados de entrada
- [ ] Auditoria completa de ações
- [ ] Recuperação de erros

---

## 🎯 Critérios de Sucesso

**O teste é considerado APROVADO se:**

1. ✅ **Fluxo Completo**: Acordo → Leituras → Validação → Pagamento funciona end-to-end
2. ✅ **Regras de Negócio**: Threshold de 70% é respeitado consistentemente  
3. ✅ **Validação Robusta**: Leituras inválidas são rejeitadas apropriadamente
4. ✅ **Auditabilidade**: Todos os passos são logados com hashes verificáveis
5. ✅ **Interface**: Dashboard reflete dados corretos em tempo real
6. ✅ **Automação**: Pagamentos são processados sem intervenção manual
7. ✅ **Segurança**: Sistema rejeita tentativas não autorizadas

---

## 📞 Troubleshooting

### Problemas Comuns

**Frontend não conecta ao backend:**
- Verificar se backend está rodando na porta 3001
- Verificar configuração de CORS
- Verificar logs do console do navegador

**Oráculo falha na validação:**
- Verificar variáveis de ambiente (ORACLE_ADDRESS, ORACLE_PRIVATE_KEY)
- Verificar se contrato está deployado corretamente
- Verificar logs do backend

**Scores sempre baixos:**
- Verificar se leituras estão dentro do range válido
- Verificar cálculo de outliers
- Verificar se há leituras suficientes para análise

**Pagamentos não são processados:**
- Verificar se score ≥ 70
- Verificar logs do relayer
- Verificar configuração do contrato

---

**Tempo estimado para teste completo: 30-45 minutos**  
**Pré-requisito: Sistema rodando localmente com contratos deployados**
