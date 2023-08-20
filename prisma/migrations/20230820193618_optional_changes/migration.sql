/*
  Warnings:

  - Added the required column `name` to the `playlists` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "playlists" ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "image_url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "songs" ALTER COLUMN "album" DROP NOT NULL,
ALTER COLUMN "image_url" DROP NOT NULL;
