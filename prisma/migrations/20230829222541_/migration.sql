-- DropForeignKey
ALTER TABLE "OrderedPlaylist" DROP CONSTRAINT "OrderedPlaylist_category_id_fkey";

-- AlterTable
ALTER TABLE "OrderedPlaylist" ADD COLUMN     "user_id" INTEGER,
ALTER COLUMN "category_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_OrderedPlaylistToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_OrderedPlaylistToUser_AB_unique" ON "_OrderedPlaylistToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_OrderedPlaylistToUser_B_index" ON "_OrderedPlaylistToUser"("B");

-- AddForeignKey
ALTER TABLE "OrderedPlaylist" ADD CONSTRAINT "OrderedPlaylist_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderedPlaylistToUser" ADD CONSTRAINT "_OrderedPlaylistToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "OrderedPlaylist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderedPlaylistToUser" ADD CONSTRAINT "_OrderedPlaylistToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
