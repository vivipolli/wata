import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
export class Database {
    dbPath;
    db = null;
    run;
    get;
    all;
    constructor() {
        this.dbPath = process.env.DB_PATH || './data/wata.db';
    }
    async initialize() {
        // Ensure data directory exists
        const dataDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        this.db = new sqlite3.Database(this.dbPath);
        // Promisify database methods
        this.run = promisify(this.db.run.bind(this.db));
        this.get = promisify(this.db.get.bind(this.db));
        this.all = promisify(this.db.all.bind(this.db));
        await this.createTables();
        console.log('Database initialized successfully');
    }
    async createTables() {
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
    `;
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
    `;
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
    `;
        await this.run(createAgreementsTable);
        await this.run(createReadingsTable);
        await this.run(createPaymentsTable);
    }
    async createAgreement(agreementData) {
        const { agreementHash, producerName, producerAddress, baseValue, hectares, locationLat, locationLng, durationDays } = agreementData;
        const result = await this.run(`INSERT INTO agreements 
       (agreement_hash, producer_name, producer_address, base_value, hectares, 
        location_lat, location_lng, duration_days)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [agreementHash, producerName, producerAddress, baseValue, hectares,
            locationLat, locationLng, durationDays]);
        return result.lastID;
    }
    async getAgreement(id) {
        return await this.get('SELECT * FROM agreements WHERE id = ?', [id]);
    }
    async getAgreementByHash(agreementHash) {
        return await this.get('SELECT * FROM agreements WHERE agreement_hash = ?', [agreementHash]);
    }
    async getAllAgreements() {
        return await this.all('SELECT * FROM agreements WHERE is_active = 1 ORDER BY created_at DESC');
    }
    async createReading(readingData) {
        const { agreementId, turbidityNtu, locationLat, locationLng, isSimulated, auditHash } = readingData;
        const result = await this.run(`INSERT INTO readings 
       (agreement_id, turbidity_ntu, location_lat, location_lng, is_simulated, audit_hash)
       VALUES (?, ?, ?, ?, ?, ?)`, [agreementId, turbidityNtu, locationLat, locationLng, isSimulated, auditHash]);
        return result.lastID;
    }
    async getReadingsByAgreement(agreementId, limit = 50) {
        return await this.all(`SELECT * FROM readings 
       WHERE agreement_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`, [agreementId, limit]);
    }
    async getRecentReadings(limit = 100) {
        return await this.all(`SELECT r.*, a.producer_name, a.producer_address 
       FROM readings r
       JOIN agreements a ON r.agreement_id = a.id
       ORDER BY r.timestamp DESC 
       LIMIT ?`, [limit]);
    }
    async createPayment(paymentData) {
        const { agreementId, amount, transactionHash, status } = paymentData;
        const result = await this.run(`INSERT INTO payments (agreement_id, amount, transaction_hash, status)
       VALUES (?, ?, ?, ?)`, [agreementId, amount, transactionHash, status]);
        return result.lastID;
    }
    async updatePaymentStatus(paymentId, status, transactionHash) {
        const updateFields = ['status = ?'];
        const params = [status];
        if (transactionHash) {
            updateFields.push('transaction_hash = ?');
            params.push(transactionHash);
        }
        if (status === 'completed') {
            updateFields.push('processed_at = CURRENT_TIMESTAMP');
        }
        params.push(paymentId);
        await this.run(`UPDATE payments SET ${updateFields.join(', ')} WHERE id = ?`, params);
    }
    async getPaymentsByAgreement(agreementId) {
        return await this.all('SELECT * FROM payments WHERE agreement_id = ? ORDER BY created_at DESC', [agreementId]);
    }
    async getPendingPayments() {
        return await this.all('SELECT * FROM payments WHERE status = "pending" ORDER BY created_at ASC');
    }
    async getPayment(paymentId) {
        return await this.get('SELECT * FROM payments WHERE id = ?', [paymentId]);
    }
    close() {
        if (this.db) {
            this.db.close();
        }
    }
}
//# sourceMappingURL=database.js.map