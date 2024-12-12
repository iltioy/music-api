import { Module } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { PlaylistsFormatter } from './playlists.formatter';

@Module({
  providers: [PlaylistsService, PlaylistsFormatter],
  controllers: [PlaylistsController],
  exports: [PlaylistsService, PlaylistsFormatter],
})
export class PlaylistsModule {}
