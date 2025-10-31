# W.A.T.A. Chain - Water Quality PES Platform

A blockchain-based Payment for Ecosystem Services (PES) platform for water quality monitoring and automated payments using Hedera Hashgraph.

## 🎥 Pitch Video

<video width="100%" controls>
  <source src="W.A.T.A.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## 🎯 Project Overview

W.A.T.A. Chain (Water Accountability Transaction Automation) is a decentralized platform that automates payments for environmental services (PES) based on water quality data collected via IoT and processed through oracles on the Hedera Hashgraph network.

The architecture implements a three-layer solution that connects IoT sensors in the field, data validation oracles, and smart contracts on the blockchain, creating a transparent and automated system for compensating rural producers for environmental conservation practices.

### System Objectives

• **Automate environmental services payments** based on verifiable data
• **Reduce transaction costs and intermediation** in PES programs  
• **Increase transparency and reliability** through blockchain technology
• **Facilitate access for small producers** to environmental compensation programs
• **Create a scalable model** for different regions and types of environmental services

## 🏗️ Architecture

W.A.T.A. Chain implements a three-layer decentralized architecture:

### Layer 1: IoT Data Collection
- **IoT Sensors**: Water quality monitoring devices in the field
- **Data Validation**: Oracle services for data verification and processing
- **Real-time Monitoring**: Continuous water quality assessment

### Layer 2: Blockchain Infrastructure  
- **Smart Contracts**: Solidity (PESContract.sol) on Hedera Hashgraph
- **Oracle Integration**: Data validation and processing oracles
- **Relayer Pattern**: Automated payment processing and execution

### Layer 3: Application Layer
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + SQLite
- **Blockchain**: Hedera Hashgraph Testnet
- **Smart Contracts**: Solidity (PESContract.sol)
- **Relayer Pattern**: Automated payment processing

## 🧪 Testing

W.A.T.A. Chain includes comprehensive test suites for both smart contracts and backend services.

### Run All Tests

```bash
# Execute complete test suite
./run-all-tests.sh
```

### Individual Test Suites

```bash
# Smart Contract Tests (Hardhat)
cd contracts && yarn test

# Backend Integration Tests (Jest)
cd backend && yarn test:coverage
```

For detailed testing documentation, see [TESTING.md](TESTING.md).

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn or npm
- Hedera Testnet account with HBAR

### 1. Smart Contract Deployment

```bash
cd contracts

# Install dependencies
yarn install

# Copy environment file
cp .env.example .env

# Edit .env with your Hedera private key
# PRIVATE_KEY=0x...

# Compile contracts
yarn hardhat compile

# Deploy to Hedera Testnet
yarn hardhat run scripts/deploy.ts --network hedera_testnet
```

After deployment, copy the contract address to your backend `.env` file.

### 2. Backend Setup

```bash
cd backend

# Install dependencies
yarn install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration:
# HEDERA_ACCOUNT_ID=0.0.123456
# HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...
# CONTRACT_ADDRESS=0x... (from deployment)
# CONTRACT_OWNER_PRIVATE_KEY=0x...

# Start the backend
yarn dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
yarn install

# Start development server
yarn dev
```

## 📋 Core Features

### Smart Contract (PESContract.sol)

- `createAgreement()` - Register new PES agreements
- `requestPayment()` - Trigger payment requests based on compliance
- `recordAudit()` - Record audit hashes for transparency
- Event emission for off-chain processing

### Backend API

- **POST /api/agreements** - Create new agreements
- **POST /api/readings/simulate** - Generate simulated water quality readings
- **POST /api/readings/submit** - Submit real sensor readings
- **POST /api/payments/trigger-check** - Check compliance and trigger payments

### Relayer Service

The relayer service monitors blockchain events and processes payments:

1. Listens for `PaymentRequested` events
2. Validates payment conditions
3. Executes HBAR transfers using Hedera SDK
4. Updates payment status in database

### Frontend Components

- **Dashboard** - Overview of agreements, readings, and compliance
- **Contract Registration** - Create new PES agreements
- **Monitoring** - View water quality data and compliance status
- **Notifications** - System alerts and payment confirmations

## 🔄 User Flow

1. **Agreement Creation**: Producer registers agreement with area, value, and location
2. **Water Monitoring**: System receives turbidity readings (simulated or real)
3. **Compliance Check**: Backend calculates average turbidity over time period
4. **Payment Trigger**: If compliance met (≤10 NTU), payment is requested
5. **Automated Payment**: Relayer processes payment and transfers HBAR
6. **Audit Trail**: All actions recorded on blockchain for transparency

## 📊 Monitoring & Analytics

- Real-time water quality dashboards
- Compliance rate tracking
- Payment history and status
- Audit trail visualization

## 🔒 Security Considerations

- Private keys stored in environment variables
- Off-chain data storage for sensitive information
- On-chain storage limited to essential data (hashes, addresses, values)
- Relayer pattern for secure payment processing

