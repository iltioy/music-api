import { Module } from '@nestjs/common';
import { SongsService } from './songs.service';
import { SongsController } from './songs.controller';
import { PlaylistsModule } from 'src/playlists/playlists.module';

@Module({
  providers: [SongsService],
  controllers: [SongsController],
  imports: [PlaylistsModule],
})
export class SongsModule {}
