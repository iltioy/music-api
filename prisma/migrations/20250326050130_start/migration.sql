-- CreateEnum
CREATE TYPE "Genre" AS ENUM ('hipHop', 'pop', 'rap');

-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('calm', 'cheerful', 'sad');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('russian', 'english', 'nowords');

-- CreateTable
CREATE TABLE "varification_code_to_email" (
    "id" SERIAL NOT NULL,
    "verification_code" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "varification_code_to_email_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "blacklisted_refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "blacklisted_refresh_tokens_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "blacklisted_songs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "song_id" INTEGER NOT NULL,

    CONSTRAINT "blacklisted_songs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Категории" (
    "id_категории" SERIAL NOT NULL,
    "название" TEXT NOT NULL,
    "тип_чарта" TEXT NOT NULL,
    "порядок" INTEGER NOT NULL,

    CONSTRAINT "Категории_pkey" PRIMARY KEY ("id_категории")
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

-- AddForeignKey
ALTER TABLE "Треки" ADD CONSTRAINT "Треки_id_автора_fkey" FOREIGN KEY ("id_автора") REFERENCES "Пользователи"("id_пользователя") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blacklisted_songs" ADD CONSTRAINT "blacklisted_songs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Пользователи"("id_пользователя") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blacklisted_songs" ADD CONSTRAINT "blacklisted_songs_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "Треки"("id_трека") ON DELETE CASCADE ON UPDATE CASCADE;

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
