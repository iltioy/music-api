import {
  Controller,
  Param,
  Patch,
  Post,
  Get,
  Delete,
  UseGuards,
  SetMetadata,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { createChartDto, reorderChartCategoriesDto } from './dto';
import {
  AuthGuard,
  RoleGuard,
  Roles,
  SkipAuth,
  SkipRoles,
} from 'src/auth/guard';
import { ChartService } from './chart.service';
import { updateChartDto } from './dto/update-chart.dto';

@Controller('chart')
@Roles(['admin'])
@UseGuards(AuthGuard)
export class ChartController {
  constructor(private chartService: ChartService) {}

  @SkipAuth()
  @Get(':chartName')
  getChart(@Param('chartName') chartName: string) {
    return this.chartService.getChart(chartName);
  }

  @Patch('update/:chartName')
  updateChart(
    @Param('chartName') chartName: string,
    @Body() dto: updateChartDto,
  ) {
    return this.chartService.updateChart(chartName, dto);
  }

  @Patch(':chartName/category/add/:categoryId')
  addCategoryToChart(
    @Param('chartName') chartName: string,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ) {
    return this.chartService.addCategoryToChart(chartName, categoryId);
  }

  @Patch(':chartName/categories/reorder')
  reorderCategories(
    @Param('chartName') chartName: string,
    @Body() dto: reorderChartCategoriesDto,
  ) {
    return this.chartService.reorderCategories(chartName, dto);
  }

  @Delete(':chartName/category/remove/:categoryId')
  removeCategoryFromChart(
    @Param('chartName') chartName: string,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ) {
    return this.chartService.removeCategoryFromChart(chartName, categoryId);
  }

  @Delete('delete/:chartName')
  deleteChart(@Param('chartName') chartName: string) {
    return this.chartService.deleteChart(chartName);
  }
}
