const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const dbPath = path.join(__dirname, 'data', 'wata.db')

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message)
    process.exit(1)
  }
  console.log('Connected to SQLite database')
})

async function runMigration() {
  try {
    console.log('Starting Phase 3 migration...')

    // Add new columns to agreements table
    console.log('Adding new columns to agreements table...')
    
    const agreementColumns = [
      'ALTER TABLE agreements ADD COLUMN investor_address TEXT',
      'ALTER TABLE agreements ADD COLUMN governance_mode TEXT DEFAULT "AUTO"',
      'ALTER TABLE agreements ADD COLUMN total_invested REAL DEFAULT 0',
      'ALTER TABLE agreements ADD COLUMN total_paid REAL DEFAULT 0'
    ]

    for (const column of agreementColumns) {
      try {
        await new Promise((resolve, reject) => {
          db.run(column, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
              reject(err)
            } else {
              resolve()
            }
          })
        })
        console.log(`✓ Added column: ${column.split('ADD COLUMN ')[1]?.split(' ')[0]}`)
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log(`- Column already exists: ${column.split('ADD COLUMN ')[1]?.split(' ')[0]}`)
        } else {
          throw error
        }
      }
    }

    // Add new columns to payments table
    console.log('Adding new columns to payments table...')
    
    const paymentColumns = [
      'ALTER TABLE payments ADD COLUMN hcs_transaction_id TEXT',
      'ALTER TABLE payments ADD COLUMN hfs_file_id TEXT',
      'ALTER TABLE payments ADD COLUMN investor_address TEXT'
    ]

    for (const column of paymentColumns) {
      try {
        await new Promise((resolve, reject) => {
          db.run(column, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
              reject(err)
            } else {
              resolve()
            }
          })
        })
        console.log(`✓ Added column: ${column.split('ADD COLUMN ')[1]?.split(' ')[0]}`)
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log(`- Column already exists: ${column.split('ADD COLUMN ')[1]?.split(' ')[0]}`)
        } else {
          throw error
        }
      }
    }

    // Create investments table
    console.log('Creating investments table...')
    
    const createInvestmentsTable = `
      CREATE TABLE IF NOT EXISTS investments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agreement_id INTEGER NOT NULL,
        investor_address TEXT NOT NULL,
        amount REAL NOT NULL,
        transaction_hash TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME,
        FOREIGN KEY (agreement_id) REFERENCES agreements (id)
      )
    `

    await new Promise((resolve, reject) => {
      db.run(createInvestmentsTable, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
    console.log('✓ Created investments table')

    // Create audit_records table
    console.log('Creating audit_records table...')
    
    const createAuditRecordsTable = `
      CREATE TABLE IF NOT EXISTS audit_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agreement_id INTEGER NOT NULL,
        batch_id INTEGER,
        audit_hash TEXT NOT NULL,
        score REAL NOT NULL,
        hcs_transaction_id TEXT,
        hfs_file_id TEXT,
        transaction_hash TEXT,
        producer_address TEXT NOT NULL,
        investor_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (agreement_id) REFERENCES agreements (id),
        FOREIGN KEY (batch_id) REFERENCES batches (id)
      )
    `

    await new Promise((resolve, reject) => {
      db.run(createAuditRecordsTable, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
    console.log('✓ Created audit_records table')

    console.log('Phase 3 migration completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message)
      } else {
        console.log('Database connection closed')
      }
    })
  }
}

runMigration()
