/*
  Warnings:

  - Added the required column `порядок` to the `Категории` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Категории" ADD COLUMN     "порядок" INTEGER NOT NULL;
