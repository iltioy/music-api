import { IsArray, IsNotEmpty } from 'class-validator';
import { FormattedCategory } from 'src/categories/types';

export class reorderChartCategoriesDto {
  @IsArray()
  @IsNotEmpty()
  categories: FormattedCategory[];
}
