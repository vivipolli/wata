# W.A.T.A. Chain - Water Quality PES Platform

A blockchain-based Payment for Ecosystem Services (PES) platform for water quality monitoring and automated payments using Hedera Hashgraph.

## 🎯 Project Overview

W.A.T.A. Chain (Water Accountability Tokenized Agreement) is a decentralized platform that automates payments for environmental services (PES) based on water quality data collected via IoT and processed through oracles on the Hedera Hashgraph network.

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

## 🛠️ Development

### Smart Contract Development

```bash
cd contracts

# Run tests
yarn hardhat test

# Verify contract on Hedera
yarn hardhat verify --network hedera_testnet <CONTRACT_ADDRESS>
```

### Backend Development

```bash
cd backend

# Run with auto-reload
yarn dev

# Check logs
tail -f logs/app.log
```

### Frontend Development

```bash
cd frontend

# Development server
yarn dev

# Build for production
yarn build
```

## 🔧 Configuration

### Hedera Testnet Setup

1. Create account at [Hedera Portal](https://portal.hedera.com/)
2. Get test HBAR from [Hedera Testnet Faucet](https://portal.hedera.com/)
3. Export private key and account ID
4. Update environment variables

### Environment Variables

**Backend (.env)**:
```
HEDERA_ACCOUNT_ID=0.0.123456
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...
HEDERA_NETWORK=testnet
CONTRACT_ADDRESS=0x...
CONTRACT_OWNER_PRIVATE_KEY=0x...
PORT=3001
DB_PATH=./data/wata.db
```

**Contracts (.env)**:
```
PRIVATE_KEY=0x...
```

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

## 🚀 Deployment

### Production Deployment

1. Deploy smart contract to Hedera Mainnet
2. Set up production database (PostgreSQL recommended)
3. Configure production environment variables
4. Deploy backend to cloud provider
5. Deploy frontend to CDN

### Monitoring

- Set up logging and monitoring for backend services
- Monitor blockchain events and transaction status
- Track payment processing and compliance metrics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create GitHub issue
- Check documentation
- Review smart contract code

## 🔮 Future Enhancements

- Integration with real IoT sensors
- Multi-token support (HTS tokens)
- Advanced compliance algorithms
- Mobile application
- Integration with other blockchain networks
