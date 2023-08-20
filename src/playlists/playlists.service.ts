import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PlaylistsService {
  constructor(private prisma: PrismaService) {}

  async getPlaylist(playlistId: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: {
        id: playlistId,
      },
    });

    if (!playlist) {
      throw new NotFoundException();
    }

    return playlist;
  }
}
