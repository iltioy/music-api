import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoriesFormatter } from './categories.formatter';
import { PlaylistsFormatter } from 'src/playlists/playlists.formatter';
import { SongsFormatter } from 'src/songs/songs.formatted';

@Module({
  providers: [
    CategoriesService,
    CategoriesFormatter,
    PlaylistsFormatter,
    SongsFormatter,
  ],
  exports: [CategoriesService, CategoriesFormatter],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
