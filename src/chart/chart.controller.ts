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
} from '@nestjs/common';
import { createChartDto } from './dto';
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

  @Post('create')
  createChart(dto: createChartDto) {
    return this.chartService.createChart(dto)
  }

  @SkipAuth()
  @Get(':chartName')
  getChart(@Param('chartName') chartName: string) {
    return this.chartService.getChart(chartName)
  }

  @Patch('update/:chartName')
  updateChart(@Param('chartName') chartName: string, dto: updateChartDto) {
    return this.chartService.updateChart(chartName, dto)
  }

  @Patch(":chartName/category/add/:categoryId")
  addCategoryToChart(@Param('chartName') chartName: string, @Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.chartService.addCategoryToChart(chartName, categoryId)
  }

  @Delete(":chartName/category/remove/:categoryId")
  removeCategoryFromChart(@Param('chartName') chartName: string, @Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.chartService.removeCategoryFromChart(chartName, categoryId)
  }

  @Patch(":chartName/add/playlist/:paylistId")
  addTrendPlaylistToChart(@Param("chartName") chartName: string, @Param("playlistId", ParseIntPipe) playlistId: number) {
    return this.chartService.removeTrendPlaylistFromChart(chartName, playlistId)
  }

  @Delete('delete/chartName')
  deleteChart(@Param('chartName') chartName: string) {
    return this.chartService.deleteChart(chartName)
  }
}
