"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = agreementRoutes;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const auth_1 = require("../middleware/auth");
function agreementRoutes(hederaService, database) {
    const router = express_1.default.Router();
    const authMiddleware = new auth_1.AuthMiddleware(database);
    // Transform database row to camelCase format
    const transformAgreement = (row) => ({
        id: row.id,
        agreementHash: row.agreement_hash,
        producerName: row.producer_name,
        producerAddress: row.producer_address,
        baseValue: row.base_value,
        hectares: row.hectares,
        locationLat: row.location_lat,
        locationLng: row.location_lng,
        durationDays: row.duration_days,
        createdAt: row.created_at,
        isActive: row.is_active,
        blockchainId: row.blockchain_id,
        transactionId: row.transaction_id,
        investorAddress: row.investor_address,
        governanceMode: row.governance_mode,
        totalInvested: row.total_invested,
        totalPaid: row.total_paid
    });
    router.post('/', authMiddleware.authenticate, async (req, res) => {
        try {
            const { producerName, producerAddress, baseValue, hectares, locationLat, locationLng, durationDays, signedTransaction } = req.body;
            if (!producerName || !producerAddress || !baseValue || !hectares) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: producerName, producerAddress, baseValue, hectares'
                });
            }
            // Update user address for producers (always update to match the agreement)
            const user = req.user;
            if (user && user.role === 'PRODUCER') {
                await database.updateUserAddress(user.id, producerAddress);
                console.log(`Updated user ${user.id} address to ${producerAddress}`);
            }
            const agreementData = {
                producerName,
                producerAddress,
                baseValue,
                hectares,
                locationLat,
                locationLng,
                durationDays,
                timestamp: Date.now()
            };
            const agreementHash = crypto_1.default
                .createHash('sha256')
                .update(JSON.stringify(agreementData))
                .digest('hex');
            const agreementId = await database.createAgreement({
                agreementHash,
                producerName,
                producerAddress,
                baseValue,
                hectares,
                locationLat,
                locationLng,
                durationDays
            });
            // Handle blockchain integration
            let blockchainId = null;
            let transactionId = null;
            if (signedTransaction || req.body.blockchainId) {
                // Use provided blockchain ID or transaction
                blockchainId = req.body.blockchainId;
                transactionId = req.body.transactionId;
                if (blockchainId) {
                    await database.updateAgreementBlockchainId(agreementId, blockchainId);
                }
                if (transactionId) {
                    await database.updateAgreementTransactionId(agreementId, transactionId);
                }
            }
            else {
                // Create new blockchain agreement
                const result = await hederaService.createAgreementWithSystem(agreementHash, producerAddress, baseValue, hectares);
                blockchainId = result.agreementId;
                transactionId = result.transactionId;
                await database.updateAgreementBlockchainId(agreementId, result.agreementId);
                if (transactionId) {
                    await database.updateAgreementTransactionId(agreementId, transactionId);
                }
            }
            const response = {
                success: true,
                data: {
                    id: agreementId,
                    blockchainId: blockchainId,
                    transactionId: transactionId,
                    agreementHash,
                    producerName,
                    producerAddress,
                    baseValue,
                    hectares,
                    locationLat,
                    locationLng,
                    durationDays,
                    createdAt: new Date().toISOString()
                }
            };
            res.status(201).json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: 'Failed to create agreement',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    router.get('/', authMiddleware.authenticate, authMiddleware.blockProducersFromAllAgreements, async (req, res) => {
        try {
            const agreements = await database.getAllAgreements();
            const transformedAgreements = agreements.map(transformAgreement);
            const response = {
                success: true,
                data: { agreements: transformedAgreements }
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: 'Failed to fetch agreements',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    router.get('/producer/:address', async (req, res) => {
        try {
            const producerAddress = req.params.address;
            if (!producerAddress) {
                const response = {
                    success: false,
                    error: 'Producer address is required'
                };
                res.status(400).json(response);
                return;
            }
            const agreements = await database.getAgreementsByProducer(producerAddress);
            const transformedAgreements = agreements.map(transformAgreement);
            const response = {
                success: true,
                data: {
                    agreements: transformedAgreements,
                    producerAddress,
                    totalAgreements: agreements.length
                }
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: 'Failed to fetch agreements for producer',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    router.get('/:id', async (req, res) => {
        try {
            const agreementId = parseInt(req.params.id);
            const agreement = await database.getAgreement(agreementId);
            if (!agreement) {
                const response = {
                    success: false,
                    error: 'Agreement not found'
                };
                res.status(404).json(response);
                return;
            }
            const readings = await database.getReadingsByAgreement(agreementId, 10);
            const transformedAgreement = transformAgreement(agreement);
            const response = {
                success: true,
                data: {
                    ...transformedAgreement,
                    recentReadings: readings
                }
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: 'Failed to fetch agreement',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    router.get('/:id/payments', async (req, res) => {
        try {
            const agreementId = parseInt(req.params.id);
            const payments = await database.getPaymentsByAgreement(agreementId);
            const response = {
                success: true,
                data: payments
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: 'Failed to fetch payments',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    router.get('/verify/:transactionHash', async (req, res) => {
        try {
            const { transactionHash } = req.params;
            if (!transactionHash) {
                return res.status(400).json({
                    success: false,
                    error: 'Transaction hash is required'
                });
            }
            const verification = await hederaService.verifyTransaction(transactionHash);
            const response = {
                success: true,
                data: {
                    transactionHash,
                    status: verification.status,
                    success: verification.success,
                    details: verification.details
                }
            };
            res.json(response);
        }
        catch (error) {
            const response = {
                success: false,
                error: 'Failed to verify transaction',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    return router;
}
//# sourceMappingURL=agreements.js.map