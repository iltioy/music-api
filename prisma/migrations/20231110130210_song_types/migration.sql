-- CreateEnum
CREATE TYPE "Genre" AS ENUM ('hipHop', 'pop', 'rap');

-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('calm', 'cheerful', 'sad');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('russian', 'english', 'nowords');

-- AlterTable
ALTER TABLE "songs" ADD COLUMN     "genre" "Genre",
ADD COLUMN     "language" "Language",
ADD COLUMN     "mood" "Mood";
