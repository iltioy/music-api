/*
  Warnings:

  - A unique constraint covering the columns `[chart_id]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chart_id]` on the table `songs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chart_id` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chart_id` to the `songs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "chart_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "songs" ADD COLUMN     "chart_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- CreateTable
CREATE TABLE "Chart" (
    "id" SERIAL NOT NULL,
    "chart_page" TEXT NOT NULL,

    CONSTRAINT "Chart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chart_chart_page_key" ON "Chart"("chart_page");

-- CreateIndex
CREATE UNIQUE INDEX "categories_chart_id_key" ON "categories"("chart_id");

-- CreateIndex
CREATE UNIQUE INDEX "songs_chart_id_key" ON "songs"("chart_id");

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "Chart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "Chart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
