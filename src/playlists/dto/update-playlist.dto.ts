import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  IsInt,
} from 'class-validator';

export class updatePlaylistDto {
  @IsString()
  @Length(0, 50)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  image_key?: string;

  @IsOptional()
  @IsInt({ each: true })
  songIds?: number[];
}
