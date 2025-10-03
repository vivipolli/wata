"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = oracleRoutes;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const oracle_1 = require("../services/oracle");
const auth_1 = require("../middleware/auth");
function oracleRoutes(database, hederaService) {
    const router = express_1.default.Router();
    const oracleService = new oracle_1.OracleService(database, hederaService);
    const authMiddleware = new auth_1.AuthMiddleware(database);
    // ===== NEW HIERARCHICAL ROUTES: User Producer -> Contract -> Oracle Status =====
    /**
     * GET /api/oracle/producer/:producerAddress/status
     * Get oracle status for all contracts of a specific producer
     */
    router.get('/producer/:producerAddress/status', authMiddleware.authenticate, async (req, res) => {
        try {
            const producerAddress = req.params.producerAddress;
            const user = req.user;
            // Security: Only allow producers to see their own data, or managers/investors to see all
            if (user.role === 'PRODUCER' && user.address !== producerAddress) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied: You can only view your own oracle status'
                });
            }
            // Get all agreements for this producer
            const agreements = await database.getAgreementsByProducer(producerAddress);
            if (agreements.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        producerAddress,
                        totalAgreements: 0,
                        contracts: [],
                        summary: {
                            totalBatches: 0,
                            pendingBatches: 0,
                            averageScore: 0,
                            lastActivity: null
                        }
                    }
                });
            }
            // Get oracle status for each agreement
            const contractsWithOracleStatus = await Promise.all(agreements.map(async (agreement) => {
                const batches = await database.getBatchesByAgreement(agreement.id, 10);
                // Calculate contract-specific oracle metrics
                const totalBatches = batches.length;
                const pendingBatches = batches.filter(batch => batch.validation_status === 'pending').length;
                const averageScore = totalBatches > 0 ?
                    batches.reduce((sum, batch) => sum + (batch.score ?? 0), 0) / totalBatches : 0;
                const lastActivity = batches.length > 0 ? batches[0].created_at : null;
                return {
                    agreementId: agreement.id,
                    agreementHash: agreement.agreement_hash,
                    producerName: agreement.producer_name,
                    baseValue: agreement.base_value,
                    hectares: agreement.hectares,
                    isActive: agreement.is_active,
                    createdAt: agreement.created_at,
                    oracleStatus: {
                        totalBatches,
                        pendingBatches,
                        averageScore: Math.round(averageScore * 100) / 100,
                        lastActivity,
                        recentBatches: batches.slice(0, 5).map(batch => ({
                            id: batch.id,
                            score: batch.score,
                            status: batch.validation_status,
                            createdAt: batch.created_at,
                            transactionHash: batch.hcs_transaction_id
                        }))
                    }
                };
            }));
            // Calculate overall summary
            const allBatches = contractsWithOracleStatus.flatMap(contract => contract.oracleStatus.recentBatches);
            const totalBatches = contractsWithOracleStatus.reduce((sum, contract) => sum + contract.oracleStatus.totalBatches, 0);
            const pendingBatches = contractsWithOracleStatus.reduce((sum, contract) => sum + contract.oracleStatus.pendingBatches, 0);
            const overallAverageScore = totalBatches > 0 ?
                contractsWithOracleStatus.reduce((sum, contract) => sum + (contract.oracleStatus.averageScore * contract.oracleStatus.totalBatches), 0) / totalBatches : 0;
            const response = {
                success: true,
                data: {
                    producerAddress,
                    totalAgreements: agreements.length,
                    contracts: contractsWithOracleStatus,
                    summary: {
                        totalBatches,
                        pendingBatches,
                        averageScore: Math.round(overallAverageScore * 100) / 100,
                        lastActivity: allBatches.length > 0 ? allBatches[0].createdAt : null
                    }
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error fetching producer oracle status:', error);
            const response = {
                success: false,
                error: 'Failed to fetch producer oracle status',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    /**
     * GET /api/oracle/contract/:agreementId/status
     * Get detailed oracle status for a specific contract
     */
    router.get('/contract/:agreementId/status', authMiddleware.authenticate, async (req, res) => {
        try {
            const agreementId = parseInt(req.params.agreementId);
            const user = req.user;
            if (isNaN(agreementId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid agreement ID'
                });
            }
            // Get agreement details
            const agreement = await database.getAgreement(agreementId);
            if (!agreement) {
                return res.status(404).json({
                    success: false,
                    error: 'Agreement not found'
                });
            }
            // Security: Only allow producers to see their own contracts, or managers/investors to see all
            if (user.role === 'PRODUCER' && user.address !== agreement.producer_address) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied: You can only view your own contract oracle status'
                });
            }
            // Get all batches for this agreement
            const batches = await database.getBatchesByAgreement(agreementId, 50);
            // Get recent oracle logs
            const recentLogs = await database.getRecentOracleLogs(50);
            const agreementLogs = recentLogs.filter(log => log.batch_id && batches.some(batch => batch.id === log.batch_id));
            // Calculate detailed metrics
            const totalBatches = batches.length;
            const pendingBatches = batches.filter(batch => batch.validation_status === 'pending').length;
            const validatedBatches = batches.filter(batch => batch.validation_status === 'validated').length;
            const submittedBatches = batches.filter(batch => batch.validation_status === 'submitted').length;
            const averageScore = totalBatches > 0 ?
                batches.reduce((sum, batch) => sum + (batch.score ?? 0), 0) / totalBatches : 0;
            const lastWeekBatches = batches.filter(batch => {
                const batchDate = new Date(batch.created_at);
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return batchDate >= weekAgo;
            });
            const weeklyAverageScore = lastWeekBatches.length > 0 ?
                lastWeekBatches.reduce((sum, batch) => sum + (batch.score ?? 0), 0) / lastWeekBatches.length : 0;
            const response = {
                success: true,
                data: {
                    agreement: {
                        id: agreement.id,
                        agreementHash: agreement.agreement_hash,
                        producerName: agreement.producer_name,
                        producerAddress: agreement.producer_address,
                        baseValue: agreement.base_value,
                        hectares: agreement.hectares,
                        isActive: agreement.is_active,
                        createdAt: agreement.created_at
                    },
                    oracleStatus: {
                        totalBatches,
                        pendingBatches,
                        validatedBatches,
                        submittedBatches,
                        averageScore: Math.round(averageScore * 100) / 100,
                        weeklyAverageScore: Math.round(weeklyAverageScore * 100) / 100,
                        lastActivity: batches.length > 0 ? batches[0].created_at : null,
                        recentBatches: batches.slice(0, 10).map(batch => ({
                            id: batch.id,
                            score: batch.score,
                            status: batch.validation_status,
                            readingsCount: batch.readings_count,
                            averageTurbidity: batch.average_turbidity,
                            outliersDetected: batch.outliers_detected,
                            createdAt: batch.created_at,
                            submittedAt: batch.submitted_at,
                            transactionHash: batch.hcs_transaction_id,
                            auditHash: batch.audit_hash
                        })),
                        recentLogs: agreementLogs.slice(0, 20).map(log => ({
                            id: log.id,
                            action: log.action,
                            details: log.details,
                            timestamp: log.timestamp,
                            transactionHash: log.transaction_hash
                        }))
                    }
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error fetching contract oracle status:', error);
            const response = {
                success: false,
                error: 'Failed to fetch contract oracle status',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    /**
     * GET /api/oracle/contract/:agreementId/batches
     * Get all batches for a specific contract with detailed oracle information
     */
    router.get('/contract/:agreementId/batches', authMiddleware.authenticate, async (req, res) => {
        try {
            const agreementId = parseInt(req.params.agreementId);
            const limit = parseInt(req.query.limit) || 50;
            const user = req.user;
            if (isNaN(agreementId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid agreement ID'
                });
            }
            // Get agreement details for security check
            const agreement = await database.getAgreement(agreementId);
            if (!agreement) {
                return res.status(404).json({
                    success: false,
                    error: 'Agreement not found'
                });
            }
            // Security: Only allow producers to see their own contracts, or managers/investors to see all
            if (user.role === 'PRODUCER' && user.address !== agreement.producer_address) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied: You can only view your own contract batches'
                });
            }
            // Get batches with transaction hashes
            const batches = await database.getBatchesByAgreement(agreementId, limit);
            const batchesWithTxHash = await Promise.all(batches.map(async (batch) => {
                const oracleLog = await database.getOracleLogForBatchAction(batch.id, 'batch_submitted');
                return {
                    ...batch,
                    transaction_hash: oracleLog?.transaction_hash ?? null
                };
            }));
            const response = {
                success: true,
                data: {
                    agreementId,
                    totalBatches: batchesWithTxHash.length,
                    batches: batchesWithTxHash
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error fetching contract batches:', error);
            const response = {
                success: false,
                error: 'Failed to fetch contract batches',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    // Process batch validation for a specific agreement
    router.post('/process', async (req, res) => {
        try {
            const { agreementId, hoursBack = 168 } = req.body;
            if (!agreementId || isNaN(agreementId)) {
                const response = {
                    success: false,
                    error: 'Invalid agreement ID'
                };
                return res.status(400).json(response);
            }
            // Check if agreement exists
            const agreement = await database.getAgreement(agreementId);
            if (!agreement) {
                const response = {
                    success: false,
                    error: 'Agreement not found'
                };
                return res.status(404).json(response);
            }
            // Process the batch
            const batchResult = await oracleService.processBatch(agreementId);
            // Submit to smart contract
            const transactionHash = await oracleService.submitValidatedBatch(agreementId, batchResult);
            const result = {
                batchId: 0, // Will be updated by the service
                auditHash: batchResult.auditHash,
                score: batchResult.score,
                validReadings: batchResult.validReadings.length,
                invalidReadings: batchResult.invalidReadings.length,
                transactionHash
            };
            const response = {
                success: true,
                data: result,
                message: 'Batch processed and submitted successfully'
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error processing oracle batch:', error);
            const response = {
                success: false,
                error: 'Failed to process batch',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    // Process all active agreements
    router.post('/process-all', async (req, res) => {
        try {
            const agreements = await database.getAgreementsWithRecentActivity(7);
            const results = [];
            const errors = [];
            for (const agreement of agreements) {
                try {
                    const batchResult = await oracleService.processBatch(agreement.id);
                    const transactionHash = await oracleService.submitValidatedBatch(agreement.id, batchResult);
                    results.push({
                        batchId: agreement.id,
                        auditHash: batchResult.auditHash,
                        score: batchResult.score,
                        validReadings: batchResult.validReadings.length,
                        invalidReadings: batchResult.invalidReadings.length,
                        transactionHash
                    });
                }
                catch (error) {
                    errors.push(`Agreement ${agreement.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            const response = {
                success: true,
                data: {
                    processed: results.length,
                    results,
                    errors
                },
                message: `Processed ${results.length} agreements${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error processing all oracle batches:', error);
            const response = {
                success: false,
                error: 'Failed to process batches',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    // Get batch information
    router.get('/batch/:batchId', async (req, res) => {
        try {
            const batchId = parseInt(req.params.batchId);
            if (isNaN(batchId)) {
                const response = {
                    success: false,
                    error: 'Invalid batch ID'
                };
                return res.status(400).json(response);
            }
            const batch = await database.getBatch(batchId);
            if (!batch) {
                const response = {
                    success: false,
                    error: 'Batch not found'
                };
                return res.status(404).json(response);
            }
            // Get associated logs
            const logs = await database.getOracleLogsByBatch(batchId);
            const response = {
                success: true,
                data: {
                    batch,
                    logs
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error fetching batch:', error);
            const response = {
                success: false,
                error: 'Failed to fetch batch',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    // Get batches by agreement
    router.get('/batches/agreement/:agreementId', async (req, res) => {
        try {
            const agreementId = parseInt(req.params.agreementId);
            const limit = parseInt(req.query.limit) || 50;
            if (isNaN(agreementId)) {
                const response = {
                    success: false,
                    error: 'Invalid agreement ID'
                };
                return res.status(400).json(response);
            }
            const batches = await database.getBatchesByAgreement(agreementId, limit);
            // Add transaction_hash from oracle logs for each batch
            const batchesWithTxHash = await Promise.all(batches.map(async (batch) => {
                const oracleLog = await database.getOracleLogForBatchAction(batch.id, 'batch_submitted');
                return {
                    ...batch,
                    transaction_hash: oracleLog?.transaction_hash ?? null
                };
            }));
            const response = {
                success: true,
                data: batchesWithTxHash
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error fetching batches:', error);
            const response = {
                success: false,
                error: 'Failed to fetch batches',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    // Get oracle logs
    router.get('/logs', async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const logs = await database.getRecentOracleLogs(limit);
            const response = {
                success: true,
                data: logs
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error fetching oracle logs:', error);
            const response = {
                success: false,
                error: 'Failed to fetch oracle logs',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    // Get oracle statistics
    router.get('/stats', async (req, res) => {
        try {
            const pendingBatches = await database.getPendingBatches();
            const recentLogs = await database.getRecentOracleLogs(50);
            // Calculate some basic statistics
            const validationActions = recentLogs.filter(log => log.action === 'batch_validated');
            const submissionActions = recentLogs.filter(log => log.action === 'batch_submitted');
            const stats = {
                pendingBatches: pendingBatches.length,
                recentValidations: validationActions.length,
                recentSubmissions: submissionActions.length,
                successRate: submissionActions.length > 0 ?
                    (submissionActions.length / validationActions.length * 100).toFixed(2) : '0',
                lastActivity: recentLogs.length > 0 ? recentLogs[0].timestamp : null
            };
            const response = {
                success: true,
                data: stats
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error fetching oracle stats:', error);
            const response = {
                success: false,
                error: 'Failed to fetch oracle statistics',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    // Get weekly average score for an agreement
    // Business Rule: A média semanal deve ser normalizada em um score entre 0 e 1
    router.get('/weekly-average/:agreementId', async (req, res) => {
        try {
            const agreementId = parseInt(req.params.agreementId);
            if (isNaN(agreementId)) {
                const response = {
                    success: false,
                    error: 'Invalid agreement ID'
                };
                return res.status(400).json(response);
            }
            const weeklyScore = await oracleService.calculateWeeklyAverage(agreementId);
            const response = {
                success: true,
                data: {
                    agreementId,
                    weeklyScore,
                    threshold: 0.7,
                    isEligible: weeklyScore >= 0.7,
                    timestamp: new Date().toISOString()
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error calculating weekly average:', error);
            const response = {
                success: false,
                error: 'Failed to calculate weekly average'
            };
            res.status(500).json(response);
        }
    });
    return router;
}
//# sourceMappingURL=oracle.js.map