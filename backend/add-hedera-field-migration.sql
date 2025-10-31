-- Migration: Add hedera_account_id to agreements table
ALTER TABLE agreements ADD COLUMN hedera_account_id TEXT;

-- Update existing agreement with the Hedera account
UPDATE agreements SET hedera_account_id = '0.0.5904577' WHERE id = 1;
