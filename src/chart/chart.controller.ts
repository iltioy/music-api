import {
  Controller,
  Param,
  Patch,
  Post,
  Get,
  Delete,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { createChartDto } from './dto';
import {
  AuthGuard,
  RoleGuard,
  Roles,
  SkipAuth,
  SkipRoles,
} from 'src/auth/guard';

@Controller('chart')
@Roles(['admin'])
@UseGuards(AuthGuard)
export class ChartController {
  @Post('create')
  createChart(dto: createChartDto) {
    return 'lalal';
  }

  @SkipAuth()
  @Get(':chartName')
  getChart(@Param('chartName') chartName: string) {}

  @Patch('update/:chartName')
  updateChart(@Param('chartName') chartName: string) {}

  @Delete('delete/chartName')
  deleteChart(@Param('chartName') chartName: string) {}
}
