import express from 'express';
import crypto from 'crypto';

export default function readingRoutes(database) {
  const router = express.Router();

  // Submit a new reading
  router.post('/submit', async (req, res) => {
    try {
      const {
        agreementId,
        turbidityNtu,
        locationLat,
        locationLng,
        isSimulated = false
      } = req.body;

      // Validate required fields
      if (!agreementId || turbidityNtu === undefined) {
        return res.status(400).json({
          error: 'Missing required fields: agreementId, turbidityNtu'
        });
      }

      // Validate turbidity range (0-20 NTU)
      if (turbidityNtu < 0 || turbidityNtu > 20) {
        return res.status(400).json({
          error: 'Turbidity must be between 0 and 20 NTU'
        });
      }

      // Generate audit hash
      const auditData = {
        agreementId,
        turbidityNtu,
        locationLat,
        locationLng,
        timestamp: Date.now(),
        isSimulated
      };

      const auditHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(auditData))
        .digest('hex');

      // Create reading in database
      const readingId = await database.createReading({
        agreementId,
        turbidityNtu,
        locationLat,
        locationLng,
        isSimulated,
        auditHash
      });

      res.status(201).json({
        success: true,
        reading: {
          id: readingId,
          agreementId,
          turbidityNtu,
          locationLat,
          locationLng,
          isSimulated,
          auditHash,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error submitting reading:', error);
      res.status(500).json({
        error: 'Failed to submit reading',
        details: error.message
      });
    }
  });

  // Simulate a reading
  router.post('/simulate', async (req, res) => {
    try {
      const { agreementId, locationLat, locationLng } = req.body;

      if (!agreementId) {
        return res.status(400).json({
          error: 'Missing required field: agreementId'
        });
      }

      // Generate random turbidity between 0-20 NTU
      const turbidityNtu = Math.random() * 20;
      
      // Create simulated reading
      const readingData = {
        agreementId,
        turbidityNtu: parseFloat(turbidityNtu.toFixed(2)),
        locationLat: locationLat || null,
        locationLng: locationLng || null,
        isSimulated: true
      };

      // Generate audit hash
      const auditData = {
        ...readingData,
        timestamp: Date.now()
      };

      const auditHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(auditData))
        .digest('hex');

      // Create reading in database
      const readingId = await database.createReading({
        ...readingData,
        auditHash
      });

      res.status(201).json({
        success: true,
        reading: {
          id: readingId,
          ...readingData,
          auditHash,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error simulating reading:', error);
      res.status(500).json({
        error: 'Failed to simulate reading',
        details: error.message
      });
    }
  });

  // Get readings for a specific agreement
  router.get('/agreement/:agreementId', async (req, res) => {
    try {
      const agreementId = parseInt(req.params.agreementId);
      const limit = parseInt(req.query.limit) || 50;

      const readings = await database.getReadingsByAgreement(agreementId, limit);

      res.json({
        success: true,
        readings
      });
    } catch (error) {
      console.error('Error fetching readings:', error);
      res.status(500).json({
        error: 'Failed to fetch readings',
        details: error.message
      });
    }
  });

  // Get recent readings across all agreements
  router.get('/recent', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const readings = await database.getRecentReadings(limit);

      res.json({
        success: true,
        readings
      });
    } catch (error) {
      console.error('Error fetching recent readings:', error);
      res.status(500).json({
        error: 'Failed to fetch recent readings',
        details: error.message
      });
    }
  });

  // Get reading statistics for an agreement
  router.get('/agreement/:agreementId/stats', async (req, res) => {
    try {
      const agreementId = parseInt(req.params.agreementId);
      const days = parseInt(req.query.days) || 7;

      const readings = await database.getReadingsByAgreement(agreementId, 100);
      
      // Filter readings by date range
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const recentReadings = readings.filter(reading => 
        new Date(reading.timestamp) >= cutoffDate
      );

      if (recentReadings.length === 0) {
        return res.json({
          success: true,
          stats: {
            totalReadings: 0,
            averageTurbidity: 0,
            minTurbidity: 0,
            maxTurbidity: 0,
            complianceRate: 0,
            days: days
          }
        });
      }

      const turbidityValues = recentReadings.map(r => r.turbidity_ntu);
      const averageTurbidity = turbidityValues.reduce((sum, val) => sum + val, 0) / turbidityValues.length;
      const minTurbidity = Math.min(...turbidityValues);
      const maxTurbidity = Math.max(...turbidityValues);
      
      // Calculate compliance rate (turbidity <= 10 NTU)
      const compliantReadings = recentReadings.filter(r => r.turbidity_ntu <= 10);
      const complianceRate = (compliantReadings.length / recentReadings.length) * 100;

      res.json({
        success: true,
        stats: {
          totalReadings: recentReadings.length,
          averageTurbidity: parseFloat(averageTurbidity.toFixed(2)),
          minTurbidity: parseFloat(minTurbidity.toFixed(2)),
          maxTurbidity: parseFloat(maxTurbidity.toFixed(2)),
          complianceRate: parseFloat(complianceRate.toFixed(2)),
          days: days
        }
      });
    } catch (error) {
      console.error('Error fetching reading stats:', error);
      res.status(500).json({
        error: 'Failed to fetch reading statistics',
        details: error.message
      });
    }
  });

  return router;
}
