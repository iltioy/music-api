import { IsOptional, IsString, Length } from 'class-validator';

export class updateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  image_key?: string;

  @IsOptional()
  @IsString()
  image_url?: string;
}
