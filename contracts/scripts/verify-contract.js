const {
  Client,
  AccountId,
  PrivateKey,
  ContractCallQuery,
  ContractFunctionParameters,
  ContractId,
} = require('@hashgraph/sdk');

async function main() {
  console.log('🔍 Verifying deployed contract...');

  // Load environment variables
  require('dotenv').config();

  try {
    const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const privateKey = PrivateKey.fromStringECDSA(process.env.PRIVATE_KEY);
    const client = Client.forTestnet().setOperator(accountId, privateKey);

    // Load deployment info
    const fs = require('fs');
    const deploymentPath = require('path').join(__dirname, '../deployment.json');
    
    if (!fs.existsSync(deploymentPath)) {
      throw new Error('Deployment file not found. Please deploy the contract first.');
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    const contractId = ContractId.fromString(deployment.contractId);

    console.log('📄 Contract ID:', contractId.toString());
    console.log('🔗 Contract Address:', deployment.contractAddress);

    // Test contract functions
    console.log('\n🧪 Testing contract functions...');

    // Test owner function
    try {
      const ownerQuery = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction('owner');

      const ownerResponse = await ownerQuery.execute(client);
      const owner = ownerResponse.getAddress(0);
      console.log('✅ Owner function works. Owner:', owner);
    } catch (error) {
      console.log('❌ Owner function failed:', error.message);
    }

    // Test relayer function
    try {
      const relayerQuery = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction('relayer');

      const relayerResponse = await relayerQuery.execute(client);
      const relayer = relayerResponse.getAddress(0);
      console.log('✅ Relayer function works. Relayer:', relayer);
    } catch (error) {
      console.log('❌ Relayer function failed:', error.message);
    }

    // Test agreementCounter function
    try {
      const counterQuery = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction('agreementCounter');

      const counterResponse = await counterQuery.execute(client);
      const counter = counterResponse.getUint256(0);
      console.log('✅ Agreement counter function works. Count:', counter.toString());
    } catch (error) {
      console.log('❌ Agreement counter function failed:', error.message);
    }

    console.log('\n🎉 Contract verification completed!');
    console.log('\n📋 Contract Details:');
    console.log('- Contract ID:', contractId.toString());
    console.log('- Contract Address:', deployment.contractAddress);
    console.log('- Network: Hedera Testnet');
    console.log('- Deployed at:', deployment.deployedAt);
    console.log('- Deployer:', deployment.deployer);

    client.close();

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
