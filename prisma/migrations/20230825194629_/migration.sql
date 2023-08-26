/*
  Warnings:

  - You are about to drop the column `chart_name` on the `OrderedPlaylist` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[chart_name]` on the table `playlists` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "OrderedPlaylist" DROP CONSTRAINT "OrderedPlaylist_chart_name_fkey";

-- DropIndex
DROP INDEX "OrderedPlaylist_chart_name_key";

-- AlterTable
ALTER TABLE "OrderedPlaylist" DROP COLUMN "chart_name";

-- AlterTable
ALTER TABLE "playlists" ADD COLUMN     "chart_name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "playlists_chart_name_key" ON "playlists"("chart_name");

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_chart_name_fkey" FOREIGN KEY ("chart_name") REFERENCES "Chart"("chart_page") ON DELETE SET NULL ON UPDATE CASCADE;
