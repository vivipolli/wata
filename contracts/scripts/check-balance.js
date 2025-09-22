const {
  Client,
  AccountId,
  PrivateKey,
  AccountBalanceQuery,
} = require('@hashgraph/sdk');

async function main() {
  console.log('🔍 Checking Hedera account balance...');

  // Load environment variables
  require('dotenv').config();

  try {
    const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const privateKey = PrivateKey.fromString(process.env.PRIVATE_KEY);
    
    console.log('📋 Account ID:', accountId.toString());
    console.log('🔑 Private Key:', process.env.PRIVATE_KEY.substring(0, 10) + '...');
    
    const client = Client.forTestnet().setOperator(accountId, privateKey);
    
    // Check balance
    const balance = await new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(client);
    
    console.log('✅ Account is valid and accessible');
    console.log('💰 Account balance:', balance.hbars.toString(), 'HBAR');
    
    if (balance.hbars.toTinybars() < 1000000000) { // Less than 1 HBAR
      console.log('⚠️  Warning: Account has low balance. You may need more HBAR for deployment.');
      console.log('💡 Get test HBAR from: https://portal.hedera.com/');
    } else {
      console.log('✅ Account has sufficient balance for deployment');
    }
    
    client.close();
    
  } catch (error) {
    console.error('❌ Account check failed:', error.message);
    
    if (error.message.includes('INVALID_SIGNATURE')) {
      console.log('\n💡 The private key does not match the account ID.');
      console.log('Please verify:');
      console.log('1. The account ID is correct');
      console.log('2. The private key belongs to this account');
      console.log('3. You have the correct private key format');
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
