const { Database } = require('./dist/database');
const { AuthService } = require('./dist/services/auth');

async function testExistingUser() {
  console.log('🧪 Testando login de usuário existente...\n');

  try {
    const database = new Database();
    await database.initialize();
    const authService = new AuthService(database);

    // Tentar fazer login com o usuário que acabamos de criar
    console.log('🔐 Testando login do usuário criado...');
    const loginResult = await authService.login({
      email: 'teste.direto@exemplo.com',
      password: 'Teste123!'
    });

    console.log('Resultado do login:', loginResult);

    if (loginResult.success) {
      console.log('✅ Login realizado com sucesso!');
      
      // Verificar se last_login foi atualizado novamente
      const user = await database.getUserByEmail('teste.direto@exemplo.com');
      console.log('Usuário após segundo login:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        last_login: user.last_login
      });
    } else {
      console.log('❌ Login falhou:', loginResult.error);
    }

    database.close();
    console.log('\n✅ Teste concluído!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testExistingUser();
