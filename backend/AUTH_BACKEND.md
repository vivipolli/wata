# W.A.T.A. Chain Backend Authentication System

## 🔐 Sistema de Autenticação Seguro Implementado

O backend da W.A.T.A. Chain agora possui um sistema de autenticação robusto e seguro, seguindo as melhores práticas de segurança.

## ✨ Funcionalidades Implementadas

### 🛡️ **Segurança Avançada**
- **✅ Bcrypt**: Hash de senhas com salt rounds configuráveis
- **✅ JWT Tokens**: Bearer tokens com expiração configurável
- **✅ Refresh Tokens**: Renovação automática de tokens
- **✅ Rate Limiting**: Proteção contra ataques de força bruta
- **✅ Helmet**: Headers de segurança HTTP
- **✅ CORS**: Configuração segura de CORS
- **✅ Validação**: Sanitização e validação de dados de entrada

### 🔑 **Autenticação JWT**
- **Access Tokens**: Expiração em 24h (configurável)
- **Refresh Tokens**: Expiração em 7 dias
- **Token Verification**: Middleware de verificação automática
- **Role-based Access**: Controle de acesso baseado em roles

### 🗄️ **Banco de Dados Seguro**
- **Tabela Users**: Estrutura completa com campos de segurança
- **Password Hashing**: Senhas criptografadas com bcrypt
- **User Management**: CRUD completo de usuários
- **Audit Trail**: Logs de login e atualizações

## 📁 Estrutura de Arquivos

```
src/
├── middleware/
│   ├── auth.ts           # Middleware de autenticação JWT
│   ├── validation.ts     # Validação e sanitização
│   └── security.ts       # Middleware de segurança geral
├── services/
│   └── auth.ts           # Serviço de autenticação
├── routes/
│   └── auth.ts           # Rotas de autenticação
└── database.ts           # Modelo de usuário no banco
```

## 🚀 Endpoints de Autenticação

### **POST /api/auth/register**
Registrar novo usuário
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "password": "SecurePass123!",
  "role": "PRODUCER",
  "address": "0.0.123456"
}
```

### **POST /api/auth/login**
Login de usuário
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### **POST /api/auth/refresh**
Renovar access token
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

### **GET /api/auth/profile**
Obter perfil do usuário (requer autenticação)
```
Authorization: Bearer <access-token>
```

### **PUT /api/auth/profile**
Atualizar perfil do usuário (requer autenticação)
```json
{
  "name": "New Name",
  "address": "0.0.654321"
}
```

### **POST /api/auth/change-password**
Alterar senha (requer autenticação)
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

### **POST /api/auth/logout**
Logout (requer autenticação)

### **GET /api/auth/verify**
Verificar se token é válido

## 🔒 Segurança Implementada

### **Rate Limiting**
- **Auth Endpoints**: 5 tentativas por 15 minutos
- **API Endpoints**: 100 requests por 15 minutos
- **Password Reset**: 3 tentativas por hora

### **Validação de Dados**
- **Email**: Formato válido e normalização
- **Password**: Mínimo 8 caracteres, maiúscula, minúscula, número, especial
- **Name**: Apenas letras e espaços, 2-100 caracteres
- **Role**: Valores permitidos (PRODUCER, INVESTOR, MANAGER)
- **Address**: Formato Hedera (0.0.123456)

### **Headers de Segurança**
- **Helmet**: Content Security Policy
- **HSTS**: HTTP Strict Transport Security
- **CORS**: Configuração segura
- **XSS Protection**: Proteção contra XSS

## 🗄️ Modelo de Banco de Dados

### **Tabela Users**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('PRODUCER', 'INVESTOR', 'MANAGER')),
  address TEXT,
  is_active BOOLEAN DEFAULT 1,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## ⚙️ Configuração de Ambiente

### **Variáveis Obrigatórias**
```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Password Hashing
BCRYPT_SALT_ROUNDS=12

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5
```

## 🔧 Middleware de Autenticação

### **Uso Básico**
```typescript
import { AuthMiddleware } from './middleware/auth.js'

const authMiddleware = new AuthMiddleware(database)

// Proteger rota
app.get('/protected', authMiddleware.authenticate, handler)

// Verificar role
app.get('/admin', 
  authMiddleware.authenticate, 
  authMiddleware.requireRole('ADMIN'), 
  handler
)
```

### **Geração de Tokens**
```typescript
// Access token
const token = authMiddleware.generateToken({
  id: user.id,
  email: user.email,
  role: user.role
})

// Refresh token
const refreshToken = authMiddleware.generateRefreshToken({
  id: user.id,
  email: user.email
})
```

## 🧪 Testes de Segurança

### **Validação de Senha**
- ✅ Mínimo 8 caracteres
- ✅ Pelo menos 1 maiúscula
- ✅ Pelo menos 1 minúscula
- ✅ Pelo menos 1 número
- ✅ Pelo menos 1 caractere especial

### **Rate Limiting**
- ✅ Auth endpoints limitados
- ✅ IP blocking automático
- ✅ Configuração flexível

### **JWT Security**
- ✅ Tokens com expiração
- ✅ Verificação de assinatura
- ✅ Refresh token rotation
- ✅ Blacklist support (preparado)

## 🚀 Deploy e Produção

### **Configurações de Produção**
```env
NODE_ENV=production
JWT_SECRET=super-secure-production-secret
BCRYPT_SALT_ROUNDS=14
CORS_ORIGIN=https://yourdomain.com
```

### **Monitoramento**
- ✅ Request logging
- ✅ Error tracking
- ✅ Security headers
- ✅ Rate limit monitoring

## 📚 Documentação Adicional

- [Middleware de Autenticação](./src/middleware/auth.ts)
- [Validação de Dados](./src/middleware/validation.ts)
- [Segurança Geral](./src/middleware/security.ts)
- [Serviço de Auth](./src/services/auth.ts)
- [Rotas de Auth](./src/routes/auth.ts)

---

**W.A.T.A. Chain** - Sistema de Autenticação Seguro e Robusto
