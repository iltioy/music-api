import { IsOptional, IsString } from 'class-validator';

export class updateCategoryDto {
  @IsString()
  @IsOptional()
  name: string;
}
