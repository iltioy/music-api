import { Playlist } from '@prisma/client';
import { IsArray, IsNotEmpty } from 'class-validator';

export class reorderCategoryDto {
  @IsArray()
  @IsNotEmpty()
  playlists: Playlist[];
}
