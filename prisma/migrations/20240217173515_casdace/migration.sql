-- DropForeignKey
ALTER TABLE "OrderedCategory" DROP CONSTRAINT "OrderedCategory_category_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderedPlaylist" DROP CONSTRAINT "OrderedPlaylist_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderedSong" DROP CONSTRAINT "OrderedSong_song_id_fkey";

-- AddForeignKey
ALTER TABLE "OrderedSong" ADD CONSTRAINT "OrderedSong_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedPlaylist" ADD CONSTRAINT "OrderedPlaylist_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedCategory" ADD CONSTRAINT "OrderedCategory_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
