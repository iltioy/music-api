/*
  Warnings:

  - You are about to drop the column `user_id` on the `OrderedPlaylist` table. All the data in the column will be lost.
  - You are about to drop the `_OrderedPlaylistToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_OrderedPlaylistToUser" DROP CONSTRAINT "_OrderedPlaylistToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrderedPlaylistToUser" DROP CONSTRAINT "_OrderedPlaylistToUser_B_fkey";

-- AlterTable
ALTER TABLE "OrderedPlaylist" DROP COLUMN "user_id";

-- DropTable
DROP TABLE "_OrderedPlaylistToUser";

-- CreateTable
CREATE TABLE "_added_playlists" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_liked_playlists" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_added_playlists_AB_unique" ON "_added_playlists"("A", "B");

-- CreateIndex
CREATE INDEX "_added_playlists_B_index" ON "_added_playlists"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_liked_playlists_AB_unique" ON "_liked_playlists"("A", "B");

-- CreateIndex
CREATE INDEX "_liked_playlists_B_index" ON "_liked_playlists"("B");

-- AddForeignKey
ALTER TABLE "_added_playlists" ADD CONSTRAINT "_added_playlists_A_fkey" FOREIGN KEY ("A") REFERENCES "OrderedPlaylist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_added_playlists" ADD CONSTRAINT "_added_playlists_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_liked_playlists" ADD CONSTRAINT "_liked_playlists_A_fkey" FOREIGN KEY ("A") REFERENCES "OrderedPlaylist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_liked_playlists" ADD CONSTRAINT "_liked_playlists_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
