/*
  Warnings:

  - You are about to drop the column `owner_id` on the `playlists` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_owner_id_fkey";

-- AlterTable
ALTER TABLE "playlists" DROP COLUMN "owner_id",
ADD COLUMN     "owner_username" TEXT;

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_owner_username_fkey" FOREIGN KEY ("owner_username") REFERENCES "users"("username") ON DELETE SET NULL ON UPDATE CASCADE;
