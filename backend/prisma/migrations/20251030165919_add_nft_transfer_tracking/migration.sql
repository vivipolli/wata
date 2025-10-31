-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_payments" (
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
    "nft_token_id" TEXT,
    "nft_serial" INTEGER,
    "nft_transaction_id" TEXT,
    "nft_metadata_uri" TEXT,
    "investor_nft_token_id" TEXT,
    "investor_nft_serial" INTEGER,
    "investor_nft_transaction_id" TEXT,
    "investor_nft_metadata_uri" TEXT,
    "producer_nft_transferred" BOOLEAN NOT NULL DEFAULT false,
    "producer_nft_transfer_tx" TEXT,
    "investor_nft_transferred" BOOLEAN NOT NULL DEFAULT false,
    "investor_nft_transfer_tx" TEXT,
    CONSTRAINT "payments_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "payments_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_payments" ("agreement_id", "amount", "audit_hash", "batch_id", "created_at", "hcs_transaction_id", "hfs_file_id", "id", "investor_address", "investor_nft_metadata_uri", "investor_nft_serial", "investor_nft_token_id", "investor_nft_transaction_id", "nft_metadata_uri", "nft_serial", "nft_token_id", "nft_transaction_id", "processed_at", "score", "status", "transaction_hash") SELECT "agreement_id", "amount", "audit_hash", "batch_id", "created_at", "hcs_transaction_id", "hfs_file_id", "id", "investor_address", "investor_nft_metadata_uri", "investor_nft_serial", "investor_nft_token_id", "investor_nft_transaction_id", "nft_metadata_uri", "nft_serial", "nft_token_id", "nft_transaction_id", "processed_at", "score", "status", "transaction_hash" FROM "payments";
DROP TABLE "payments";
ALTER TABLE "new_payments" RENAME TO "payments";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
