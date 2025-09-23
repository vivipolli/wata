import sqlite3 from 'sqlite3'
import path from 'path'
import fs from 'fs'
import type { Agreement, Reading, Payment } from './types/index.js'

interface DatabaseRow {
  [key: string]: any
}

interface RunResult {
  lastID: number
  changes: number
}

interface AgreementData {
  agreementHash: string
  producerName: string
  producerAddress: string
  baseValue: number
  hectares: number
  locationLat?: number
  locationLng?: number
  durationDays?: number
}

interface ReadingData {
  agreementId: number
  turbidityNtu: number
  locationLat?: number
  locationLng?: number
  isSimulated: boolean
  auditHash?: string
}

interface PaymentData {
  agreementId: number
  batchId?: number
  amount: number
  transactionHash?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  auditHash?: string
  score?: number
}

interface BatchData {
  agreementId: number
  auditHash: string
  oracleSignature?: string
  score: number
  readingsCount: number
  averageTurbidity: number
  medianTurbidity?: number
  outliersDetected?: number
  validationStatus?: 'pending' | 'validated' | 'rejected'
  oracleAddress?: string
}

interface OracleLogData {
  batchId: number
  action: string
  details?: string
  oracleAddress?: string
  transactionHash?: string
}

export class Database {
  private dbPath: string
  private db: sqlite3.Database | null = null
  private run!: (sql: string, params?: any[]) => Promise<RunResult>
  private get!: (sql: string, params?: any[]) => Promise<DatabaseRow | undefined>
  private all!: (sql: string, params?: any[]) => Promise<DatabaseRow[]>

  constructor() {
    this.dbPath = process.env.DB_PATH || './data/wata.db'
  }

  async initialize(): Promise<void> {
    // Ensure data directory exists
    const dataDir = path.dirname(this.dbPath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    this.db = new sqlite3.Database(this.dbPath)
    
    // Manual Promise wrappers for database methods
    this.run = (sql: string, params: any[] = []) => {
      return new Promise<RunResult>((resolve, reject) => {
        if (!this.db) {
          return reject(new Error('Database is not initialized.'))
        }
        this.db.run(sql, params, function (err) {
          if (err) {
            return reject(err)
          }
          resolve(this)
        })
      })
    }
    
    this.get = (sql: string, params: any[] = []) => {
      return new Promise<DatabaseRow | undefined>((resolve, reject) => {
        if (!this.db) {
          return reject(new Error('Database is not initialized.'))
        }
        this.db.get(sql, params, (err, row) => {
          if (err) {
            return reject(err)
          }
          resolve(row)
        })
      })
    }
    
    this.all = (sql: string, params: any[] = []) => {
      return new Promise<DatabaseRow[]>((resolve, reject) => {
        if (!this.db) {
          return reject(new Error('Database is not initialized.'))
        }
        this.db.all(sql, params, (err, rows) => {
          if (err) {
            return reject(err)
          }
          resolve(rows)
        })
      })
    }

    await this.createTables()
    console.log('Database initialized successfully')
  }

  private async createTables(): Promise<void> {
    const createAgreementsTable = `
      CREATE TABLE IF NOT EXISTS agreements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agreement_hash TEXT UNIQUE NOT NULL,
        producer_name TEXT NOT NULL,
        producer_address TEXT NOT NULL,
        base_value INTEGER NOT NULL,
        hectares INTEGER NOT NULL,
        location_lat REAL,
        location_lng REAL,
        duration_days INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1
      )
    `

    const createReadingsTable = `
      CREATE TABLE IF NOT EXISTS readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agreement_id INTEGER NOT NULL,
        turbidity_ntu REAL NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        location_lat REAL,
        location_lng REAL,
        is_simulated BOOLEAN DEFAULT 0,
        audit_hash TEXT,
        batch_id INTEGER,
        is_validated BOOLEAN DEFAULT 0,
        FOREIGN KEY (agreement_id) REFERENCES agreements (id),
        FOREIGN KEY (batch_id) REFERENCES batches (id)
      )
    `

    const createBatchesTable = `
      CREATE TABLE IF NOT EXISTS batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agreement_id INTEGER NOT NULL,
        audit_hash TEXT UNIQUE NOT NULL,
        oracle_signature TEXT,
        score REAL NOT NULL,
        readings_count INTEGER NOT NULL,
        average_turbidity REAL NOT NULL,
        median_turbidity REAL,
        outliers_detected INTEGER DEFAULT 0,
        validation_status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        submitted_at DATETIME,
        oracle_address TEXT,
        FOREIGN KEY (agreement_id) REFERENCES agreements (id)
      )
    `

    const createPaymentsTable = `
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agreement_id INTEGER NOT NULL,
        batch_id INTEGER,
        amount INTEGER NOT NULL,
        transaction_hash TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        audit_hash TEXT,
        score REAL,
        FOREIGN KEY (agreement_id) REFERENCES agreements (id),
        FOREIGN KEY (batch_id) REFERENCES batches (id)
      )
    `

    const createOracleLogsTable = `
      CREATE TABLE IF NOT EXISTS oracle_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        oracle_address TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        transaction_hash TEXT,
        FOREIGN KEY (batch_id) REFERENCES batches (id)
      )
    `

    await this.run(createAgreementsTable)
    await this.run(createReadingsTable)
    await this.run(createBatchesTable)
    await this.run(createPaymentsTable)
    await this.run(createOracleLogsTable)
  }

  async createAgreement(agreementData: AgreementData): Promise<number> {
    const {
      agreementHash,
      producerName,
      producerAddress,
      baseValue,
      hectares,
      locationLat,
      locationLng,
      durationDays
    } = agreementData

    const result = await this.run(
      `INSERT INTO agreements 
       (agreement_hash, producer_name, producer_address, base_value, hectares, 
        location_lat, location_lng, duration_days, blockchain_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [agreementHash, producerName, producerAddress, baseValue, hectares, 
       locationLat, locationLng, durationDays, null]
    )

    const id = result?.lastID
    if (id === undefined) {
      throw new Error('Failed to create agreement - no ID returned')
    }
    return Number(id)
  }

  async getAgreement(id: number): Promise<DatabaseRow | undefined> {
    return await this.get('SELECT * FROM agreements WHERE id = ?', [id])
  }

  async getAgreementByHash(agreementHash: string): Promise<DatabaseRow | undefined> {
    return await this.get('SELECT * FROM agreements WHERE agreement_hash = ?', [agreementHash])
  }

  async updateAgreementBlockchainId(id: number, blockchainId: number): Promise<void> {
    await this.run('UPDATE agreements SET blockchain_id = ? WHERE id = ?', [blockchainId, id])
  }

  async getAllAgreements(): Promise<DatabaseRow[]> {
    return await this.all('SELECT * FROM agreements WHERE is_active = 1 ORDER BY created_at DESC')
  }

  async createReading(readingData: ReadingData): Promise<number> {
    const {
      agreementId,
      turbidityNtu,
      locationLat,
      locationLng,
      isSimulated,
      auditHash
    } = readingData

    const result = await this.run(
      `INSERT INTO readings 
       (agreement_id, turbidity_ntu, location_lat, location_lng, is_simulated, audit_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [agreementId, turbidityNtu, locationLat, locationLng, isSimulated, auditHash]
    )

    return result?.lastID || 0
  }

  async getReadingsByAgreement(agreementId: number, limit: number = 50): Promise<DatabaseRow[]> {
    return await this.all(
      `SELECT * FROM readings 
       WHERE agreement_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`,
      [agreementId, limit]
    )
  }

  async getRecentReadings(limit: number = 100): Promise<DatabaseRow[]> {
    return await this.all(
      `SELECT r.*, a.producer_name, a.producer_address 
       FROM readings r
       JOIN agreements a ON r.agreement_id = a.id
       ORDER BY r.timestamp DESC 
       LIMIT ?`,
      [limit]
    )
  }

  async createPayment(paymentData: PaymentData): Promise<number> {
    const { agreementId, batchId, amount, transactionHash, status, auditHash, score } = paymentData

    const result = await this.run(
      `INSERT INTO payments (agreement_id, batch_id, amount, transaction_hash, status, audit_hash, score)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [agreementId, batchId, amount, transactionHash, status, auditHash, score]
    )

    return result?.lastID || 0
  }

  async updatePaymentStatus(paymentId: number, status: string, transactionHash?: string): Promise<void> {
    const updateFields: string[] = ['status = ?']
    const params: any[] = [status]

    if (transactionHash) {
      updateFields.push('transaction_hash = ?')
      params.push(transactionHash)
    }

    if (status === 'completed') {
      updateFields.push('processed_at = CURRENT_TIMESTAMP')
    }

    params.push(paymentId)

    await this.run(
      `UPDATE payments SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    )
  }

  async getPaymentsByAgreement(agreementId: number): Promise<DatabaseRow[]> {
    return await this.all(
      'SELECT * FROM payments WHERE agreement_id = ? ORDER BY created_at DESC',
      [agreementId]
    )
  }

  async getPendingPayments(): Promise<DatabaseRow[]> {
    return await this.all(
      'SELECT * FROM payments WHERE status = "pending" ORDER BY created_at ASC'
    )
  }

  async getPayment(paymentId: number): Promise<DatabaseRow | undefined> {
    return await this.get('SELECT * FROM payments WHERE id = ?', [paymentId])
  }

  // Batch methods
  async createBatch(batchData: BatchData): Promise<number> {
    const {
      agreementId,
      auditHash,
      oracleSignature,
      score,
      readingsCount,
      averageTurbidity,
      medianTurbidity,
      outliersDetected,
      validationStatus,
      oracleAddress
    } = batchData

    const result = await this.run(
      `INSERT INTO batches 
       (agreement_id, audit_hash, oracle_signature, score, readings_count, 
        average_turbidity, median_turbidity, outliers_detected, validation_status, oracle_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [agreementId, auditHash, oracleSignature, score, readingsCount, 
       averageTurbidity, medianTurbidity, outliersDetected, validationStatus, oracleAddress]
    )

    return result?.lastID || 0
  }

  async getBatch(batchId: number): Promise<DatabaseRow | undefined> {
    return await this.get('SELECT * FROM batches WHERE id = ?', [batchId])
  }

  async getBatchByAuditHash(auditHash: string): Promise<DatabaseRow | undefined> {
    return await this.get('SELECT * FROM batches WHERE audit_hash = ?', [auditHash])
  }

  async getBatchesByAgreement(agreementId: number, limit: number = 50): Promise<DatabaseRow[]> {
    return await this.all(
      `SELECT * FROM batches 
       WHERE agreement_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [agreementId, limit]
    )
  }

  async updateBatchStatus(batchId: number, status: string, submittedAt?: Date): Promise<void> {
    const updateFields: string[] = ['validation_status = ?']
    const params: any[] = [status]

    if (submittedAt) {
      updateFields.push('submitted_at = ?')
      params.push(submittedAt.toISOString())
    }

    params.push(batchId)

    await this.run(
      `UPDATE batches SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    )
  }

  async getPendingBatches(): Promise<DatabaseRow[]> {
    return await this.all(
      'SELECT * FROM batches WHERE validation_status = "pending" ORDER BY created_at ASC'
    )
  }

  // Oracle log methods
  async createOracleLog(logData: OracleLogData): Promise<number> {
    const { batchId, action, details, oracleAddress, transactionHash } = logData

    const result = await this.run(
      `INSERT INTO oracle_logs (batch_id, action, details, oracle_address, transaction_hash)
       VALUES (?, ?, ?, ?, ?)`,
      [batchId, action, details, oracleAddress, transactionHash]
    )

    return result?.lastID || 0
  }

  async getOracleLogsByBatch(batchId: number): Promise<DatabaseRow[]> {
    return await this.all(
      'SELECT * FROM oracle_logs WHERE batch_id = ? ORDER BY timestamp DESC',
      [batchId]
    )
  }

  async getRecentOracleLogs(limit: number = 100): Promise<DatabaseRow[]> {
    return await this.all(
      `SELECT ol.*, b.audit_hash, b.agreement_id 
       FROM oracle_logs ol
       JOIN batches b ON ol.batch_id = b.id
       ORDER BY ol.timestamp DESC 
       LIMIT ?`,
      [limit]
    )
  }

  // Weekly aggregation methods
  async getWeeklyReadings(agreementId: number, weekStart: Date, weekEnd: Date): Promise<DatabaseRow[]> {
    return await this.all(
      `SELECT * FROM readings 
       WHERE agreement_id = ? 
       AND timestamp BETWEEN ? AND ?
       ORDER BY timestamp ASC`,
      [agreementId, weekStart.toISOString(), weekEnd.toISOString()]
    )
  }

  async getAgreementsWithRecentActivity(days: number = 7): Promise<DatabaseRow[]> {
    return await this.all(
      `SELECT DISTINCT a.* 
       FROM agreements a
       JOIN readings r ON a.id = r.agreement_id
       WHERE r.timestamp >= datetime('now', '-${days} days')
       AND a.is_active = 1
       ORDER BY a.created_at DESC`
    )
  }

  close(): void {
    if (this.db) {
      this.db.close()
    }
  }
}
