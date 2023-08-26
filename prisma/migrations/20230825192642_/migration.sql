/*
  Warnings:

  - You are about to drop the column `chart_id` on the `playlists` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[chart_name]` on the table `OrderedPlaylist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chart_name` to the `OrderedPlaylist` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_chart_id_fkey";

-- DropIndex
DROP INDEX "playlists_chart_id_key";

-- AlterTable
ALTER TABLE "OrderedPlaylist" ADD COLUMN     "chart_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "playlists" DROP COLUMN "chart_id";

-- CreateIndex
CREATE UNIQUE INDEX "OrderedPlaylist_chart_name_key" ON "OrderedPlaylist"("chart_name");

-- AddForeignKey
ALTER TABLE "OrderedPlaylist" ADD CONSTRAINT "OrderedPlaylist_chart_name_fkey" FOREIGN KEY ("chart_name") REFERENCES "Chart"("chart_page") ON DELETE RESTRICT ON UPDATE CASCADE;
