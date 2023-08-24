import { Injectable, NotFoundException } from '@nestjs/common';
import { createChartDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChartService {
  constructor(private prismaService: PrismaService) {}

  async createChart(dto: createChartDto) {
    const chart = await this.prismaService.chart.create({
      data: {
        chart_page: dto.name,
      },
    });

    return chart;
  }

  async getChart(chartName: string) {
    const chart = await this.prismaService.chart.findUnique({
      where: {
        chart_page: chartName,
      },
    });

    if (!chart) {
      throw new NotFoundException();
    }

    return chart;
  }

  async updateChart(chartName: string) {}
}
