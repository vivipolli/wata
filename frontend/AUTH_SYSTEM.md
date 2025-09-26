# W.A.T.A. Chain Authentication System

## 🚀 Sistema de Autenticação Completo

O sistema de autenticação da W.A.T.A. Chain foi completamente redesenhado para oferecer uma experiência elegante e segura.

## ✨ Funcionalidades Implementadas

### 🔐 **Autenticação Baseada em Email/Senha**
- **Login**: Email + Senha
- **Cadastro**: Email + Nome + Senha + Role
- **Validação**: Formato de email e senha mínima de 6 caracteres
- **Persistência**: Dados armazenados no localStorage (simulação)

### 🎨 **Interface Elegante**
- **Design Moderno**: Gradientes e animações suaves
- **Responsivo**: Funciona em desktop e mobile
- **Acessível**: Navegação por teclado e screen readers
- **Feedback Visual**: Notificações toast elegantes

### 🛡️ **Proteção de Rotas**
- **Proteção Automática**: Todas as rotas protegidas por padrão
- **Controle de Acesso**: Baseado em roles (Producer, Investor, Manager)
- **Redirecionamento**: Automático para login se não autenticado
- **Loading States**: Estados de carregamento elegantes

## 📁 Estrutura de Arquivos

```
src/components/auth/
├── AuthPage.tsx          # Gerenciador de login/cadastro
├── LoginPage.tsx         # Página de login
├── RegisterPage.tsx      # Página de cadastro
├── ProtectedRoute.tsx    # Proteção de rotas
├── RoleBasedRoute.tsx   # Rotas baseadas em roles
├── UserMenu.tsx         # Menu do usuário
└── AuthDemo.tsx         # Componente de demonstração

src/contexts/
├── AuthContext.tsx      # Contexto de autenticação
└── NotificationContext.tsx # Sistema de notificações

src/hooks/
└── useAuthGuard.ts      # Hook para controle de acesso
```

## 🔧 Como Usar

### 1. **Login**
```typescript
const { login } = useAuth()
await login('user@email.com', 'password123')
```

### 2. **Cadastro**
```typescript
const { register } = useAuth()
await register('user@email.com', 'User Name', 'password123', 'PRODUCER')
```

### 3. **Proteção de Rotas**
```typescript
<ProtectedRoute requiredRoles={['PRODUCER']}>
  <ProducerDashboard />
</ProtectedRoute>
```

### 4. **Controle de Acesso**
```typescript
const { hasRole, hasAnyRole } = useAuth()
if (hasRole('PRODUCER')) {
  // Mostrar conteúdo para produtores
}
```

## 🎯 Roles Disponíveis

- **PRODUCER**: Produtor/Guardião de água
- **INVESTOR**: Investidor
- **MANAGER**: Gestor do sistema

## 🚀 Demonstração

O sistema inclui um componente de demonstração (`AuthDemo`) que permite:
- **Quick Register**: Cadastro rápido com dados pré-preenchidos
- **Quick Login**: Login rápido para teste
- **Feedback Visual**: Notificações de sucesso/erro

## 🔒 Segurança

### **Validações Implementadas**
- ✅ Formato de email válido
- ✅ Senha mínima de 6 caracteres
- ✅ Confirmação de senha no cadastro
- ✅ Verificação de email único
- ✅ Sanitização de dados

### **Melhorias Futuras**
- 🔄 Integração com backend real
- 🔄 Hash de senhas (bcrypt)
- 🔄 JWT tokens
- 🔄 Refresh tokens
- 🔄 2FA (Two-Factor Authentication)

## 🎨 Design System

### **Cores**
- **Primary**: Blue (#3B82F6)
- **Secondary**: Green (#10B981)
- **Success**: Green (#059669)
- **Error**: Red (#DC2626)
- **Warning**: Yellow (#D97706)

### **Componentes**
- **LoadingPage**: Página de carregamento elegante
- **ErrorPage**: Página de erro com ações
- **SuccessPage**: Página de sucesso
- **NotificationToast**: Notificações toast animadas

## 📱 Responsividade

- **Mobile First**: Design otimizado para mobile
- **Breakpoints**: sm, md, lg, xl
- **Touch Friendly**: Botões e inputs otimizados para touch
- **Accessibility**: Suporte completo a screen readers

## 🧪 Testes

O sistema inclui:
- ✅ Validação de formulários
- ✅ Testes de integração
- ✅ Testes de acessibilidade
- ✅ Testes de responsividade

## 🚀 Deploy

```bash
# Build para produção
yarn build

# Preview local
yarn preview

# Desenvolvimento
yarn dev
```

## 📚 Documentação Adicional

- [Componentes de UI](./src/components/common/)
- [Hooks Personalizados](./src/hooks/)
- [Contextos](./src/contexts/)
- [Utilitários](./src/utils/)

---

**W.A.T.A. Chain** - Water Accountability Tokenized Agreement
