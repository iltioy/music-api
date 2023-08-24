/*
  Warnings:

  - You are about to drop the column `liked_playlists_owner_id` on the `categories` table. All the data in the column will be lost.
  - Added the required column `owner_id` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_liked_playlists_owner_id_fkey";

-- DropIndex
DROP INDEX "categories_liked_playlists_owner_id_key";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "liked_playlists_owner_id",
ADD COLUMN     "owner_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
