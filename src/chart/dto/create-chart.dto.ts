import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class createChartDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsInt({ each: true })
  categoriesIds;
}
