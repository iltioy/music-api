-- CreateTable
CREATE TABLE "Users_BlacklistedSongs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "song_id" INTEGER NOT NULL,

    CONSTRAINT "Users_BlacklistedSongs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Users_BlacklistedSongs" ADD CONSTRAINT "Users_BlacklistedSongs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users_BlacklistedSongs" ADD CONSTRAINT "Users_BlacklistedSongs_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
