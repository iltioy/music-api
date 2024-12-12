import { Module } from '@nestjs/common';
import { SongsService } from './songs.service';
import { SongsController } from './songs.controller';
import { PlaylistsModule } from 'src/playlists/playlists.module';
import { SongsFormatter } from './songs.formatted';

@Module({
  providers: [SongsService, SongsFormatter],
  controllers: [SongsController],
  imports: [PlaylistsModule],
  exports: [SongsFormatter],
})
export class SongsModule {}
