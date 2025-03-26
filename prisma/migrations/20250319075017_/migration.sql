/*
  Warnings:

  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categories_to_charts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `charts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `playlists` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `playlists_to_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `songs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `songs_to_playlists` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users_to_paylists` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "blacklisted_songs" DROP CONSTRAINT "blacklisted_songs_song_id_fkey";

-- DropForeignKey
ALTER TABLE "blacklisted_songs" DROP CONSTRAINT "blacklisted_songs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "categories_to_charts" DROP CONSTRAINT "categories_to_charts_category_id_fkey";

-- DropForeignKey
ALTER TABLE "categories_to_charts" DROP CONSTRAINT "categories_to_charts_chart_id_fkey";

-- DropForeignKey
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_chart_name_fkey";

-- DropForeignKey
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "playlists_to_categories" DROP CONSTRAINT "playlists_to_categories_category_id_fkey";

-- DropForeignKey
ALTER TABLE "playlists_to_categories" DROP CONSTRAINT "playlists_to_categories_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "songs" DROP CONSTRAINT "songs_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "songs_to_playlists" DROP CONSTRAINT "songs_to_playlists_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "songs_to_playlists" DROP CONSTRAINT "songs_to_playlists_song_id_fkey";

-- DropForeignKey
ALTER TABLE "users_to_paylists" DROP CONSTRAINT "users_to_paylists_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "users_to_paylists" DROP CONSTRAINT "users_to_paylists_user_id_fkey";

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "categories_to_charts";

-- DropTable
DROP TABLE "charts";

-- DropTable
DROP TABLE "playlists";

-- DropTable
DROP TABLE "playlists_to_categories";

-- DropTable
DROP TABLE "songs";

-- DropTable
DROP TABLE "songs_to_playlists";

-- DropTable
DROP TABLE "users";

-- DropTable
DROP TABLE "users_to_paylists";

-- CreateTable
CREATE TABLE "Пользователи" (
    "id_пользователя" SERIAL NOT NULL,
    "имя" TEXT NOT NULL,
    "псевдоним" TEXT,
    "роль" TEXT NOT NULL DEFAULT 'user',
    "email" TEXT NOT NULL,
    "фотография" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "refresh_token" TEXT,
    "restore_password_link_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Пользователи_pkey" PRIMARY KEY ("id_пользователя")
);

-- CreateTable
CREATE TABLE "Плейлисты" (
    "id_плейлиста" SERIAL NOT NULL,
    "название" TEXT NOT NULL,
    "изображение" TEXT NOT NULL,
    "флаг_альбома" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Плейлисты_pkey" PRIMARY KEY ("id_плейлиста")
);

-- CreateTable
CREATE TABLE "Треки" (
    "id_трека" SERIAL NOT NULL,
    "id_автора" INTEGER,
    "название" TEXT NOT NULL,
    "аудио" TEXT NOT NULL,
    "изображение" TEXT NOT NULL,

    CONSTRAINT "Треки_pkey" PRIMARY KEY ("id_трека")
);

-- CreateTable
CREATE TABLE "Категории" (
    "id_категории" SERIAL NOT NULL,
    "название" TEXT NOT NULL,
    "id_чарта" INTEGER NOT NULL,

    CONSTRAINT "Категории_pkey" PRIMARY KEY ("id_категории")
);

-- CreateTable
CREATE TABLE "Чарты" (
    "id_чарта" SERIAL NOT NULL,
    "chart_page" TEXT NOT NULL,
    "trend_playlist_id" INTEGER,

    CONSTRAINT "Чарты_pkey" PRIMARY KEY ("id_чарта")
);

-- CreateTable
CREATE TABLE "Пользователь_Плейлист" (
    "id_пользователь_плейлист" SERIAL NOT NULL,
    "id_пользователя" INTEGER NOT NULL,
    "id_плейлиста" INTEGER NOT NULL,
    "флаг_лайка" BOOLEAN NOT NULL DEFAULT false,
    "флаг_любимого_плейлиста" BOOLEAN NOT NULL DEFAULT false,
    "флаг_владения_плейлистом" BOOLEAN NOT NULL DEFAULT false,
    "порядок" INTEGER NOT NULL,

    CONSTRAINT "Пользователь_Плейлист_pkey" PRIMARY KEY ("id_пользователь_плейлист")
);

-- CreateTable
CREATE TABLE "Плейлист_Трек" (
    "id_плейлист_трек" SERIAL NOT NULL,
    "id_трека" INTEGER NOT NULL,
    "id_плейлиста" INTEGER NOT NULL,
    "порядок" INTEGER NOT NULL,

    CONSTRAINT "Плейлист_Трек_pkey" PRIMARY KEY ("id_плейлист_трек")
);

-- CreateTable
CREATE TABLE "Категория_Плейлист" (
    "id_категория_плейлист" SERIAL NOT NULL,
    "id_плейлиста" INTEGER NOT NULL,
    "id_категории" INTEGER NOT NULL,
    "порядок" INTEGER NOT NULL,

    CONSTRAINT "Категория_Плейлист_pkey" PRIMARY KEY ("id_категория_плейлист")
);

-- CreateIndex
CREATE UNIQUE INDEX "Пользователи_имя_key" ON "Пользователи"("имя");

-- CreateIndex
CREATE UNIQUE INDEX "Пользователи_email_key" ON "Пользователи"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Чарты_chart_page_key" ON "Чарты"("chart_page");

-- AddForeignKey
ALTER TABLE "Треки" ADD CONSTRAINT "Треки_id_автора_fkey" FOREIGN KEY ("id_автора") REFERENCES "Пользователи"("id_пользователя") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blacklisted_songs" ADD CONSTRAINT "blacklisted_songs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Пользователи"("id_пользователя") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blacklisted_songs" ADD CONSTRAINT "blacklisted_songs_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "Треки"("id_трека") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Категории" ADD CONSTRAINT "Категории_id_чарта_fkey" FOREIGN KEY ("id_чарта") REFERENCES "Чарты"("id_чарта") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Чарты" ADD CONSTRAINT "Чарты_trend_playlist_id_fkey" FOREIGN KEY ("trend_playlist_id") REFERENCES "Плейлисты"("id_плейлиста") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Пользователь_Плейлист" ADD CONSTRAINT "Пользователь_Плейлист_id_пользо_fkey" FOREIGN KEY ("id_пользователя") REFERENCES "Пользователи"("id_пользователя") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Пользователь_Плейлист" ADD CONSTRAINT "Пользователь_Плейлист_id_плейли_fkey" FOREIGN KEY ("id_плейлиста") REFERENCES "Плейлисты"("id_плейлиста") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Плейлист_Трек" ADD CONSTRAINT "Плейлист_Трек_id_трека_fkey" FOREIGN KEY ("id_трека") REFERENCES "Треки"("id_трека") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Плейлист_Трек" ADD CONSTRAINT "Плейлист_Трек_id_плейлиста_fkey" FOREIGN KEY ("id_плейлиста") REFERENCES "Плейлисты"("id_плейлиста") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Категория_Плейлист" ADD CONSTRAINT "Категория_Плейлист_id_плейлиста_fkey" FOREIGN KEY ("id_плейлиста") REFERENCES "Плейлисты"("id_плейлиста") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Категория_Плейлист" ADD CONSTRAINT "Категория_Плейлист_id_категории_fkey" FOREIGN KEY ("id_категории") REFERENCES "Категории"("id_категории") ON DELETE CASCADE ON UPDATE CASCADE;
