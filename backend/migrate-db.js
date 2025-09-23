const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'wata.db');

console.log('🔄 Migrating database schema...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Migration queries
const migrations = [
  // Add new columns to payments table
  `ALTER TABLE payments ADD COLUMN batch_id INTEGER`,
  `ALTER TABLE payments ADD COLUMN audit_hash TEXT`,
  `ALTER TABLE payments ADD COLUMN score REAL`,
  
  // Add new columns to readings table
  `ALTER TABLE readings ADD COLUMN batch_id INTEGER`,
  `ALTER TABLE readings ADD COLUMN is_validated BOOLEAN DEFAULT 0`,
  
  // Create batches table
  `CREATE TABLE IF NOT EXISTS batches (
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
  )`,
  
  // Create oracle_logs table
  `CREATE TABLE IF NOT EXISTS oracle_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    oracle_address TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    transaction_hash TEXT,
    FOREIGN KEY (batch_id) REFERENCES batches (id)
  )`
];

// Execute migrations
let completed = 0;
migrations.forEach((migration, index) => {
  db.run(migration, (err) => {
    if (err) {
      // Ignore "duplicate column name" errors for ALTER TABLE
      if (err.message.includes('duplicate column name') || err.message.includes('already exists')) {
        console.log(`⏭️  Migration ${index + 1}: Skipped (already exists)`);
      } else {
        console.error(`❌ Migration ${index + 1} failed:`, err.message);
      }
    } else {
      console.log(`✅ Migration ${index + 1}: Completed`);
    }
    
    completed++;
    if (completed === migrations.length) {
      console.log('\n🎉 Database migration completed!');
      db.close();
    }
  });
});
