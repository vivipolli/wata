# W.A.T.A. Phase 2 Implementation

## Overview

This document describes the Phase 2 implementation of the W.A.T.A. (Water Assessment and Tracking with Automation) system, which introduces a robust oracle validation system, weekly aggregation, and automated auditable payments.

## 🔧 Architecture Overview

### Oracle System
The oracle system consists of three main modules:

1. **Collector Module** (`src/services/oracle.ts`)
   - Collects readings every 6 hours (or on-demand via API)
   - Filters readings for validation batches
   - Supports both simulated and real sensor data

2. **Validator Module** (`src/services/oracle.ts`)
   - Validates individual readings against multiple criteria:
     - Range validation (0-100 NTU)
     - Outlier detection using IQR method
     - Cross-check with nearby sensors (simulated)
   - Generates validation signatures using HMAC-SHA256

3. **Aggregator Module** (`src/services/oracle.ts`)
   - Calculates weekly scores based on:
     - Data availability (30% weight)
     - Water quality (50% weight) 
     - Consistency (20% weight)
   - Normalizes scores to 0-100 scale

### Smart Contracts

#### OracleManager.sol
- Manages authorized oracles
- Only owner can authorize/revoke oracles
- Provides oracle verification for PESContract

#### PESContract.sol (Updated)
- Integrates with OracleManager for oracle authorization
- New `submitValidatedBatch` function for oracle submissions
- Automatic `PaymentApproved` event emission when score ≥ 70
- Stores last score, audit hash, and update timestamp per agreement

### Database Schema (Updated)

New tables added to support oracle operations:

```sql
-- Validation batches with scores and audit trails
CREATE TABLE batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agreement_id INTEGER NOT NULL,
  audit_hash TEXT UNIQUE NOT NULL,
  oracle_signature TEXT,
  score REAL NOT NULL,
  readings_count INTEGER NOT NULL,
  average_turbidity REAL NOT NULL,
  median_turbidity REAL,
  outliers_detected INTEGER DEFAULT 0,
  validation_status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME,
  oracle_address TEXT,
  FOREIGN KEY (agreement_id) REFERENCES agreements (id)
);

-- Oracle activity logs for audit trail
CREATE TABLE oracle_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  oracle_address TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  transaction_hash TEXT,
  FOREIGN KEY (batch_id) REFERENCES batches (id)
);
```

### Automated Payment Flow

1. **Oracle Validation**: Oracle processes readings and submits validated batch
2. **Smart Contract**: Emits `PaymentApproved` if score ≥ 70
3. **Relayer**: Detects approved payments and executes HBAR transfer
4. **Audit Trail**: Records all actions on-chain and in database

## 🚀 API Endpoints

### Oracle Management
- `POST /api/oracle/process` - Process batch for specific agreement
- `POST /api/oracle/process-all` - Process all active agreements
- `GET /api/oracle/batch/:batchId` - Get batch details with logs
- `GET /api/oracle/batches/agreement/:agreementId` - Get batches for agreement
- `GET /api/oracle/logs` - Get recent oracle activity logs
- `GET /api/oracle/stats` - Get oracle statistics

## 🎨 Frontend Updates

### New Audit Dashboard
- Oracle statistics overview
- Agreement selection with batch processing
- Batch validation history with scores
- Real-time oracle activity logs
- Visual indicators for score thresholds

### Enhanced Main Dashboard
- Oracle score metrics
- Validation rate indicators
- Audit trail integration
- Payment approval status

## 🧪 Testing

### Unit Tests (Contracts)
- `test/OracleManager.test.js` - Oracle authorization/revocation
- `test/PESContractV2.test.js` - Batch submission and payment approval

### Integration Tests (Backend)
- `__tests__/oracle.integration.test.ts` - Oracle API endpoints
- `__tests__/relayer.integration.test.ts` - Payment automation

### Test Scripts
- `scripts/test-oracle-flow.ts` - End-to-end oracle flow validation
- `scripts/deploy-v2.ts` - V2 contract deployment

## 📋 Deployment Guide

### 1. Deploy Contracts
```bash
cd contracts
npx hardhat run scripts/deploy-v2.ts --network hedera-testnet
```

### 2. Configure Environment
Update `backend/.env`:
```env
# Oracle Configuration
ORACLE_PRIVATE_KEY=your-oracle-private-key-here
ORACLE_ADDRESS=0.0.oracle
CONTRACT_ADDRESS=0x... # PESContract address
ORACLE_MANAGER_ADDRESS=0x... # OracleManager address
```

### 3. Test Oracle Flow
```bash
cd contracts
npx hardhat run scripts/test-oracle-flow.ts --network hedera-testnet
```

### 4. Start Services
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm start
```

## 🔐 Security Features

### Oracle Authorization
- Only authorized oracles can submit batches
- Owner-controlled oracle management
- Signature verification for batch integrity

### Audit Trail
- Complete transaction history on Hedera
- Database logs for all oracle actions
- Cryptographic audit hashes for data integrity

### Payment Automation
- Score-based payment approval (≥70 threshold)
- Automated HBAR transfers with transaction records
- Fail-safe error handling and status tracking

## 📊 Success Criteria

✅ **Oracle Authorization**: Authorized oracles can submit batches; unauthorized cannot
✅ **Score Calculation**: Accurate score calculation based on water quality metrics
✅ **Payment Approval**: Automatic payment approval for scores ≥70
✅ **Audit Trail**: Complete audit trail with on-chain and database records
✅ **Frontend Integration**: User-friendly audit dashboard with real-time updates

## 🔄 Validation Logic

### Reading Validation Rules
1. **Range Check**: Turbidity must be 0-100 NTU
2. **Outlier Detection**: Reject extreme outliers (>3 IQR from median)
3. **Cross-Validation**: Check consistency with nearby sensors

### Score Calculation
```typescript
finalScore = (
  dataAvailabilityScore * 0.3 +  // 30% weight
  qualityScore * 0.5 +           // 50% weight  
  consistencyScore * 0.2         // 20% weight
)
```

### Payment Threshold
- Score ≥ 70: Payment approved automatically
- Score < 70: No payment, but batch recorded for audit

## 🚧 Future Enhancements

- Integration with real IoT sensors
- Multi-signature oracle consensus
- Advanced anomaly detection algorithms
- HTS token payments instead of HBAR
- Geographic clustering for cross-validation
- Machine learning for quality prediction

## 📞 Support

For technical support or questions about the Phase 2 implementation, please refer to the test files and integration tests for usage examples.
