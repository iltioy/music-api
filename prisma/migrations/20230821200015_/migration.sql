/*
  Warnings:

  - You are about to drop the column `listening_time` on the `playlists` table. All the data in the column will be lost.
  - You are about to drop the column `number_of_songs` on the `playlists` table. All the data in the column will be lost.
  - Added the required column `owner_id` to the `songs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "playlists" DROP COLUMN "listening_time",
DROP COLUMN "number_of_songs",
ADD COLUMN     "image_key" TEXT;

-- AlterTable
ALTER TABLE "songs" ADD COLUMN     "image_key" TEXT,
ADD COLUMN     "owner_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "image_key" TEXT,
ADD COLUMN     "image_url" TEXT;

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
