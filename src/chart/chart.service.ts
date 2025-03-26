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

  async getChart(chartName: string) {
    const chart = await this.prisma.category.findMany({
      where: {
        chart_type: chartName,
      },
    });

    if (chart.length === 0) {
      await this.prisma.category.create({
        data: {
          name: 'Категория 1',
          chart_type: chartName,
          order: 1,
          playlists_to_categories: {
            create: {
              playlist: {
                create: {
                  name: 'Плейлист 1',
                  image_url: DEFAULT_PLAYLISY_IMAGE_URL,
                },
              },
              order: 1,
            },
          },
        },
      });
    }

    if (!chart) {
      throw new NotFoundException();
    }

    return this.chartFormatter.format(chart);
  }

  async updateChart(chartName: string, dto: updateChartDto) {
    const updatedChart = await this.prisma.category.updateMany({
      where: {
        chart_type: chartName,
      },
      data: {
        chart_type: dto.name,
      },
    });

    if (!updatedChart) throw new BadRequestException();

    return updatedChart;
  }

  async addCategoryToChart(chartName: string, categoryId: number) {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) throw new NotFoundException();

    if (category.chart_type === chartName) throw new BadRequestException();

    await this.prisma.category.update({
      where: {
        id: category.id,
      },
      data: {
        chart_type: chartName,
      },
    });

    return this.chartFormatter.format([category]);
  }

  async reorderCategories(chartName: string, dto: reorderChartCategoriesDto) {
    console.log(dto.categories);
    const categories = await this.prisma.category.findMany({
      where: {
        chart_type: chartName,
      },
    });

    let highestOrder = dto.categories.length;

    const promises = dto.categories.map(async (category, index) => {
      if (!category || !category.id) return;
      console.log({ category });
      await this.prisma.category.updateMany({
        data: {
          order: highestOrder - index,
        },
        where: {
          chart_type: chartName,
          id: category.id,
        },
      });
    });

    await Promise.all(promises);

    return { success: true };
  }

  async removeCategoryFromChart(chartName: string, categoryId: number) {
    const category = await this.prisma.category.update({
      where: {
        id: categoryId,
        chart_type: chartName,
      },
      data: {
        chart_type: null,
      },
    });

    return this.chartFormatter.format([category]);
  }

  async deleteChart(chartName: string) {
    try {
      await this.prisma.category.updateMany({
        where: {
          chart_type: chartName,
        },
        data: {
          chart_type: null,
        },
      });

      return { success: true };
    } catch (error) {
      throw new BadRequestException('No chart with such name found');
    }
  }
}
