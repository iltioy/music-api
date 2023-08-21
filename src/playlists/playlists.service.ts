import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createPlaylistDto } from './dto';
import { updatePlaylistDto } from './dto';
import { DEFAULT_PLAYLISY_IMAGE_URL } from 'src/constants';
import { IMAGE_QUERY, USER_QUERY } from 'src/queries';

@Injectable()
export class PlaylistsService {
  constructor(private prisma: PrismaService) {}

  private defaultImage = {
    image_key: null,
    image_url: DEFAULT_PLAYLISY_IMAGE_URL,
  };

  async getPlaylist(playlistId: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: {
        id: playlistId,
      },
      include: {
        owner: USER_QUERY,
        image: IMAGE_QUERY,
        songs: true,
      },
    });

    if (!playlist) {
      throw new NotFoundException();
    }

    return playlist;
  }

  async createPlaylist(userId: number, dto: createPlaylistDto) {
    let songs: { id: number }[] | undefined;
    let playlistImage = this.defaultImage;

    if (dto.songIds) {
      songs = await this.prisma.song.findMany({
        select: {
          id: true,
        },
        where: {
          id: {
            in: dto.songIds,
          },
        },
      });
    }

    if (dto.image_key) {
      playlistImage = {
        image_key: dto.image_key,
        image_url: dto.image_url,
      };
    }

    const playlist = await this.prisma.playlist.create({
      data: {
        name: dto.name,
        image: {
          create: playlistImage,
        },
        owner_id: userId,
        songs: {
          connect: songs,
        },
      },
      include: {
        owner: USER_QUERY,
        image: IMAGE_QUERY,
      },
    });

    if (!playlist) {
      throw new BadRequestException('Could not create a playlist!');
    }

    return playlist;
  }

  async updatePlaylist(
    userId: number,
    playlistId: number,
    dto: updatePlaylistDto,
  ) {
    const playlist = await this.prisma.playlist.findUnique({
      where: {
        id: playlistId,
      },
      include: {
        image: IMAGE_QUERY,
      },
    });

    if (!playlist) throw new NotFoundException();

    this.checkAccess(userId, playlist.owner_id);

    let playlistImage = playlist.image;

    if (dto.image_key) {
      playlistImage = {
        image_key: dto.image_key,
        image_url: dto.image_url,
      };
    }

    let songs: { id: number }[] | undefined;

    if (dto.songIds) {
      songs = await this.prisma.song.findMany({
        select: {
          id: true,
        },
        where: {
          id: {
            in: dto.songIds,
          },
        },
      });
    }

    const updatedPlaylist = await this.prisma.playlist.update({
      where: {
        id: playlistId,
      },
      data: {
        name: dto.name,
        image: {
          update: {
            data: playlistImage,
          },
        },
        songs: {
          set: songs,
        },
      },
      include: {
        image: IMAGE_QUERY,
        songs: true,
        owner: USER_QUERY,
      },
    });

    return updatedPlaylist;
  }

  async deletePlaylist(userId: number, playlistId: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: {
        id: playlistId,
      },
    });

    if (!playlist) throw new NotFoundException();

    this.checkAccess(userId, playlist.owner_id);

    const deletedPlaylist = await this.prisma.playlist.delete({
      where: {
        id: playlistId,
      },
    });

    return deletedPlaylist;
  }

  checkAccess(userId: number, ownerId: number) {
    if (userId !== ownerId) throw new ForbiddenException();
  }
}
