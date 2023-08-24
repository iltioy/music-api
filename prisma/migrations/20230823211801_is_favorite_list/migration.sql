-- AlterTable
ALTER TABLE "playlists" ADD COLUMN     "is_favorite" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "liked_playlists_owner_id" INTEGER,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToPlaylist" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_liked_playlists_owner_id_key" ON "categories"("liked_playlists_owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToPlaylist_AB_unique" ON "_CategoryToPlaylist"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToPlaylist_B_index" ON "_CategoryToPlaylist"("B");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_liked_playlists_owner_id_fkey" FOREIGN KEY ("liked_playlists_owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToPlaylist" ADD CONSTRAINT "_CategoryToPlaylist_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToPlaylist" ADD CONSTRAINT "_CategoryToPlaylist_B_fkey" FOREIGN KEY ("B") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
