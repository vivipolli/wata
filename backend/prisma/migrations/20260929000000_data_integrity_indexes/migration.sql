-- Data integrity indexes.
-- The unique index fails on databases that already hold duplicate (agreement_id, audit_hash)
-- payments; those rows must be reviewed by hand, never deleted automatically.

-- CreateIndex
CREATE INDEX "readings_agreement_id_timestamp_idx" ON "readings"("agreement_id", "timestamp");

-- CreateIndex
CREATE INDEX "readings_timestamp_idx" ON "readings"("timestamp");

-- CreateIndex
CREATE INDEX "batches_agreement_id_created_at_idx" ON "batches"("agreement_id", "created_at");

-- CreateIndex
CREATE INDEX "payments_agreement_id_created_at_idx" ON "payments"("agreement_id", "created_at");

-- CreateIndex
CREATE INDEX "payments_created_at_idx" ON "payments"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "payments_agreement_id_audit_hash_key" ON "payments"("agreement_id", "audit_hash");

