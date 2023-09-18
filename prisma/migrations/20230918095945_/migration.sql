/*
  Warnings:

  - You are about to drop the column `owner_username` on the `playlists` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_owner_username_fkey";

-- AlterTable
ALTER TABLE "playlists" DROP COLUMN "owner_username",
ADD COLUMN     "owner_id" INTEGER;

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
