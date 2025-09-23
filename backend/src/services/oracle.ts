import crypto from 'crypto'
import { Database } from '../database.js'
import { HederaService } from './hedera.js'

interface ReadingData {
  id: number
  agreementId: number
  turbidityNtu: number
  timestamp: string
  locationLat?: number
  locationLng?: number
  isSimulated: boolean
}

interface ValidationResult {
  isValid: boolean
  reason?: string
  outlierScore?: number
}

interface BatchValidationResult {
  readings: ReadingData[]
  validReadings: ReadingData[]
  invalidReadings: ReadingData[]
  score: number
  averageTurbidity: number
  medianTurbidity: number
  outliersDetected: number
  auditHash: string
  signature: string
}

export class OracleService {
  private database: Database
  private hederaService: HederaService
  private oraclePrivateKey: string
  private oracleAddress: string

  constructor(database: Database, hederaService: HederaService) {
    this.database = database
    this.hederaService = hederaService
    this.oraclePrivateKey = process.env.ORACLE_PRIVATE_KEY || ''
    this.oracleAddress = process.env.ORACLE_ADDRESS || ''
  }

  // Collector Module - Collects readings for validation
  async collectReadingsForValidation(agreementId: number, hoursBack: number = 168): Promise<ReadingData[]> {
    const cutoffDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000)
    
    const readings = await (this.database as any).all(
      `SELECT * FROM readings 
       WHERE agreement_id = ? 
       AND timestamp >= ? 
       AND is_validated = 0
       ORDER BY timestamp ASC`,
      [agreementId, cutoffDate.toISOString()]
    )

    return readings.map(row => ({
      id: row.id,
      agreementId: row.agreement_id,
      turbidityNtu: row.turbidity_ntu,
      timestamp: row.timestamp,
      locationLat: row.location_lat,
      locationLng: row.location_lng,
      isSimulated: row.is_simulated
    }))
  }

  // Validator Module - Validates individual readings
  private validateReading(reading: ReadingData, allReadings: ReadingData[]): ValidationResult {
    // Rule 1: Turbidity must be between 0-100 NTU
    if (reading.turbidityNtu < 0 || reading.turbidityNtu > 100) {
      return {
        isValid: false,
        reason: 'Turbidity value out of range (0-100 NTU)'
      }
    }

    // Rule 2: Outlier detection using median and IQR
    const values = allReadings.map(r => r.turbidityNtu).sort((a, b) => a - b)
    const median = this.calculateMedian(values)
    const q1 = this.calculateMedian(values.slice(0, Math.floor(values.length / 2)))
    const q3 = this.calculateMedian(values.slice(Math.ceil(values.length / 2)))
    const iqr = q3 - q1
    
    const lowerBound = q1 - 1.5 * iqr
    const upperBound = q3 + 1.5 * iqr
    
    if (reading.turbidityNtu < lowerBound || reading.turbidityNtu > upperBound) {
      const outlierScore = Math.abs(reading.turbidityNtu - median) / (iqr || 1)
      
      // Only reject extreme outliers (more than 3 IQR from median)
      if (outlierScore > 3) {
        return {
          isValid: false,
          reason: 'Extreme outlier detected',
          outlierScore
        }
      }
    }

    // Rule 3: Cross-check with nearby sensors (simulated for MVP)
    // In production, this would check readings from geographically close sensors
    const nearbyReadings = allReadings.filter(r => 
      r.id !== reading.id && 
      Math.abs(new Date(r.timestamp).getTime() - new Date(reading.timestamp).getTime()) < 3600000 // within 1 hour
    )

    if (nearbyReadings.length > 0) {
      const nearbyAverage = nearbyReadings.reduce((sum, r) => sum + r.turbidityNtu, 0) / nearbyReadings.length
      const deviation = Math.abs(reading.turbidityNtu - nearbyAverage)
      
      // Reject if deviation is more than 50% of the nearby average
      if (deviation > nearbyAverage * 0.5 && nearbyAverage > 0) {
        return {
          isValid: false,
          reason: 'Inconsistent with nearby sensors'
        }
      }
    }

    return { isValid: true }
  }

  // Aggregator Module - Calculates weekly score
  private calculateScore(validReadings: ReadingData[], totalReadings: number): number {
    if (validReadings.length === 0) return 0

    const averageTurbidity = validReadings.reduce((sum, r) => sum + r.turbidityNtu, 0) / validReadings.length
    
    // Score calculation based on:
    // 1. Data availability (% of valid readings)
    // 2. Water quality (lower turbidity = higher score)
    // 3. Consistency (lower variance = higher score)
    
    const dataAvailabilityScore = (validReadings.length / totalReadings) * 100
    
    // Water quality score (inverted turbidity, normalized to 0-100)
    // Lower turbidity = better quality = higher score
    const maxTurbidity = 100
    const qualityScore = Math.max(0, (maxTurbidity - averageTurbidity) / maxTurbidity * 100)
    
    // Consistency score based on coefficient of variation
    const variance = this.calculateVariance(validReadings.map(r => r.turbidityNtu))
    const stdDev = Math.sqrt(variance)
    const coefficientOfVariation = averageTurbidity > 0 ? stdDev / averageTurbidity : 0
    const consistencyScore = Math.max(0, 100 - coefficientOfVariation * 100)
    
    // Weighted final score
    const finalScore = (
      dataAvailabilityScore * 0.3 +  // 30% weight for data availability
      qualityScore * 0.5 +           // 50% weight for water quality
      consistencyScore * 0.2         // 20% weight for consistency
    )
    
    return Math.min(100, Math.max(0, finalScore))
  }

  // Process batch validation
  async processBatch(agreementId: number): Promise<BatchValidationResult> {
    console.log(`Processing batch validation for agreement ${agreementId}`)
    
    // Check if there are any unvalidated readings
    const readings = await this.collectReadingsForValidation(agreementId)
    
    if (readings.length === 0) {
      // Check if there are any readings at all for this agreement
      const allReadings = await (this.database as any).all(
        'SELECT COUNT(*) as count FROM readings WHERE agreement_id = ?',
        [agreementId]
      )
      
      if (allReadings[0].count === 0) {
        throw new Error('No readings found for this agreement')
      } else {
        // Check if readings are already validated
        const validatedReadings = await (this.database as any).all(
          'SELECT COUNT(*) as count FROM readings WHERE agreement_id = ? AND is_validated = 1',
          [agreementId]
        )
        
        if (validatedReadings[0].count > 0) {
          throw new Error('All readings for this agreement have already been processed')
        } else {
          throw new Error('No readings found for validation in the specified time range')
        }
      }
    }

    // Validate each reading
    const validReadings: ReadingData[] = []
    const invalidReadings: ReadingData[] = []
    let outliersDetected = 0

    for (const reading of readings) {
      const validation = this.validateReading(reading, readings)
      
      if (validation.isValid) {
        validReadings.push(reading)
      } else {
        invalidReadings.push(reading)
        if (validation.reason?.includes('outlier')) {
          outliersDetected++
        }
      }
    }

    // Calculate aggregated metrics
    const averageTurbidity = validReadings.length > 0 
      ? validReadings.reduce((sum, r) => sum + r.turbidityNtu, 0) / validReadings.length 
      : 0

    const medianTurbidity = this.calculateMedian(validReadings.map(r => r.turbidityNtu))
    const score = this.calculateScore(validReadings, readings.length)

    // Create audit hash
    const batchData = {
      agreementId,
      readings: readings.map(r => ({ id: r.id, turbidity: r.turbidityNtu, timestamp: r.timestamp })),
      validCount: validReadings.length,
      invalidCount: invalidReadings.length,
      score,
      averageTurbidity,
      medianTurbidity,
      timestamp: new Date().toISOString()
    }

    const auditHash = this.generateAuditHash(batchData)
    const signature = this.signBatch(auditHash)

    console.log(`Batch processed: ${validReadings.length}/${readings.length} valid readings, score: ${score.toFixed(2)}`)

    return {
      readings,
      validReadings,
      invalidReadings,
      score,
      averageTurbidity,
      medianTurbidity,
      outliersDetected,
      auditHash,
      signature
    }
  }

  // Submit validated batch to smart contract
  async submitValidatedBatch(agreementId: number, batchResult: BatchValidationResult): Promise<string> {
    try {
      // Store batch in database
      const batchId = await this.database.createBatch({
        agreementId,
        auditHash: batchResult.auditHash,
        oracleSignature: batchResult.signature,
        score: batchResult.score,
        readingsCount: batchResult.readings.length,
        averageTurbidity: batchResult.averageTurbidity,
        medianTurbidity: batchResult.medianTurbidity,
        outliersDetected: batchResult.outliersDetected,
        validationStatus: 'validated',
        oracleAddress: this.oracleAddress
      })

      // Log the validation action
      await this.database.createOracleLog({
        batchId,
        action: 'batch_validated',
        details: JSON.stringify({
          validReadings: batchResult.validReadings.length,
          invalidReadings: batchResult.invalidReadings.length,
          score: batchResult.score
        }),
        oracleAddress: this.oracleAddress
      })

      // Get blockchain ID for the agreement
      const agreement = await this.database.getAgreement(agreementId)
      if (!agreement || !agreement.blockchain_id) {
        throw new Error(`Agreement ${agreementId} not found or not deployed to blockchain`)
      }

      // Submit to smart contract
      const txRecord = await this.hederaService.submitValidatedBatch(
        agreement.blockchain_id,
        batchResult.auditHash,
        Math.round(batchResult.score) // Convert to integer for contract
      )

      // Get the real transaction hash from the receipt
      console.log('txRecord from HederaService:', {
        transactionHash: txRecord.transactionHash,
        transactionId: txRecord.transactionId?.toString(),
        hasTransactionHash: !!txRecord.transactionHash,
        hasTransactionId: !!txRecord.transactionId
      })
      
      // Force use of the correct Transaction ID format
      let realTransactionHash: string
      
      // Always construct Transaction ID manually to ensure correct format
      const accountId = txRecord.transactionId?.accountId?.toString()
      const validStart = txRecord.transactionId?.validStart
      if (accountId && validStart) {
        realTransactionHash = `${accountId}@${validStart.seconds}.${validStart.nanos}`
        console.log('Constructed Transaction ID manually:', realTransactionHash)
      } else {
        realTransactionHash = txRecord.transactionId?.toString() || 'unknown'
      }
      
      console.log('Final transaction hash being used:', realTransactionHash)

      // Update batch status and log submission
      await this.database.updateBatchStatus(batchId, 'submitted', new Date())
      await this.database.createOracleLog({
        batchId,
        action: 'batch_submitted',
        details: 'Batch submitted to smart contract',
        oracleAddress: this.oracleAddress,
        transactionHash: realTransactionHash
      })

      // Mark readings as validated
      for (const reading of batchResult.validReadings) {
        await (this.database as any).run(
          'UPDATE readings SET is_validated = 1, batch_id = ? WHERE id = ?',
          [batchId, reading.id]
        )
      }

      console.log(`Batch submitted to contract: ${realTransactionHash}`)
      
      // Ensure the hash is a string before returning
      const finalHash = typeof realTransactionHash === 'string' ? realTransactionHash : String(realTransactionHash)
      
      return finalHash

    } catch (error) {
      console.error('Error submitting validated batch:', error)
      throw error
    }
  }

  // Helper methods
  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0
    
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    
    return sorted.length % 2 !== 0 
      ? sorted[mid] 
      : (sorted[mid - 1] + sorted[mid]) / 2
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDifferences = values.map(val => Math.pow(val - mean, 2))
    
    return squaredDifferences.reduce((sum, val) => sum + val, 0) / values.length
  }

  private generateAuditHash(data: any): string {
    const serialized = JSON.stringify(data, Object.keys(data).sort())
    return crypto.createHash('sha256').update(serialized).digest('hex')
  }

  private signBatch(auditHash: string): string {
    if (!this.oraclePrivateKey) {
      throw new Error('Oracle private key not configured')
    }
    
    // Simple signature using HMAC for MVP
    // In production, would use proper digital signatures
    return crypto.createHmac('sha256', this.oraclePrivateKey).update(auditHash).digest('hex')
  }
}
