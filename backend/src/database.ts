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

interface UserData {
  email: string
  name: string
  password: string
  role: string
  address?: string
  isActive: boolean
  lastLogin?: string
  createdAt: string
}

export class Database {
  private dbPath: string
  private db: sqlite3.Database | null = null
  private run!: (sql: string, params?: any[]) => Promise<RunResult>
  private get!: (sql: string, params?: any[]) => Promise<DatabaseRow | undefined>
  private all!: (sql: string, params?: any[]) => Promise<DatabaseRow[]>

  constructor() {
    this.dbPath = process.env.DATABASE_PATH || process.env.DB_PATH || './data/wata.db'
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
          resolve({
            lastID: this.lastID,
            changes: this.changes
          })
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
        is_active BOOLEAN DEFAULT 1,
        blockchain_id INTEGER,
        transaction_id TEXT,
        investor_address TEXT,
        governance_mode TEXT DEFAULT "AUTO",
        total_invested REAL DEFAULT 0,
        total_paid REAL DEFAULT 0
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
        hcs_transaction_id TEXT,
        hfs_file_id TEXT,
        investor_address TEXT,
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

    const createInvestmentsTable = `
      CREATE TABLE IF NOT EXISTS investments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agreement_id INTEGER NOT NULL,
        investor_address TEXT NOT NULL,
        amount REAL NOT NULL,
        transaction_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agreement_id) REFERENCES agreements (id)
      )
    `

    const createAuditRecordsTable = `
      CREATE TABLE IF NOT EXISTS audit_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agreement_id INTEGER NOT NULL,
        batch_id INTEGER,
        audit_hash TEXT NOT NULL,
        score REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        transaction_hash TEXT,
        producer_address TEXT,
        investor_address TEXT,
        hcs_transaction_id TEXT,
        hfs_file_id TEXT,
        FOREIGN KEY (agreement_id) REFERENCES agreements (id),
        FOREIGN KEY (batch_id) REFERENCES batches (id)
      )
    `

    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('PRODUCER', 'INVESTOR', 'MANAGER')),
        address TEXT,
        is_active BOOLEAN DEFAULT 1,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `

    await this.run(createAgreementsTable)
    await this.run(createReadingsTable)
    await this.run(createBatchesTable)
    await this.run(createPaymentsTable)
    await this.run(createOracleLogsTable)
    await this.run(createInvestmentsTable)
    await this.run(createAuditRecordsTable)
    await this.run(createUsersTable)
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

    // Use direct SQLite call instead of wrapper
    return new Promise<number>((resolve, reject) => {
      if (!this.db) {
        return reject(new Error('Database is not initialized.'))
      }
      
      this.db.run(
        `INSERT INTO agreements 
         (agreement_hash, producer_name, producer_address, base_value, hectares, 
          location_lat, location_lng, duration_days, blockchain_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [agreementHash, producerName, producerAddress, baseValue, hectares, 
         locationLat, locationLng, durationDays, null],
        function (err) {
          if (err) {
            return reject(err)
          }
          resolve(Number(this.lastID))
        }
      )
    })
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

  async updateAgreementTransactionId(id: number, transactionId: string): Promise<void> {
    await this.run('UPDATE agreements SET transaction_id = ? WHERE id = ?', [transactionId, id])
  }

  async getAllAgreements(): Promise<DatabaseRow[]> {
    return await this.all('SELECT * FROM agreements WHERE is_active = 1 ORDER BY created_at DESC')
  }

  async getAgreementsByProducer(producerAddress: string): Promise<DatabaseRow[]> {
    return await this.all('SELECT * FROM agreements WHERE producer_address = ? AND is_active = 1 ORDER BY created_at DESC', [producerAddress])
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

  // Investment methods
  async createInvestment(investmentData: {
    agreementId: number
    investorAddress: string
    amount: number
    transactionHash?: string
  }): Promise<number> {
    const result = await this.run(
      'INSERT INTO investments (agreement_id, investor_address, amount, transaction_hash) VALUES (?, ?, ?, ?)',
      [investmentData.agreementId, investmentData.investorAddress, investmentData.amount, investmentData.transactionHash]
    )
    return result.lastID
  }

  async getInvestmentsByAgreement(agreementId: number): Promise<DatabaseRow[]> {
    return await this.all(
      'SELECT * FROM investments WHERE agreement_id = ? ORDER BY created_at DESC',
      [agreementId]
    )
  }

  async getInvestmentsByUser(userAddress: string): Promise<DatabaseRow[]> {
    return await this.all(
      'SELECT i.*, a.producer_name, a.base_value, a.hectares FROM investments i JOIN agreements a ON i.agreement_id = a.id WHERE i.investor_address = ? ORDER BY i.created_at DESC',
      [userAddress]
    )
  }

  async updateInvestmentTransactionHash(investmentId: number, transactionHash: string): Promise<void> {
    await this.run(
      'UPDATE investments SET transaction_hash = ? WHERE id = ?',
      [transactionHash, investmentId]
    )
  }

  async deleteInvestment(investmentId: number): Promise<void> {
    await this.run(
      'DELETE FROM investments WHERE id = ?',
      [investmentId]
    )
  }

  async getInvestment(investmentId: number): Promise<DatabaseRow | undefined> {
    return await this.get('SELECT * FROM investments WHERE id = ?', [investmentId])
  }

  // Audit records methods
  async createAuditRecord(auditData: {
    agreementId: number
    batchId?: number
    auditHash: string
    score?: number
    transactionHash?: string
    producerAddress?: string
    investorAddress?: string
    hcsTransactionId?: string
    hfsFileId?: string
  }): Promise<number> {
    const result = await this.run(
      'INSERT INTO audit_records (agreement_id, batch_id, audit_hash, score, transaction_hash, producer_address, investor_address, hcs_transaction_id, hfs_file_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        auditData.agreementId,
        auditData.batchId,
        auditData.auditHash,
        auditData.score,
        auditData.transactionHash,
        auditData.producerAddress,
        auditData.investorAddress,
        auditData.hcsTransactionId,
        auditData.hfsFileId
      ]
    )
    return result.lastID
  }

  async getAuditRecordsByAgreement(agreementId: number): Promise<DatabaseRow[]> {
    return await this.all(
      'SELECT * FROM audit_records WHERE agreement_id = ? ORDER BY timestamp DESC',
      [agreementId]
    )
  }

  async getAuditRecord(auditId: number): Promise<DatabaseRow | undefined> {
    return await this.get('SELECT * FROM audit_records WHERE id = ?', [auditId])
  }

  // User management methods
  async createUser(userData: UserData): Promise<number> {
    const { email, name, password, role, address, isActive } = userData
    
    const result = await this.run(
      `INSERT INTO users (email, name, password, role, address, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, name, password, role, address, isActive]
    )
    return result.lastID
  }

  async getUserByEmail(email: string): Promise<DatabaseRow | undefined> {
    return await this.get('SELECT * FROM users WHERE email = ? AND is_active = 1', [email])
  }

  async getUserById(id: number): Promise<DatabaseRow | undefined> {
    return await this.get('SELECT * FROM users WHERE id = ? AND is_active = 1', [id])
  }

  async updateUserLastLogin(id: number): Promise<void> {
    await this.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [id])
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await this.run('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hashedPassword, id])
  }

  async updateUserAddress(id: number, address: string): Promise<void> {
    await this.run('UPDATE users SET address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [address, id])
  }

  async deactivateUser(id: number): Promise<void> {
    await this.run('UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id])
  }

  async getAllUsers(): Promise<DatabaseRow[]> {
    return await this.all('SELECT id, email, name, role, address, is_active, last_login, created_at FROM users ORDER BY created_at DESC')
  }

  async updateUser(id: number, updateData: { name?: string; address?: string }): Promise<void> {
    const updateFields = []
    const params = []

    if (updateData.name) {
      updateFields.push('name = ?')
      params.push(updateData.name)
    }

    if (updateData.address) {
      updateFields.push('address = ?')
      params.push(updateData.address)
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update')
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    params.push(id)

    await this.run(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    )
  }

  close(): void {
    if (this.db) {
      try {
        this.db.close()
        this.db = null
      } catch (error) {
        console.warn('Database was already closed:', error)
      }
    }
  }
}
