-- CreateTable
CREATE TABLE "transaction_logs" (
    "id" SERIAL NOT NULL,
    "event" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removed" TIMESTAMP(3),

    CONSTRAINT "transaction_logs_pkey" PRIMARY KEY ("id")
);
