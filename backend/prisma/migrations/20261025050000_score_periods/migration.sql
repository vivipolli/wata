-- Measurement-based score periods on batches; average_turbidity becomes optional (legacy flow only).

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_batches" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agreement_id" INTEGER NOT NULL,
    "audit_hash" TEXT NOT NULL,
    "oracle_signature" TEXT,
    "score" REAL NOT NULL,
    "readings_count" INTEGER NOT NULL,
    "average_turbidity" REAL,
    "median_turbidity" REAL,
    "outliers_detected" INTEGER DEFAULT 0,
    "validation_status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" DATETIME,
    "oracle_address" TEXT,
    "hcs_transaction_id" TEXT,
    "hfs_file_id" TEXT,
    "period_id" INTEGER,
    "period_start" DATETIME,
    "period_end" DATETIME,
    "score_version" INTEGER,
    "audit_document" TEXT,
    CONSTRAINT "batches_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_batches" ("agreement_id", "audit_hash", "average_turbidity", "created_at", "hcs_transaction_id", "hfs_file_id", "id", "median_turbidity", "oracle_address", "oracle_signature", "outliers_detected", "period_id", "readings_count", "score", "submitted_at", "validation_status") SELECT "agreement_id", "audit_hash", "average_turbidity", "created_at", "hcs_transaction_id", "hfs_file_id", "id", "median_turbidity", "oracle_address", "oracle_signature", "outliers_detected", "period_id", "readings_count", "score", "submitted_at", "validation_status" FROM "batches";
DROP TABLE "batches";
ALTER TABLE "new_batches" RENAME TO "batches";
CREATE UNIQUE INDEX "batches_audit_hash_key" ON "batches"("audit_hash");
CREATE INDEX "batches_agreement_id_created_at_idx" ON "batches"("agreement_id", "created_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

