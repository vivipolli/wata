import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export default function agreementRoutes(hederaService, database) {
  const router = express.Router();

  // Create new agreement
  router.post('/', async (req, res) => {
    try {
      const {
        producerName,
        producerAddress,
        baseValue,
        hectares,
        locationLat,
        locationLng,
        durationDays
      } = req.body;

      // Validate required fields
      if (!producerName || !producerAddress || !baseValue || !hectares) {
        return res.status(400).json({
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
      const blockchainAgreementId = await hederaService.createAgreement(
        agreementHash,
        producerAddress,
        baseValue,
        hectares
      );

      res.status(201).json({
        success: true,
        agreement: {
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
      });
    } catch (error) {
      console.error('Error creating agreement:', error);
      res.status(500).json({
        error: 'Failed to create agreement',
        details: error.message
      });
    }
  });

  // Get all agreements
  router.get('/', async (req, res) => {
    try {
      const agreements = await database.getAllAgreements();
      res.json({
        success: true,
        agreements
      });
    } catch (error) {
      console.error('Error fetching agreements:', error);
      res.status(500).json({
        error: 'Failed to fetch agreements',
        details: error.message
      });
    }
  });

  // Get specific agreement
  router.get('/:id', async (req, res) => {
    try {
      const agreementId = parseInt(req.params.id);
      const agreement = await database.getAgreement(agreementId);

      if (!agreement) {
        return res.status(404).json({
          error: 'Agreement not found'
        });
      }

      // Get recent readings for this agreement
      const readings = await database.getReadingsByAgreement(agreementId, 10);

      res.json({
        success: true,
        agreement: {
          ...agreement,
          recentReadings: readings
        }
      });
    } catch (error) {
      console.error('Error fetching agreement:', error);
      res.status(500).json({
        error: 'Failed to fetch agreement',
        details: error.message
      });
    }
  });

  // Get agreement payments
  router.get('/:id/payments', async (req, res) => {
    try {
      const agreementId = parseInt(req.params.id);
      const payments = await database.getPaymentsByAgreement(agreementId);

      res.json({
        success: true,
        payments
      });
    } catch (error) {
      console.error('Error fetching agreement payments:', error);
      res.status(500).json({
        error: 'Failed to fetch payments',
        details: error.message
      });
    }
  });

  return router;
}
