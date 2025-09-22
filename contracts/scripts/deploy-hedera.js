const {
  Client,
  AccountId,
  PrivateKey,
  ContractCreateFlow,
  ContractFunctionParameters,
  Hbar,
} = require('@hashgraph/sdk');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Deploying PESContract to Hedera Testnet...');

  // Load environment variables
  require('dotenv').config();

  // Validate environment variables
  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY environment variable is required');
  }

  // Create Hedera client
  const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID || '0.0.123456');
  const privateKey = PrivateKey.fromStringECDSA(process.env.PRIVATE_KEY);
  
  const client = Client.forTestnet().setOperator(accountId, privateKey);

  console.log('📋 Account ID:', accountId.toString());
  console.log('🔑 Using private key from environment');

  try {
    // Read the compiled contract bytecode
    const contractPath = path.join(__dirname, '../artifacts/contracts/PESContract.sol/PESContract.json');
    
    if (!fs.existsSync(contractPath)) {
      throw new Error('Contract artifact not found. Please run "yarn hardhat compile" first.');
    }

    const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    const bytecode = contractArtifact.bytecode;

    console.log('📄 Contract bytecode loaded');

    // Create contract deployment transaction
    const contractCreateFlow = new ContractCreateFlow()
      .setBytecode(bytecode)
      .setGas(2000000) // 2M gas limit
      .setConstructorParameters(new ContractFunctionParameters())
      .setAdminKey(privateKey.publicKey);

    console.log('⏳ Deploying contract...');

    // Execute the deployment
    const contractCreateResponse = await contractCreateFlow.execute(client);
    const contractReceipt = await contractCreateResponse.getReceipt(client);
    const contractId = contractReceipt.contractId;

    console.log('✅ Contract deployed successfully!');
    console.log('📄 Contract ID:', contractId.toString());
    console.log('🔗 Contract Address:', contractId.toSolidityAddress());

    // Save deployment info
    const deploymentInfo = {
      contractId: contractId.toString(),
      contractAddress: contractId.toSolidityAddress(),
      network: 'hedera_testnet',
      deployedAt: new Date().toISOString(),
      deployer: accountId.toString(),
      gasUsed: contractReceipt.gasUsed?.toString() || 'N/A',
      transactionId: contractCreateResponse.transactionId.toString()
    };

    const deploymentPath = path.join(__dirname, '../deployment.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log('💾 Deployment info saved to deployment.json');
    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Copy the contract address to your backend .env file:');
    console.log(`   CONTRACT_ADDRESS=${contractId.toSolidityAddress()}`);
    console.log('2. Update your backend configuration');
    console.log('3. Start the backend server');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    client.close();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
