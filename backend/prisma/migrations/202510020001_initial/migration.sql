-- CreateTable
CREATE TABLE "agreements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agreement_hash" TEXT NOT NULL,
    "producer_name" TEXT NOT NULL,
    "producer_address" TEXT NOT NULL,
    "base_value" INTEGER NOT NULL,
    "hectares" INTEGER NOT NULL,
    "location_lat" REAL,
    "location_lng" REAL,
    "duration_days" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "blockchain_id" INTEGER,
    "transaction_id" TEXT,
    "investor_address" TEXT,
    "governance_mode" TEXT NOT NULL DEFAULT 'AUTO',
    "total_invested" REAL NOT NULL DEFAULT 0,
    "total_paid" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "readings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agreement_id" INTEGER NOT NULL,
    "turbidity_ntu" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location_lat" REAL,
    "location_lng" REAL,
    "is_simulated" BOOLEAN NOT NULL DEFAULT false,
    "audit_hash" TEXT,
    "batch_id" INTEGER,
    "is_validated" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "readings_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "readings_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "batches" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agreement_id" INTEGER NOT NULL,
    "audit_hash" TEXT NOT NULL,
    "oracle_signature" TEXT,
    "score" REAL NOT NULL,
    "readings_count" INTEGER NOT NULL,
    "average_turbidity" REAL NOT NULL,
    "median_turbidity" REAL,
    "outliers_detected" INTEGER DEFAULT 0,
    "validation_status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" DATETIME,
    "oracle_address" TEXT,
    "hcs_transaction_id" TEXT,
    "hfs_file_id" TEXT,
    CONSTRAINT "batches_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agreement_id" INTEGER NOT NULL,
    "batch_id" INTEGER,
    "amount" INTEGER NOT NULL,
    "transaction_hash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" DATETIME,
    "audit_hash" TEXT,
    "score" REAL,
    "hcs_transaction_id" TEXT,
    "hfs_file_id" TEXT,
    "investor_address" TEXT,
    CONSTRAINT "payments_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "payments_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "oracle_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "batch_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "oracle_address" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_hash" TEXT,
    CONSTRAINT "oracle_logs_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "investments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agreement_id" INTEGER NOT NULL,
    "investor_address" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "transaction_hash" TEXT,
    "status" TEXT DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" DATETIME,
    CONSTRAINT "investments_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agreement_id" INTEGER NOT NULL,
    "batch_id" INTEGER,
    "audit_hash" TEXT NOT NULL,
    "score" REAL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_hash" TEXT,
    "producer_address" TEXT,
    "investor_address" TEXT,
    "hcs_transaction_id" TEXT,
    "hfs_file_id" TEXT,
    CONSTRAINT "audit_records_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "audit_records_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "agreements_agreement_hash_key" ON "agreements"("agreement_hash");

-- CreateIndex
CREATE UNIQUE INDEX "batches_audit_hash_key" ON "batches"("audit_hash");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

