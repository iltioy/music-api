/*
  Warnings:

  - Added the required column `order` to the `categories_to_charts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `playlists_to_categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "categories_to_charts" ADD COLUMN     "order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "playlists_to_categories" ADD COLUMN     "order" INTEGER NOT NULL;
