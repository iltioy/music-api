/*
  Warnings:

  - You are about to drop the column `is_favorite` on the `playlists` table. All the data in the column will be lost.
  - You are about to drop the `Chart` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderedCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderedPlaylist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderedSong` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users_BlacklistedSongs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_added_playlists` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_liked_playlists` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verificationCodeToEmail` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `image_url` to the `playlists` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_url` to the `songs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_url` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderedCategory" DROP CONSTRAINT "OrderedCategory_category_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderedCategory" DROP CONSTRAINT "OrderedCategory_chart_page_fkey";

-- DropForeignKey
ALTER TABLE "OrderedPlaylist" DROP CONSTRAINT "OrderedPlaylist_category_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderedPlaylist" DROP CONSTRAINT "OrderedPlaylist_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderedSong" DROP CONSTRAINT "OrderedSong_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderedSong" DROP CONSTRAINT "OrderedSong_song_id_fkey";

-- DropForeignKey
ALTER TABLE "Users_BlacklistedSongs" DROP CONSTRAINT "Users_BlacklistedSongs_song_id_fkey";

-- DropForeignKey
ALTER TABLE "Users_BlacklistedSongs" DROP CONSTRAINT "Users_BlacklistedSongs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "_added_playlists" DROP CONSTRAINT "_added_playlists_A_fkey";

-- DropForeignKey
ALTER TABLE "_added_playlists" DROP CONSTRAINT "_added_playlists_B_fkey";

-- DropForeignKey
ALTER TABLE "_liked_playlists" DROP CONSTRAINT "_liked_playlists_A_fkey";

-- DropForeignKey
ALTER TABLE "_liked_playlists" DROP CONSTRAINT "_liked_playlists_B_fkey";

-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_song_id_fkey";

-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_user_id_fkey";

-- DropForeignKey
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_chart_name_fkey";

-- AlterTable
ALTER TABLE "playlists" DROP COLUMN "is_favorite",
ADD COLUMN     "image_url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "songs" ADD COLUMN     "image_url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "image_url" TEXT NOT NULL;

-- DropTable
DROP TABLE "Chart";

-- DropTable
DROP TABLE "OrderedCategory";

-- DropTable
DROP TABLE "OrderedPlaylist";

-- DropTable
DROP TABLE "OrderedSong";

-- DropTable
DROP TABLE "Users_BlacklistedSongs";

-- DropTable
DROP TABLE "_added_playlists";

-- DropTable
DROP TABLE "_liked_playlists";

-- DropTable
DROP TABLE "images";

-- DropTable
DROP TABLE "verificationCodeToEmail";

-- CreateTable
CREATE TABLE "varification_code_to_email" (
    "id" SERIAL NOT NULL,
    "verification_code" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "varification_code_to_email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blacklisted_songs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "song_id" INTEGER NOT NULL,

    CONSTRAINT "blacklisted_songs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charts" (
    "id" SERIAL NOT NULL,
    "chart_page" TEXT NOT NULL,

    CONSTRAINT "charts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_to_paylists" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "playlist_id" INTEGER NOT NULL,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "is_liked" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,

    CONSTRAINT "users_to_paylists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "songs_to_playlists" (
    "id" SERIAL NOT NULL,
    "song_id" INTEGER NOT NULL,
    "playlist_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "songs_to_playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlists_to_categories" (
    "id" SERIAL NOT NULL,
    "playlist_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "playlists_to_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories_to_charts" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "chart_id" INTEGER NOT NULL,

    CONSTRAINT "categories_to_charts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "charts_chart_page_key" ON "charts"("chart_page");

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_chart_name_fkey" FOREIGN KEY ("chart_name") REFERENCES "charts"("chart_page") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blacklisted_songs" ADD CONSTRAINT "blacklisted_songs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blacklisted_songs" ADD CONSTRAINT "blacklisted_songs_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_to_paylists" ADD CONSTRAINT "users_to_paylists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_to_paylists" ADD CONSTRAINT "users_to_paylists_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "songs_to_playlists" ADD CONSTRAINT "songs_to_playlists_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "songs_to_playlists" ADD CONSTRAINT "songs_to_playlists_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlists_to_categories" ADD CONSTRAINT "playlists_to_categories_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlists_to_categories" ADD CONSTRAINT "playlists_to_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories_to_charts" ADD CONSTRAINT "categories_to_charts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories_to_charts" ADD CONSTRAINT "categories_to_charts_chart_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "charts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
