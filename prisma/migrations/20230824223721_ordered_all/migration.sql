/*
  Warnings:

  - You are about to drop the column `chart_id` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `chart_id` on the `songs` table. All the data in the column will be lost.
  - You are about to drop the `_CategoryToPlaylist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PlaylistToSong` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[chart_id]` on the table `playlists` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_CategoryToPlaylist" DROP CONSTRAINT "_CategoryToPlaylist_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToPlaylist" DROP CONSTRAINT "_CategoryToPlaylist_B_fkey";

-- DropForeignKey
ALTER TABLE "_PlaylistToSong" DROP CONSTRAINT "_PlaylistToSong_A_fkey";

-- DropForeignKey
ALTER TABLE "_PlaylistToSong" DROP CONSTRAINT "_PlaylistToSong_B_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_chart_id_fkey";

-- DropForeignKey
ALTER TABLE "songs" DROP CONSTRAINT "songs_chart_id_fkey";

-- DropIndex
DROP INDEX "categories_chart_id_key";

-- DropIndex
DROP INDEX "songs_chart_id_key";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "chart_id";

-- AlterTable
ALTER TABLE "playlists" ADD COLUMN     "chart_id" INTEGER;

-- AlterTable
ALTER TABLE "songs" DROP COLUMN "chart_id";

-- DropTable
DROP TABLE "_CategoryToPlaylist";

-- DropTable
DROP TABLE "_PlaylistToSong";

-- CreateTable
CREATE TABLE "OrderedSong" (
    "id" SERIAL NOT NULL,
    "playlist_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "song_id" INTEGER NOT NULL,

    CONSTRAINT "OrderedSong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderedPlaylist" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "playlist_id" INTEGER NOT NULL,

    CONSTRAINT "OrderedPlaylist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderedCategory" (
    "id" SERIAL NOT NULL,
    "chart_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "OrderedCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "playlists_chart_id_key" ON "playlists"("chart_id");

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "Chart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedSong" ADD CONSTRAINT "OrderedSong_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedSong" ADD CONSTRAINT "OrderedSong_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedPlaylist" ADD CONSTRAINT "OrderedPlaylist_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedPlaylist" ADD CONSTRAINT "OrderedPlaylist_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedCategory" ADD CONSTRAINT "OrderedCategory_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "Chart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedCategory" ADD CONSTRAINT "OrderedCategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
