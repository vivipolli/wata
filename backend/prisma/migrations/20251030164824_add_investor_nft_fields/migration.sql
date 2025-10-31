-- AlterTable
ALTER TABLE "payments" ADD COLUMN "investor_nft_metadata_uri" TEXT;
ALTER TABLE "payments" ADD COLUMN "investor_nft_serial" INTEGER;
ALTER TABLE "payments" ADD COLUMN "investor_nft_token_id" TEXT;
ALTER TABLE "payments" ADD COLUMN "investor_nft_transaction_id" TEXT;
