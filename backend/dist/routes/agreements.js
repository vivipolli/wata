import express from 'express';
import crypto from 'crypto';
export default function agreementRoutes(hederaService, database) {
    const router = express.Router();
    // Create new agreement
    router.post('/', async (req, res) => {
        try {
            const { producerName, producerAddress, baseValue, hectares, locationLat, locationLng, durationDays } = req.body;
            // Validate required fields
            if (!producerName || !producerAddress || !baseValue || !hectares) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: producerName, producerAddress, baseValue, hectares'
                });
            }
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
            // Create agreement on Hedera blockchain
            const blockchainAgreementId = await hederaService.createAgreement(agreementHash, producerAddress, baseValue, hectares);
            const response = {
                success: true,
                data: {
                    id: agreementId,
                    blockchainId: blockchainAgreementId,
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
    // Get all agreements
    router.get('/', async (req, res) => {
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
    return router;
}
//# sourceMappingURL=agreements.js.map