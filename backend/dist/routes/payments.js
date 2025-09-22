import express from 'express';
export default function paymentRoutes(hederaService, database, relayerService) {
    const router = express.Router();
    // Trigger payment check for an agreement
    router.post('/trigger-check/:agreementId', async (req, res) => {
        try {
            const agreementId = parseInt(req.params.agreementId);
            if (!agreementId) {
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
            // Trigger payment check through relayer service
            const result = await relayerService.triggerPaymentCheck(agreementId);
            const response = {
                success: true,
                data: result
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error triggering payment check:', error);
            const response = {
                success: false,
                error: 'Failed to trigger payment check',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    // Get payment status for an agreement
    router.get('/agreement/:agreementId', async (req, res) => {
        try {
            const agreementId = parseInt(req.params.agreementId);
            const payments = await database.getPaymentsByAgreement(agreementId);
            const response = {
                success: true,
                data: payments
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error fetching payments:', error);
            const response = {
                success: false,
                error: 'Failed to fetch payments',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    // Get all pending payments
    router.get('/pending', async (req, res) => {
        try {
            const pendingPayments = await database.getPendingPayments();
            const response = {
                success: true,
                data: pendingPayments
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error fetching pending payments:', error);
            const response = {
                success: false,
                error: 'Failed to fetch pending payments',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    // Manual payment processing (for testing)
    router.post('/process/:paymentId', async (req, res) => {
        try {
            const paymentId = parseInt(req.params.paymentId);
            // Get payment details
            const payment = await database.getPayment(paymentId);
            if (!payment) {
                const response = {
                    success: false,
                    error: 'Payment not found'
                };
                return res.status(404).json(response);
            }
            if (payment.status !== 'pending') {
                const response = {
                    success: false,
                    error: 'Payment is not in pending status'
                };
                return res.status(400).json(response);
            }
            // Process payment through relayer
            await relayerService.processPayment(payment);
            const response = {
                success: true,
                message: 'Payment processed successfully'
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error processing payment:', error);
            const response = {
                success: false,
                error: 'Failed to process payment',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    // Get payment statistics
    router.get('/stats', async (req, res) => {
        try {
            // This would require additional database methods to get statistics
            // For now, return basic info
            const pendingPayments = await database.getPendingPayments();
            const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
            const response = {
                success: true,
                data: {
                    pendingPayments: pendingPayments.length,
                    totalPendingAmount
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error('Error fetching payment stats:', error);
            const response = {
                success: false,
                error: 'Failed to fetch payment statistics',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    return router;
}
//# sourceMappingURL=payments.js.map