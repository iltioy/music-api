/*
  Warnings:

  - You are about to drop the column `restore_password_link` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "restore_password_link",
ADD COLUMN     "restore_password_link_id" TEXT;
