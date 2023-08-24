import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class createSongDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  author: string;

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
