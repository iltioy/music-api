import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class updateSongDto {
  @IsString()
  @IsOptional()
  @Length(1, 50)
  name?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  album: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  image_key?: string;
}
