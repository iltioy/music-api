import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoriesFormatter } from './categories.formatter';
import { PlaylistsFormatter } from 'src/playlists/playlists.formatter';

@Module({
  providers: [CategoriesService, CategoriesFormatter, PlaylistsFormatter],
  exports: [CategoriesService, CategoriesFormatter],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
