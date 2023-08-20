import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  IsInt,
  ValidateNested,
} from 'class-validator';

export class createPlaylistDto {
  @IsString()
  @Length(0, 50)
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsOptional({ each: true })
  @ValidateNested()
  songs: any;
}
