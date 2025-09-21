import express from 'express';

export default function paymentRoutes(hederaService, database, relayerService) {
  const router = express.Router();

  // Trigger payment check for an agreement
  router.post('/trigger-check/:agreementId', async (req, res) => {
    try {
      const agreementId = parseInt(req.params.agreementId);

      if (!agreementId) {
        return res.status(400).json({
          error: 'Invalid agreement ID'
        });
      }

      // Check if agreement exists
      const agreement = await database.getAgreement(agreementId);
      if (!agreement) {
        return res.status(404).json({
          error: 'Agreement not found'
        });
      }

      // Trigger payment check through relayer service
      const result = await relayerService.triggerPaymentCheck(agreementId);

      res.json({
        success: true,
        result
      });
    } catch (error) {
      console.error('Error triggering payment check:', error);
      res.status(500).json({
        error: 'Failed to trigger payment check',
        details: error.message
      });
    }
  });

  // Get payment status for an agreement
  router.get('/agreement/:agreementId', async (req, res) => {
    try {
      const agreementId = parseInt(req.params.agreementId);
      const payments = await database.getPaymentsByAgreement(agreementId);

      res.json({
        success: true,
        payments
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({
        error: 'Failed to fetch payments',
        details: error.message
      });
    }
  });

  // Get all pending payments
  router.get('/pending', async (req, res) => {
    try {
      const pendingPayments = await database.getPendingPayments();

      res.json({
        success: true,
        payments: pendingPayments
      });
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      res.status(500).json({
        error: 'Failed to fetch pending payments',
        details: error.message
      });
    }
  });

  // Manual payment processing (for testing)
  router.post('/process/:paymentId', async (req, res) => {
    try {
      const paymentId = parseInt(req.params.paymentId);
      
      // Get payment details
      const payment = await database.getPayment(paymentId);
      if (!payment) {
        return res.status(404).json({
          error: 'Payment not found'
        });
      }

      if (payment.status !== 'pending') {
        return res.status(400).json({
          error: 'Payment is not in pending status'
        });
      }

      // Process payment through relayer
      await relayerService.processPayment(payment);

      res.json({
        success: true,
        message: 'Payment processed successfully'
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({
        error: 'Failed to process payment',
        details: error.message
      });
    }
  });

  // Get payment statistics
  router.get('/stats', async (req, res) => {
    try {
      // This would require additional database methods to get statistics
      // For now, return basic info
      const pendingPayments = await database.getPendingPayments();
      
      res.json({
        success: true,
        stats: {
          pendingPayments: pendingPayments.length,
          totalPendingAmount: pendingPayments.reduce((sum, p) => sum + p.amount, 0)
        }
      });
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      res.status(500).json({
        error: 'Failed to fetch payment statistics',
        details: error.message
      });
    }
  });

  return router;
}
