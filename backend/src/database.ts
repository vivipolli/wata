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
  amount: number
  transactionHash?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
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
        FOREIGN KEY (agreement_id) REFERENCES agreements (id)
      )
    `

    const createPaymentsTable = `
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agreement_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        transaction_hash TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        FOREIGN KEY (agreement_id) REFERENCES agreements (id)
      )
    `

    await this.run(createAgreementsTable)
    await this.run(createReadingsTable)
    await this.run(createPaymentsTable)
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
        location_lat, location_lng, duration_days)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [agreementHash, producerName, producerAddress, baseValue, hectares, 
       locationLat, locationLng, durationDays]
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
    const { agreementId, amount, transactionHash, status } = paymentData

    const result = await this.run(
      `INSERT INTO payments (agreement_id, amount, transaction_hash, status)
       VALUES (?, ?, ?, ?)`,
      [agreementId, amount, transactionHash, status]
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

  close(): void {
    if (this.db) {
      this.db.close()
    }
  }
}
