-- AlterTable
ALTER TABLE "transaction_logs" ADD COLUMN     "block_hash" TEXT,
ADD COLUMN     "block_number" INTEGER,
ADD COLUMN     "data" TEXT,
ADD COLUMN     "from" TEXT,
ADD COLUMN     "nonce" INTEGER,
ADD COLUMN     "status" TEXT,
ADD COLUMN     "to" TEXT,
ADD COLUMN     "value" TEXT;
