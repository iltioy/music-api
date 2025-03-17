-- AlterTable
ALTER TABLE "playlists" ADD COLUMN     "is_album" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "nickname" TEXT;
