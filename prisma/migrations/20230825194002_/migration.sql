-- DropForeignKey
ALTER TABLE "OrderedPlaylist" DROP CONSTRAINT "OrderedPlaylist_chart_name_fkey";

-- AlterTable
ALTER TABLE "OrderedPlaylist" ALTER COLUMN "chart_name" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderedPlaylist" ADD CONSTRAINT "OrderedPlaylist_chart_name_fkey" FOREIGN KEY ("chart_name") REFERENCES "Chart"("chart_page") ON DELETE SET NULL ON UPDATE CASCADE;
