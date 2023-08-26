/*
  Warnings:

  - You are about to drop the column `chart_id` on the `OrderedCategory` table. All the data in the column will be lost.
  - Added the required column `chart_page` to the `OrderedCategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderedCategory" DROP CONSTRAINT "OrderedCategory_chart_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderedPlaylist" DROP CONSTRAINT "OrderedPlaylist_category_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderedSong" DROP CONSTRAINT "OrderedSong_playlist_id_fkey";

-- AlterTable
ALTER TABLE "OrderedCategory" DROP COLUMN "chart_id",
ADD COLUMN     "chart_page" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderedSong" ADD CONSTRAINT "OrderedSong_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedPlaylist" ADD CONSTRAINT "OrderedPlaylist_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedCategory" ADD CONSTRAINT "OrderedCategory_chart_page_fkey" FOREIGN KEY ("chart_page") REFERENCES "Chart"("chart_page") ON DELETE CASCADE ON UPDATE CASCADE;
