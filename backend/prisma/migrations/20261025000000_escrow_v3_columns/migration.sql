-- Escrow v3 columns. payments.amount becomes TEXT: existing integer amounts are copied with TEXT
-- affinity, so 5000 becomes '5000' exactly; the table rebuild recreates the existing indexes.

-- AlterTable
ALTER TABLE "agreements" ADD COLUMN "period_amount" TEXT;
ALTER TABLE "agreements" ADD COLUMN "score_threshold" INTEGER;

-- AlterTable
ALTER TABLE "batches" ADD COLUMN "period_id" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_payments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agreement_id" INTEGER NOT NULL,
    "batch_id" INTEGER,
    "amount" TEXT NOT NULL,
    "transaction_hash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" DATETIME,
    "audit_hash" TEXT,
    "score" REAL,
    "hcs_transaction_id" TEXT,
    "hfs_file_id" TEXT,
    "investor_address" TEXT,
    "period_id" INTEGER,
    "transaction_id" TEXT,
    "onchain_state" TEXT,
    CONSTRAINT "payments_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "payments_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_payments" ("agreement_id", "amount", "audit_hash", "batch_id", "created_at", "hcs_transaction_id", "hfs_file_id", "id", "investor_address", "processed_at", "score", "status", "transaction_hash") SELECT "agreement_id", "amount", "audit_hash", "batch_id", "created_at", "hcs_transaction_id", "hfs_file_id", "id", "investor_address", "processed_at", "score", "status", "transaction_hash" FROM "payments";
DROP TABLE "payments";
ALTER TABLE "new_payments" RENAME TO "payments";
CREATE INDEX "payments_agreement_id_created_at_idx" ON "payments"("agreement_id", "created_at");
CREATE INDEX "payments_created_at_idx" ON "payments"("created_at");
CREATE UNIQUE INDEX "payments_agreement_id_audit_hash_key" ON "payments"("agreement_id", "audit_hash");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

