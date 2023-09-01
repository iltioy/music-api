/*
  Warnings:

  - You are about to drop the column `confirmation_code` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "confirmation_code";

-- CreateTable
CREATE TABLE "verificationCodeToEmail" (
    "id" SERIAL NOT NULL,
    "verification_code" INTEGER NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "verificationCodeToEmail_pkey" PRIMARY KEY ("id")
);
