import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Database } from './database.js';
import { HederaService } from './services/hedera.js';
import { RelayerService } from './services/relayer.js';
import agreementRoutes from './routes/agreements.js';
import readingRoutes from './routes/readings.js';
import paymentRoutes from './routes/payments.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const db = new Database();
const hederaService = new HederaService();
const relayerService = new RelayerService(hederaService, db);

// Routes
app.use('/api/agreements', agreementRoutes(hederaService, db));
app.use('/api/readings', readingRoutes(db));
app.use('/api/payments', paymentRoutes(hederaService, db, relayerService));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    network: process.env.HEDERA_NETWORK || 'testnet'
  });
});

// Start server
async function startServer() {
  try {
    await db.initialize();
    await hederaService.initialize();
    await relayerService.start();
    
    app.listen(PORT, () => {
      console.log(`🚀 W.A.T.A. Backend running on port ${PORT}`);
      console.log(`🌐 Hedera Network: ${process.env.HEDERA_NETWORK || 'testnet'}`);
      console.log(`📊 Database initialized`);
      console.log(`🔄 Relayer service started`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
