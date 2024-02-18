import { Song } from '@prisma/client';
import { IsArray, IsNotEmpty } from 'class-validator';

export class reorderPlaylistDto {
  @IsArray()
  @IsNotEmpty()
  songs: Song[];
}
