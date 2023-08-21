/*
  Warnings:

  - You are about to drop the column `image_key` on the `playlists` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `playlists` table. All the data in the column will be lost.
  - You are about to drop the column `image_key` on the `songs` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `songs` table. All the data in the column will be lost.
  - You are about to drop the column `image_key` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "playlists" DROP COLUMN "image_key",
DROP COLUMN "image_url";

-- AlterTable
ALTER TABLE "songs" DROP COLUMN "image_key",
DROP COLUMN "image_url";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "image_key",
DROP COLUMN "image_url";

-- CreateTable
CREATE TABLE "images" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "song_id" INTEGER,
    "playlist_id" INTEGER,
    "image_url" TEXT,
    "image_key" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "images_user_id_key" ON "images"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "images_song_id_key" ON "images"("song_id");

-- CreateIndex
CREATE UNIQUE INDEX "images_playlist_id_key" ON "images"("playlist_id");

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE SET NULL ON UPDATE CASCADE;
