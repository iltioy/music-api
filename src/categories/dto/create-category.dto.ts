import { IsNotEmpty, IsString } from 'class-validator';

export class createCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
