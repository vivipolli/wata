-- One local agreement per on-chain escrow agreement. Fails on databases where two agreements
-- already share a blockchain_id; those rows must be reviewed by hand, never deleted automatically.

-- CreateIndex
CREATE UNIQUE INDEX "agreements_blockchain_id_key" ON "agreements"("blockchain_id");

