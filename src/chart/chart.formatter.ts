import { Injectable } from '@nestjs/common';
import { Chart } from '@prisma/client';
import { CategoriesFormatter } from 'src/categories/categories.formatter';
import { PlaylistsFormatter } from 'src/playlists/playlists.formatter';
import { PrismaService } from 'src/prisma/prisma.service';
import { FormattedChart } from './types';

@Injectable()
export class ChartFormatter {
  constructor(
    private prisma: PrismaService,
    private playlistFormatter: PlaylistsFormatter,
    private categoriesFormatter: CategoriesFormatter,
  ) {}

  async format(chartInput: Chart): Promise<FormattedChart> {
    const chart = await this.prisma.chart.findUnique({
      where: {
        chart_page: chartInput.chart_page,
      },
      include: {
        trend_palylist: true,
      },
    });

    const categories = await this.prisma.category.findMany({
      where: {
        chart_id: chart.id,
      },
      orderBy: {
        order: 'desc',
      },
    });

    const formattedCategories = await this.categoriesFormatter.formatMany(
      categories,
    );

    let formattedPlaylist = null;
    if (chart.trend_palylist) {
      formattedPlaylist = await this.playlistFormatter.format(
        chart.trend_palylist,
      );
    }

    return {
      name: chart.chart_page,
      categories: formattedCategories,
      playlist: formattedPlaylist,
    };
  }
}
