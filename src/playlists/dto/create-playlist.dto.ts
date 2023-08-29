import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  IsInt,
} from 'class-validator';

export class createPlaylistDto {
  @IsString()
  @Length(1, 50)
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  image_key?: string;
}
