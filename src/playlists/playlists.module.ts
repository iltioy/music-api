import { Module } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { PlaylistsFormatter } from './playlists.formatter';
import { SongsFormatter } from 'src/songs/songs.formatted';

@Module({
  providers: [PlaylistsService, PlaylistsFormatter, SongsFormatter],
  controllers: [PlaylistsController],
  exports: [PlaylistsService, PlaylistsFormatter],
})
export class PlaylistsModule {}
