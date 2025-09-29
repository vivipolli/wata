const { Database } = require('./dist/database');
const { AuthService } = require('./dist/services/auth');

async function testAuth() {
  console.log('🧪 Iniciando testes de autenticação...\n');

  try {
    // Inicializar database e auth service
    const database = new Database();
    await database.initialize();
    
    const authService = new AuthService(database);

    // Teste 1: Verificar usuários existentes
    console.log('📊 Usuários existentes no banco:');
    const users = await database.all('SELECT id, email, name, role, is_active, last_login FROM users ORDER BY id DESC');
    console.table(users);

    // Teste 2: Tentar registrar novo usuário
    console.log('\n✨ Teste de registro de novo usuário...');
    const registerData = {
      email: 'teste.direto@exemplo.com',
      name: 'Usuario Teste Direto',
      password: 'Teste123!',
      role: 'PRODUCER',
      address: null
    };

    const registerResult = await authService.register(registerData);
    console.log('Resultado do registro:', registerResult);

    if (registerResult.success) {
      console.log('✅ Usuário registrado com sucesso!');
      
      // Verificar se foi salvo no banco
      const newUser = await database.getUserByEmail(registerData.email);
      console.log('Usuário no banco:', newUser);

      // Teste 3: Tentar fazer login
      console.log('\n🔐 Teste de login...');
      const loginResult = await authService.login({
        email: registerData.email,
        password: registerData.password
      });
      console.log('Resultado do login:', loginResult);

      if (loginResult.success) {
        console.log('✅ Login realizado com sucesso!');
        
        // Verificar se last_login foi atualizado
        const updatedUser = await database.getUserByEmail(registerData.email);
        console.log('Usuário após login:', updatedUser);
        
        if (updatedUser.last_login) {
          console.log('✅ last_login foi atualizado corretamente!');
        } else {
          console.log('❌ last_login não foi atualizado!');
        }
      } else {
        console.log('❌ Login falhou:', loginResult.error);
      }
    } else {
      console.log('❌ Registro falhou:', registerResult.error);
    }

    // Teste 4: Verificar total de usuários
    console.log('\n📊 Total de usuários após teste:');
    const finalUsers = await database.all('SELECT id, email, name, role, is_active, last_login FROM users ORDER BY id DESC');
    console.table(finalUsers);

    database.close();
    console.log('\n✅ Testes concluídos!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

testAuth();
