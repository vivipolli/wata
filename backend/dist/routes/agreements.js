import express from 'express';
import crypto from 'crypto';
import { AuthMiddleware } from '../middleware/auth';
export default function agreementRoutes(hederaService, database) {
    const router = express.Router();
    const authMiddleware = new AuthMiddleware(database);
    // Create new agreement with user signature
    router.post('/', async (req, res) => {
        try {
            const { producerName, producerAddress, baseValue, hectares, locationLat, locationLng, durationDays, signedTransaction } = req.body;
            // Validate required fields
            if (!producerName || !producerAddress || !baseValue || !hectares) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: producerName, producerAddress, baseValue, hectares'
                });
            }
            // Handle blockchain-signed transaction (frontend already executed on Hedera)
            if (signedTransaction || req.body.blockchainId) {
                console.log('Processing blockchain-signed transaction...');
                // Generate agreement hash
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
                const agreementHash = crypto
                    .createHash('sha256')
                    .update(JSON.stringify(agreementData))
                    .digest('hex');
                // Create agreement in database
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
                // Update database with blockchain ID (transaction already executed on Hedera)
                const blockchainId = req.body.blockchainId;
                if (blockchainId) {
                    await database.updateAgreementBlockchainId(agreementId, blockchainId);
                }
                const response = {
                    success: true,
                    data: {
                        id: agreementId,
                        blockchainId: blockchainId,
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
                return res.status(201).json(response);
            }
            // Fallback to server-signed transaction (legacy)
            console.log('No signed transaction provided, using server-signed transaction (legacy)');
            // Generate agreement hash
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
            const agreementHash = crypto
                .createHash('sha256')
                .update(JSON.stringify(agreementData))
                .digest('hex');
            // Create agreement in database
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
            // Create agreement on Hedera blockchain (server-signed)
            const blockchainResult = await hederaService.createAgreement(agreementHash, producerAddress, baseValue, hectares);
            // Update database with blockchain ID and transaction ID
            if (blockchainResult && blockchainResult.agreementId) {
                await database.updateAgreementBlockchainId(agreementId, blockchainResult.agreementId);
            }
            const response = {
                success: true,
                data: {
                    id: agreementId,
                    blockchainId: blockchainResult?.agreementId || null,
                    transactionId: blockchainResult?.transactionId || null,
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
            console.error('Error creating agreement:', error);
            const response = {
                success: false,
                error: 'Failed to create agreement',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    // Get all agreements - Only MANAGER and INVESTOR can access
    router.get('/', authMiddleware.authenticate, authMiddleware.blockProducersFromAllAgreements, async (req, res) => {
        try {
            const agreements = await database.getAllAgreements();
            const response = {
                success: true,
                data: agreements
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error fetching agreements:', error);
            const response = {
                success: false,
                error: 'Failed to fetch agreements',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    // Get agreements by producer address
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
            const response = {
                success: true,
                data: {
                    agreements,
                    producerAddress,
                    totalAgreements: agreements.length
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error fetching agreements by producer:', error);
            const response = {
                success: false,
                error: 'Failed to fetch agreements for producer',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    // Get specific agreement
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
            // Get recent readings for this agreement
            const readings = await database.getReadingsByAgreement(agreementId, 10);
            const response = {
                success: true,
                data: {
                    ...agreement,
                    recentReadings: readings
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error fetching agreement:', error);
            const response = {
                success: false,
                error: 'Failed to fetch agreement',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    // Get agreement payments
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
            console.error('Error fetching agreement payments:', error);
            const response = {
                success: false,
                error: 'Failed to fetch payments',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    // Verify transaction status
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
            console.error('Error verifying transaction:', error);
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