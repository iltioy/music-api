import { IsOptional, IsString } from 'class-validator';

export class updateChartDto {
  @IsString()
  @IsOptional()
  name?: string;
}
