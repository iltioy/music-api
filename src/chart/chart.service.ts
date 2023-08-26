import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createChartDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { updateChartDto } from './dto/update-chart.dto';

@Injectable()
export class ChartService {
  constructor(private prisma: PrismaService) {}

  async createChart(dto: createChartDto) {
    const chart = await this.prisma.chart.create({
      data: {
        chart_page: dto.name,
      },
    });

    return chart;
  }

  async getChart(chartName: string) {
    const chart = await this.prisma.chart.findUnique({
      where: {
        chart_page: chartName,
      },
      include: {
        categories: {
          orderBy: {
            order: "desc"
          },
          select: {
            category_id: true
          }
        }
      }
    });

    if (!chart) {
      throw new NotFoundException();
    }

    return chart;
  }

  async updateChart(chartName: string, dto: updateChartDto) {
    const updatedChart = await this.prisma.chart.update({
      where: {
        chart_page: chartName
      },
      data: {
        chart_page: dto.name
      },
      include: {
        categories: {
          orderBy: {
            order: "desc"
          },
          select: {
            category_id: true
          }
        }
      }
    })

    if (!updatedChart) throw new BadRequestException()

    return updatedChart
  }

  async addCategoryToChart(chartName: string, categoryId: number) {

    const chart = await this.prisma.chart.findUnique({
      where: {
        chart_page: chartName
      },
      include: {
        categories: true
      }
    })

    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId
      }
    })

    if (!category) throw new NotFoundException()

    let isInChart = false;
    chart.categories.map((category) =>
    category.category_id === categoryId
        ? (isInChart = true)
        : (isInChart = false),
    );

    if (isInChart) throw new BadRequestException();


    const updatedChart = await this.prisma.chart.update({
      where: {
        chart_page: chartName
      },
      data: {
        categories: {
          create: {
            order: chart.categories.length + 1,
            category_id: categoryId
          }
        }
      },
      include: {
        categories: {
          orderBy: {
            order: "desc"
          },
          select: {
            category_id: true
          }
        }
      }
    })

    return updatedChart
  }

  async addTrendPlaylistToChart(chartName: string, playlistId: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: {
        id: playlistId
      }
    })

    if (!playlist) throw new NotFoundException()

    return this.prisma.chart.update({
      where: {
        chart_page: chartName
      },
      data: {
        trend_playlist: {
          connect: {
            id: playlistId
          }
        }
      }
    })
  }

  async removeTrendPlaylistFromChart(chartName: string, playlistId: number) {
    return this.prisma.chart.update({
      where: {
        chart_page: chartName
      },
      data: {
        trend_playlist: {
          disconnect: {
            id: playlistId
          }
        }
      }
    })
  }

  async removeCategoryFromChart(chartName: string, categoryId: number) {
    const updatedChart = await this.prisma.chart.update({
      where: {
        chart_page: chartName
      },
      data: {
        categories: {
          deleteMany: {
            category_id: categoryId
          }
        }
      },
      include: {
        categories: {
          orderBy: {
            order: "desc"
          },
          select: {
            category_id: true
          }
        }
      }
    })

    return updatedChart
  }

  async deleteChart(chartName: string){
    return this.prisma.chart.delete({
      where: {
        chart_page: chartName
      }
    })
  }
}
