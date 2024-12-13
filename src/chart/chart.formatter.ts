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
        categories_to_charts: {
          include: {
            category: true,
          },
          orderBy: {
            order: 'desc',
          },
        },
        trend_playlist: true,
      },
    });

    const formattedCategoriesPromises = chart.categories_to_charts.map((el) =>
      this.categoriesFormatter.format(el.category),
    );
    const formattedCategories = await Promise.all(formattedCategoriesPromises);

    let formattedPlaylist = null;
    if (chart.trend_playlist) {
      formattedPlaylist = await this.playlistFormatter.format(
        chart.trend_playlist,
      );
    }

    return {
      name: chart.chart_page,
      categories: formattedCategories,
      playlist: formattedPlaylist,
    };
  }
}
