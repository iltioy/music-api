-- CreateTable
CREATE TABLE "blacklisted_refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "blacklisted_refresh_tokens_pkey" PRIMARY KEY ("id")
);
