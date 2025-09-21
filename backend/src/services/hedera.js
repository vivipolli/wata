import {
  Client,
  AccountId,
  PrivateKey,
  ContractFunctionParameters,
  ContractCallQuery,
  ContractExecuteTransaction,
  Hbar,
  TransactionResponse,
  ContractId,
  AccountBalanceQuery
} from '@hashgraph/sdk';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

export class HederaService {
  constructor() {
    this.client = null;
    this.accountId = null;
    this.privateKey = null;
    this.contractAddress = null;
    this.contractId = null;
  }

  async initialize() {
    try {
      this.accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
      this.privateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
      this.contractAddress = process.env.CONTRACT_ADDRESS;

      if (!this.accountId || !this.privateKey || !this.contractAddress) {
        throw new Error('Missing required Hedera configuration');
      }

      this.client = Client.forTestnet().setOperator(this.accountId, this.privateKey);
      this.contractId = ContractId.fromString(this.contractAddress);

      console.log('Hedera service initialized');
      console.log('Account ID:', this.accountId.toString());
      console.log('Contract Address:', this.contractAddress);
    } catch (error) {
      console.error('Failed to initialize Hedera service:', error);
      throw error;
    }
  }

  async createAgreement(agreementHash, producerAddress, baseValue, hectares) {
    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction(
          'createAgreement',
          new ContractFunctionParameters()
            .addBytes32(ethers.utils.formatBytes32String(agreementHash))
            .addAddress(producerAddress)
            .addUint256(baseValue)
            .addUint256(hectares)
        );

      const response = await transaction.execute(this.client);
      const receipt = await response.getRecord(this.client);

      console.log('Agreement created on Hedera:', receipt.contractFunctionResult?.getUint256(0));
      return receipt.contractFunctionResult?.getUint256(0);
    } catch (error) {
      console.error('Error creating agreement on Hedera:', error);
      throw error;
    }
  }

  async requestPayment(agreementId, auditHash) {
    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction(
          'requestPayment',
          new ContractFunctionParameters()
            .addUint256(agreementId)
            .addBytes32(ethers.utils.formatBytes32String(auditHash))
        );

      const response = await transaction.execute(this.client);
      const receipt = await response.getRecord(this.client);

      console.log('Payment requested on Hedera for agreement:', agreementId);
      return receipt;
    } catch (error) {
      console.error('Error requesting payment on Hedera:', error);
      throw error;
    }
  }

  async recordAudit(auditHash) {
    try {
      const transaction = new ContractExecuteTransaction()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction(
          'recordAudit',
          new ContractFunctionParameters()
            .addBytes32(ethers.utils.formatBytes32String(auditHash))
        );

      const response = await transaction.execute(this.client);
      const receipt = await response.getRecord(this.client);

      console.log('Audit recorded on Hedera:', auditHash);
      return receipt;
    } catch (error) {
      console.error('Error recording audit on Hedera:', error);
      throw error;
    }
  }

  async getAgreement(agreementId) {
    try {
      const query = new ContractCallQuery()
        .setContractId(this.contractId)
        .setGas(100000)
        .setFunction(
          'getAgreement',
          new ContractFunctionParameters().addUint256(agreementId)
        );

      const response = await query.execute(this.client);
      const result = response.getContractFunctionResult();

      return {
        agreementHash: result.getBytes32(0),
        producer: result.getAddress(1),
        baseValue: result.getUint256(2),
        hectares: result.getUint256(3),
        isActive: result.getBool(4),
        createdAt: result.getUint256(5)
      };
    } catch (error) {
      console.error('Error getting agreement from Hedera:', error);
      throw error;
    }
  }

  async transferHbar(toAddress, amount) {
    try {
      // For MVP, we'll simulate the transfer
      // In production, this would use Hedera's TransferTransaction
      const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      console.log(`Simulated HBAR transfer: ${amount} to ${toAddress}`);
      console.log(`Transaction hash: ${transactionHash}`);
      
      return transactionHash;
    } catch (error) {
      console.error('Error transferring HBAR:', error);
      throw error;
    }
  }

  async getAccountBalance(accountId) {
    try {
      const balance = await new AccountBalanceQuery()
        .setAccountId(accountId)
        .execute(this.client);

      return balance.hbars.toString();
    } catch (error) {
      console.error('Error getting account balance:', error);
      throw error;
    }
  }
}
