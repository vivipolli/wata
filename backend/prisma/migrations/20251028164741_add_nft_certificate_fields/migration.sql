-- AlterTable
ALTER TABLE "payments" ADD COLUMN "nft_metadata" TEXT;
ALTER TABLE "payments" ADD COLUMN "nft_serial" INTEGER;
ALTER TABLE "payments" ADD COLUMN "nft_token_id" TEXT;
ALTER TABLE "payments" ADD COLUMN "nft_transaction_id" TEXT;
