"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const database_js_1 = require("./database.js");
const hedera_js_1 = require("./services/hedera.js");
const relayer_js_1 = require("./services/relayer.js");
const oracle_js_1 = require("./services/oracle.js");
const batchScheduler_js_1 = require("./services/batchScheduler.js");
const agreements_js_1 = tslib_1.__importDefault(require("./routes/agreements.js"));
const readings_js_1 = tslib_1.__importDefault(require("./routes/readings.js"));
const payments_js_1 = tslib_1.__importDefault(require("./routes/payments.js"));
const oracle_js_2 = tslib_1.__importDefault(require("./routes/oracle.js"));
const hedera_js_2 = tslib_1.__importDefault(require("./routes/hedera.js"));
const batchScheduler_js_2 = tslib_1.__importDefault(require("./routes/batchScheduler.js"));
const auth_js_1 = tslib_1.__importDefault(require("./routes/auth.js"));
const security_js_1 = require("./middleware/security.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Security middleware
app.use(security_js_1.securityMiddleware);
// Request logging
app.use(security_js_1.requestLogger);
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Initialize services
const db = new database_js_1.Database();
const hederaService = new hedera_js_1.HederaService();
const relayerService = new relayer_js_1.RelayerService(hederaService, db);
const oracleService = new oracle_js_1.OracleService(db, hederaService);
const batchSchedulerService = new batchScheduler_js_1.BatchSchedulerService(db, oracleService);
// Routes
app.use('/api/auth', auth_js_1.default);
app.use('/api/agreements', (0, agreements_js_1.default)(hederaService, db));
app.use('/api/readings', (0, readings_js_1.default)(db));
app.use('/api/payments', (0, payments_js_1.default)(hederaService, db, relayerService));
app.use('/api/oracle', (0, oracle_js_2.default)(db, hederaService));
app.use('/api/hedera', hedera_js_2.default);
app.use('/api/batch-scheduler', (0, batchScheduler_js_2.default)(batchSchedulerService));
// Health check
app.get('/api/health', (req, res) => {
    const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            database: true,
            hedera: true,
            relayer: true
        },
        version: '1.0.0'
    };
    res.json(healthStatus);
});
// Start server
async function startServer() {
    try {
        await db.initialize();
        await hederaService.initialize();
        await relayerService.start();
        await batchSchedulerService.start(); // Start batch scheduler
        app.listen(PORT, () => {
            console.log(`🚀 W.A.T.A. Backend running on port ${PORT}`);
            console.log(`🌐 Hedera Network: ${process.env.HEDERA_NETWORK || 'testnet'}`);
            console.log(`📊 Database initialized`);
            console.log(`🔄 Relayer service started`);
            console.log(`⏰ Batch scheduler started (6-hour intervals)`);
            console.log(`🔐 Authentication system enabled`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Error handling middleware (must be last)
app.use(security_js_1.notFoundHandler);
app.use(security_js_1.errorHandler);
startServer();
//# sourceMappingURL=server.js.map