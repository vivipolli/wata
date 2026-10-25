-- NFT certificates of released payments: one per payment, minted by a scheduled TokenMint.

-- CreateTable
CREATE TABLE "certificates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "payment_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'prepared',
    "metadata_json" TEXT NOT NULL,
    "metadata_sha256" TEXT NOT NULL,
    "metadata_cid" TEXT,
    "metadata_uri" TEXT,
    "token_id" TEXT,
    "schedule_id" TEXT,
    "scheduled_transaction_id" TEXT,
    "serial_number" INTEGER,
    "mint_transaction_hash" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "minted_at" DATETIME,
    CONSTRAINT "certificates_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "certificates_payment_id_key" ON "certificates"("payment_id");

