-- Investments come from escrow v3 Deposited events: amount becomes TEXT (exact uint256 in tinybar)
-- and each deposit transaction is recorded once. Legacy rows keep their old value as text; they were
-- written by the v2 flow in HBAR, not tinybar, and must not be read as escrow deposits.

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_investments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agreement_id" INTEGER NOT NULL,
    "investor_address" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "transaction_id" TEXT,
    "transaction_hash" TEXT,
    "status" TEXT DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" DATETIME,
    CONSTRAINT "investments_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_investments" ("agreement_id", "amount", "created_at", "id", "investor_address", "processed_at", "status", "transaction_hash") SELECT "agreement_id", "amount", "created_at", "id", "investor_address", "processed_at", "status", "transaction_hash" FROM "investments";
DROP TABLE "investments";
ALTER TABLE "new_investments" RENAME TO "investments";
CREATE UNIQUE INDEX "investments_transaction_id_key" ON "investments"("transaction_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

