"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hedera_1 = require("../services/hedera");
const hcs_1 = require("../services/hcs");
const hfs_1 = require("../services/hfs");
const router = (0, express_1.Router)();
const hederaService = new hedera_1.HederaService();
// Initialize services
router.use(async (req, res, next) => {
    try {
        await hederaService.initialize();
        await hcs_1.hcsService.initialize();
        next();
    }
    catch (error) {
        console.error('Failed to initialize Hedera services:', error);
        res.status(500).json({ error: 'Service initialization failed' });
    }
});
// Get account balance
router.get('/balance/:accountId', async (req, res) => {
    try {
        const { accountId } = req.params;
        const balance = await hederaService.getAccountBalance(accountId);
        res.json({
            success: true,
            accountId,
            balance
        });
    }
    catch (error) {
        console.error('Error getting account balance:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get balance'
        });
    }
});
// Get account info
router.get('/account/:accountId', async (req, res) => {
    try {
        const { accountId } = req.params;
        const accountInfo = await hederaService.getAccountInfo(accountId);
        res.json({
            success: true,
            data: accountInfo
        });
    }
    catch (error) {
        console.error('Error getting account info:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get account info'
        });
    }
});
// Transfer HBAR
router.post('/transfer', async (req, res) => {
    try {
        const { toAddress, amount } = req.body;
        if (!toAddress || !amount) {
            return res.status(400).json({
                success: false,
                error: 'toAddress and amount are required'
            });
        }
        const result = await hederaService.transferHBAR(toAddress, amount);
        res.json({
            success: result.success,
            transactionHash: result.transactionHash,
            error: result.error
        });
    }
    catch (error) {
        console.error('Error transferring HBAR:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Transfer failed'
        });
    }
});
// Get transaction info
router.get('/transaction/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        // This would require implementing transaction query in HederaService
        // For now, return basic info
        res.json({
            success: true,
            transactionId,
            explorerUrl: `https://hashscan.io/testnet/transaction/${transactionId}`
        });
    }
    catch (error) {
        console.error('Error getting transaction info:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get transaction info'
        });
    }
});
// HCS endpoints
router.get('/hcs/topic', async (req, res) => {
    try {
        const topicId = await hcs_1.hcsService.getTopicId();
        res.json({
            success: true,
            topicId,
            explorerUrl: topicId ? `https://hashscan.io/testnet/topic/${topicId}` : null
        });
    }
    catch (error) {
        console.error('Error getting HCS topic:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get HCS topic'
        });
    }
});
router.post('/hcs/publish', async (req, res) => {
    try {
        const auditRecord = req.body;
        if (!auditRecord.agreementId || !auditRecord.auditHash) {
            return res.status(400).json({
                success: false,
                error: 'agreementId and auditHash are required'
            });
        }
        const transactionId = await hcs_1.hcsService.publishAuditRecord(auditRecord);
        res.json({
            success: true,
            transactionId,
            explorerUrl: await hcs_1.hcsService.getHederaExplorerUrl(transactionId)
        });
    }
    catch (error) {
        console.error('Error publishing to HCS:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to publish to HCS'
        });
    }
});
// HFS endpoints
router.post('/hfs/report', async (req, res) => {
    try {
        const auditReport = req.body;
        if (!auditReport.agreementId || !auditReport.auditHash) {
            return res.status(400).json({
                success: false,
                error: 'agreementId and auditHash are required'
            });
        }
        const fileId = await hfs_1.hfsService.createAuditReport(auditReport);
        res.json({
            success: true,
            fileId,
            explorerUrl: await hfs_1.hfsService.getHederaExplorerUrl(fileId)
        });
    }
    catch (error) {
        console.error('Error creating HFS report:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create HFS report'
        });
    }
});
router.post('/hfs/append/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        const additionalData = req.body;
        await hfs_1.hfsService.appendToReport(fileId, additionalData);
        res.json({
            success: true,
            fileId,
            explorerUrl: await hfs_1.hfsService.getHederaExplorerUrl(fileId)
        });
    }
    catch (error) {
        console.error('Error appending to HFS file:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to append to HFS file'
        });
    }
});
exports.default = router;
//# sourceMappingURL=hedera.js.map