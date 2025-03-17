import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  IsInt,
  IsBoolean,
} from 'class-validator';

export class createPlaylistDto {
  @IsString()
  @Length(1, 50)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  image_key?: string;

  @IsBoolean()
  @IsOptional()
  is_album?: boolean;
}
