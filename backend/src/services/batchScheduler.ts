import { PrismaDatabase } from './orm/prismaDatabase'
import { OracleService } from './oracle'

/**
 * Batch Scheduler Service
 * Business Rule: Leituras válidas devem ser agregadas em batches (ex.: a cada 6h)
 */
export class BatchSchedulerService {
  private database: PrismaDatabase
  private oracleService: OracleService
  private intervalId: NodeJS.Timeout | null = null
  private isRunning: boolean = false

  constructor(database: PrismaDatabase, oracleService: OracleService) {
    this.database = database
    this.oracleService = oracleService
  }

  /**
   * Start the batch scheduler
   * Processes batches every 6 hours for all active agreements
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Batch scheduler is already running')
      return
    }

    console.log('🔄 Starting batch scheduler - processing batches every 6 hours')
    this.isRunning = true

    // Process batches immediately on start
    await this.processAllBatches()

    // Schedule batch processing every 6 hours (6 * 60 * 60 * 1000 ms)
    this.intervalId = setInterval(async () => {
      try {
        await this.processAllBatches()
      } catch (error) {
        console.error('Error in scheduled batch processing:', error)
      }
    }, 6 * 60 * 60 * 1000)
  }

  /**
   * Stop the batch scheduler
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('Batch scheduler stopped')
  }

  /**
   * Process batches for all active agreements
   */
  private async processAllBatches(): Promise<void> {
    console.log('🔄 Processing scheduled batches for all active agreements')
    
    try {
      // Get all active agreements
      const agreements = await this.database.getAgreementsWithRecentActivity(7)
      
      if (agreements.length === 0) {
        console.log('No active agreements found for batch processing')
        return
      }

      console.log(`Processing batches for ${agreements.length} active agreements`)

      // Process each agreement
      for (const agreement of agreements) {
        try {
          // Check if there are unprocessed readings for this agreement
          const unprocessedReadings = await this.getUnprocessedReadings(agreement.id)
          
          if (unprocessedReadings.length === 0) {
            console.log(`No unprocessed readings for agreement ${agreement.id}`)
            continue
          }

          console.log(`Processing ${unprocessedReadings.length} unprocessed readings for agreement ${agreement.id}`)
          
          // Process batch for this agreement
          const batchResult = await this.oracleService.processBatch(agreement.id)
          
          if (batchResult.validReadings.length > 0) {
            // Submit to smart contract if there are valid readings
            const result = await this.oracleService.submitValidatedBatch(agreement.id, batchResult)
            if (result === 'skipped') {
              console.log(`Batch processed but skipped submission for agreement ${agreement.id}: score ${batchResult.score.toFixed(3)}`)
            } else {
              console.log(`Batch processed and submitted for agreement ${agreement.id}: score ${batchResult.score.toFixed(3)}`)
            }
          } else {
            console.log(`No valid readings to process for agreement ${agreement.id}`)
          }
        } catch (error) {
          console.error(`Error processing batch for agreement ${agreement.id}:`, error)
        }
      }
    } catch (error) {
      console.error('Error in batch processing:', error)
    }
  }

  /**
   * Get unprocessed readings for an agreement
   * Unprocessed readings are those that haven't been included in any batch yet
   */
  private async getUnprocessedReadings(agreementId: number): Promise<any[]> {
    const allReadings = await this.database.getReadingsByAgreement(agreementId, 1000)
    
    // Filter unprocessed readings (batch_id IS NULL AND is_validated = false)
    return allReadings.filter(reading => 
      reading.batch_id === null && reading.is_validated === false
    )
  }

  /**
   * Manually trigger batch processing for a specific agreement
   * Useful for testing or immediate processing
   */
  async processBatchForAgreement(agreementId: number): Promise<void> {
    console.log(`🔄 Manually processing batch for agreement ${agreementId}`)
    
    try {
      const unprocessedReadings = await this.getUnprocessedReadings(agreementId)
      
      if (unprocessedReadings.length === 0) {
        console.log(`No unprocessed readings for agreement ${agreementId}`)
        return
      }

      console.log(`Processing ${unprocessedReadings.length} unprocessed readings for agreement ${agreementId}`)
      
      const batchResult = await this.oracleService.processBatch(agreementId)
      
      if (batchResult.validReadings.length > 0) {
        await this.oracleService.submitValidatedBatch(agreementId, batchResult)
        console.log(`Batch processed and submitted for agreement ${agreementId}: score ${batchResult.score.toFixed(3)}`)
      } else {
        console.log(`No valid readings to process for agreement ${agreementId}`)
      }
    } catch (error) {
      console.error(`Error manually processing batch for agreement ${agreementId}:`, error)
      throw error
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): { isRunning: boolean; nextRun?: Date } {
    return {
      isRunning: this.isRunning,
      nextRun: this.isRunning ? new Date(Date.now() + 6 * 60 * 60 * 1000) : undefined
    }
  }
}
