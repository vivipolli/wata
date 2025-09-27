# HCS Integration Documentation

## Overview
The WATA platform integrates with Hedera Consensus Service (HCS) for storing audit records and validated reading batches. This document outlines the conditions and flow for HCS storage.

## HCS Integration Conditions

### 1. Individual Readings
**NOT stored in HCS directly**
- Individual readings (simulated or real) are stored only in the local SQLite database
- Each reading has an `audit_hash` for integrity verification
- Readings are associated with agreements via `agreement_id` foreign key

### 2. Batch Validation Process
**HCS storage occurs during batch validation:**

#### Conditions for HCS Storage:
1. **Batch Collection**: Readings are collected for validation (default: 168 hours/7 days)
2. **Validation Threshold**: Batch must meet quality thresholds
3. **Oracle Validation**: Oracle service validates the batch
4. **Smart Contract Submission**: Validated batch is submitted to smart contract
5. **HCS Publication**: Audit record is published to HCS

#### HCS Storage Flow:
```
Individual Readings → Batch Collection → Oracle Validation → Smart Contract → HCS Storage
```

### 3. HCS Storage Triggers

#### Automatic Triggers:
- **Batch Validation**: When oracle validates a batch of readings
- **Payment Approval**: When payment is approved and processed
- **Audit Records**: When audit reports are generated

#### Manual Triggers:
- **HCS Publish Endpoint**: `/hedera/hcs/publish` for manual audit record publication

### 4. HCS Data Structure

#### Audit Record Format:
```json
{
  "type": "audit_record",
  "data": {
    "agreementId": "string",
    "batchId": "number",
    "auditHash": "string",
    "score": "number",
    "timestamp": "string",
    "transactionHash": "string",
    "producerAddress": "string",
    "investorAddress": "string"
  },
  "timestamp": "string",
  "version": "1.0"
}
```

### 5. HCS Topic Management
- **Topic Creation**: Automatic on first HCS message
- **Topic Memo**: "WATA Audit Records"
- **Transaction Fee**: 2 HBAR per message
- **Environment Variable**: `HCS_TOPIC_ID` stores the topic ID

### 6. Integration Points

#### Backend Services:
- **HCS Service**: `backend/src/services/hcs.ts`
- **Oracle Service**: `backend/src/services/oracle.ts`
- **Relayer Service**: `backend/src/services/relayer.ts`

#### API Endpoints:
- `POST /hedera/hcs/publish` - Manual HCS publication
- `POST /hedera/hfs/report` - HFS audit report creation

### 7. Current Implementation Status

#### ✅ Implemented:
- HCS service with topic creation
- Audit record publishing
- Batch validation with HCS integration
- Payment processing with HCS records

#### ❌ Not Implemented:
- Individual reading HCS storage (by design)
- Real-time HCS monitoring
- HCS message retrieval

### 8. Business Logic

#### Why Individual Readings Are Not Stored in HCS:
1. **Cost Efficiency**: HCS has transaction costs (2 HBAR per message)
2. **Batch Processing**: More efficient to process readings in batches
3. **Quality Control**: Only validated readings should be on-chain
4. **Scalability**: Prevents HCS spam from individual readings

#### When Readings Are Stored in HCS:
1. **Batch Validation**: When oracle validates a batch of readings
2. **Payment Processing**: When payment is approved based on validated readings
3. **Audit Trail**: When audit reports are generated for compliance

### 9. Monitoring and Verification

#### HCS Explorer:
- **Testnet**: https://hashscan.io/testnet/transaction/{transactionId}
- **Mainnet**: https://hashscan.io/mainnet/transaction/{transactionId}

#### Verification Methods:
1. Check transaction ID in Hedera Explorer
2. Verify audit hash matches database records
3. Confirm batch validation status
4. Monitor payment processing logs

### 10. Configuration

#### Environment Variables:
```bash
HEDERA_ACCOUNT_ID=your_account_id
HEDERA_PRIVATE_KEY=your_private_key
HCS_TOPIC_ID=auto_generated_on_first_use
```

#### Network Configuration:
- **Testnet**: Default configuration
- **Mainnet**: Requires production credentials

## Conclusion

The HCS integration is designed for **batch-level audit records** rather than individual readings. This approach ensures cost efficiency, data quality, and scalability while maintaining the integrity and transparency of the water quality monitoring system.

Individual readings are stored locally with audit hashes, and only validated batches are published to HCS as part of the payment and compliance process.
