import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createChartDto, reorderChartCategoriesDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { updateChartDto } from './dto/update-chart.dto';
import { Category } from '@prisma/client';
import { FormattedCategory } from 'src/categories/types';
import { ChartFormatter } from './chart.formatter';
import { DEFAULT_PLAYLISY_IMAGE_URL } from 'src/constants';

@Injectable()
export class ChartService {
  constructor(
    private prisma: PrismaService,
    private chartFormatter: ChartFormatter,
  ) {}

  async createChart(dto: createChartDto) {
    try {
      const chart = await this.prisma.chart.create({
        data: {
          chart_page: dto.name,
          trend_palylist: {
            create: {
              name: dto.name,
              image_url: DEFAULT_PLAYLISY_IMAGE_URL,
            },
          },
        },
      });

      await this.prisma.category.create({
        data: {
          name: 'Категория',
          chart_id: chart.id,
          order: 1,
        },
      });

      return chart;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Chart name is already taken!');
      }
      throw error;
    }
  }

  async getChart(chartName: string) {
    const chart = await this.prisma.chart.findUnique({
      where: {
        chart_page: chartName,
      },
      include: {
        trend_palylist: true,
      },
    });

    if (!chart) {
      throw new NotFoundException();
    }

    return this.chartFormatter.format(chart);
  }

  async updateChart(chartName: string, dto: updateChartDto) {
    const updatedChart = await this.prisma.chart.update({
      where: {
        chart_page: chartName,
      },
      data: {
        chart_page: dto.name,
      },
    });

    if (!updatedChart) throw new BadRequestException();

    return updatedChart;
  }

  async addCategoryToChart(chartName: string, categoryId: number) {
    const chart = await this.prisma.chart.findUnique({
      where: {
        chart_page: chartName,
      },
    });

    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) throw new NotFoundException();

    if (category.chart_id === chart.id) throw new BadRequestException();

    await this.prisma.category.update({
      where: {
        id: category.id,
      },
      data: {
        chart_id: chart.id,
      },
    });

    return this.chartFormatter.format(chart);
  }

  async reorderCategories(chartName: string, dto: reorderChartCategoriesDto) {
    console.log(dto.categories);
    const chart = await this.prisma.chart.findUnique({
      where: {
        chart_page: chartName,
      },
    });

    let highestOrder = dto.categories.length;

    const promises = dto.categories.map(async (category, index) => {
      if (!category || !category.id) return;
      console.log({ category });
      console.log({ chart });
      await this.prisma.category.updateMany({
        data: {
          order: highestOrder - index,
        },
        where: {
          chart_id: chart.id,
          id: category.id,
        },
      });
    });

    await Promise.all(promises);

    return { success: true };
  }

  async addTrendPlaylistToChart(chartName: string, playlistId: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: {
        id: playlistId,
      },
    });

    if (!playlist) throw new NotFoundException();

    return this.prisma.chart.update({
      where: {
        chart_page: chartName,
      },
      data: {
        trend_palylist: {
          connect: {
            id: playlistId,
          },
        },
      },
    });
  }

  async removeTrendPlaylistFromChart(chartName: string, playlistId: number) {
    return this.prisma.chart.update({
      where: {
        chart_page: chartName,
      },
      data: {
        trend_palylist: {
          disconnect: {
            id: playlistId,
          },
        },
      },
    });
  }

  async removeCategoryFromChart(chartName: string, categoryId: number) {
    const chart = await this.prisma.chart.findUnique({
      where: {
        chart_page: chartName,
      },
    });

    await this.prisma.category.update({
      where: {
        id: categoryId,
        chart_id: chart.id,
      },
      data: {
        chart_id: null,
      },
    });

    return this.chartFormatter.format(chart);
  }

  async deleteChart(chartName: string) {
    try {
      await this.prisma.chart.delete({
        where: {
          chart_page: chartName,
        },
      });

      return { success: true };
    } catch (error) {
      throw new BadRequestException('No chart with such name found');
    }
  }
}
