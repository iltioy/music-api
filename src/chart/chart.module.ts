import { Module } from '@nestjs/common';
import { ChartController } from './chart.controller';
import { ChartService } from './chart.service';
import { ChartFormatter } from './chart.formatter';
import { PlaylistsModule } from 'src/playlists/playlists.module';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  controllers: [ChartController],
  providers: [ChartService, ChartFormatter],
  imports: [PlaylistsModule, CategoriesModule],
})
export class ChartModule {}
