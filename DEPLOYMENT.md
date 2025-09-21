# W.A.T.A. Chain Deployment Guide

## 🎯 Deployment Checklist

### 1. Hedera Testnet Setup

1. **Create Hedera Account**
   - Go to [Hedera Portal](https://portal.hedera.com/)
   - Create a new account
   - Note your Account ID (format: 0.0.123456)

2. **Get Test HBAR**
   - Use [Hedera Testnet Faucet](https://portal.hedera.com/)
   - Request test HBAR (minimum 100 HBAR recommended)

3. **Export Private Key**
   - In Hedera Portal, go to Account Settings
   - Export your private key
   - Save it securely

### 2. Smart Contract Deployment

```bash
cd contracts

# Install dependencies
yarn install

# Configure environment
cp .env.example .env
# Edit .env with your private key:
# PRIVATE_KEY=0x...

# Compile contracts
yarn hardhat compile

# Deploy to Hedera Testnet
yarn hardhat run scripts/deploy.ts --network hedera_testnet
```

**Expected Output:**
```
Deploying PESContract to Hedera Testnet...
PESContract deployed to: 0x...
Contract owner: 0x...
Initial relayer: 0x...
Deployment info saved to deployment.json
```

**Important:** Copy the contract address from the output!

### 3. Backend Configuration

```bash
cd backend

# Install dependencies
yarn install

# Configure environment
cp .env.example .env
```

**Edit backend/.env:**
```env
# Hedera Configuration
HEDERA_ACCOUNT_ID=0.0.123456
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...
HEDERA_NETWORK=testnet

# Contract Configuration (from deployment)
CONTRACT_ADDRESS=0x...
CONTRACT_OWNER_PRIVATE_KEY=0x...

# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DB_PATH=./data/wata.db
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
yarn install
```

No additional configuration needed for frontend.

### 5. Start the Application

**Option 1: Use the startup script**
```bash
./start.sh
```

**Option 2: Start manually**
```bash
# Terminal 1 - Backend
cd backend
yarn dev

# Terminal 2 - Frontend
cd frontend
yarn dev
```

## 🔍 Verification Steps

### 1. Check Backend Health
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "network": "testnet"
}
```

### 2. Test Smart Contract
```bash
cd contracts
yarn hardhat run scripts/verify.ts --network hedera_testnet
```

### 3. Test Frontend
- Open http://localhost:5173
- Navigate through all tabs
- Create a test agreement
- Simulate readings
- Trigger payment check

## 🚨 Troubleshooting

### Common Issues

**1. "Insufficient HBAR" Error**
- Get more test HBAR from faucet
- Check account balance in Hedera Portal

**2. "Contract not found" Error**
- Verify contract address in backend/.env
- Ensure contract was deployed successfully

**3. "Database connection failed"**
- Check if data directory exists
- Ensure write permissions

**4. "Frontend can't connect to backend"**
- Verify backend is running on port 3001
- Check CORS configuration

### Debug Commands

```bash
# Check Hedera account balance
cd contracts
yarn hardhat run scripts/check-balance.ts --network hedera_testnet

# View contract state
yarn hardhat run scripts/view-contract.ts --network hedera_testnet

# Check backend logs
cd backend
tail -f logs/app.log
```

## 📊 Monitoring

### Backend Logs
```bash
cd backend
tail -f logs/app.log
```

### Database Inspection
```bash
cd backend
sqlite3 data/wata.db
.tables
SELECT * FROM agreements;
SELECT * FROM readings;
SELECT * FROM payments;
```

### Blockchain Explorer
- View transactions: [HashScan Testnet](https://hashscan.io/testnet)
- Search by contract address or transaction hash

## 🔄 Production Deployment

### 1. Hedera Mainnet
- Deploy contract to Hedera Mainnet
- Update network configuration
- Use production HBAR

### 2. Backend Production
- Use PostgreSQL instead of SQLite
- Set up proper logging
- Configure environment variables
- Deploy to cloud provider

### 3. Frontend Production
- Build for production: `yarn build`
- Deploy to CDN
- Configure API endpoints

## 📋 Post-Deployment Checklist

- [ ] Contract deployed successfully
- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] Can create agreements
- [ ] Can simulate readings
- [ ] Payment check works
- [ ] Database persists data
- [ ] Blockchain events are emitted

## 🆘 Support

If you encounter issues:
1. Check the logs
2. Verify environment variables
3. Ensure Hedera account has sufficient HBAR
4. Check network connectivity
5. Review smart contract deployment

## 🎉 Success!

Once everything is running:
- Create your first agreement
- Simulate water quality readings
- Trigger payment checks
- Monitor the dashboard
- Check blockchain transactions

Your W.A.T.A. Chain MVP is now live on Hedera Testnet! 🚀
