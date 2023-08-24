-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_chart_id_fkey";

-- DropForeignKey
ALTER TABLE "songs" DROP CONSTRAINT "songs_chart_id_fkey";

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "chart_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "songs" ALTER COLUMN "chart_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "Chart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "Chart"("id") ON DELETE SET NULL ON UPDATE CASCADE;
