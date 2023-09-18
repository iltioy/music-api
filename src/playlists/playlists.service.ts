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
import {
  IMAGE_QUERY,
  ORDERED_SONG_QUERY_SELECT,
  USER_QUERY,
} from 'src/queries';

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
        songs: {
          orderBy: {
            order: 'asc',
          },
          select: ORDERED_SONG_QUERY_SELECT,
        },
      },
    });

    if (!playlist) {
      throw new NotFoundException();
    }

    return playlist;
  }

  async createPlaylist(
    userId: number,
    dto: createPlaylistDto,
    isFavorite?: boolean,
  ) {
    let playlistImage = this.defaultImage;

    if (dto.image_key || dto.image_url) {
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
        is_favorite: isFavorite,
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
    const playlist = await this.checkIfPlaylistExists(playlistId);

    this.checkAccess(userId, playlist.owner_id);

    let playlistImage = playlist.image;

    if (dto.image_key) {
      playlistImage = {
        image_key: dto.image_key,
        image_url: dto.image_url,
      };
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
      },
      include: {
        image: IMAGE_QUERY,
        songs: {
          orderBy: {
            order: 'asc',
          },
          select: ORDERED_SONG_QUERY_SELECT,
        },
        owner: USER_QUERY,
      },
    });

    return updatedPlaylist;
  }

  async addSongToPlaylist(userId: number, playlistId: number, songId: number) {
    const playlist = await this.checkIfPlaylistExists(playlistId);

    this.checkAccess(userId, playlist.owner_id);

    let isInPlaylist = false;
    playlist.songs.map((song) =>
      song.song_id === songId ? (isInPlaylist = true) : (isInPlaylist = false),
    );

    if (isInPlaylist) throw new BadRequestException();

    const song = await this.prisma.song.findUnique({
      where: {
        id: songId,
      },
    });

    if (!song) throw new NotFoundException();

    const updatedPlatlist = await this.prisma.playlist.update({
      where: {
        id: playlistId,
      },
      data: {
        songs: {
          create: {
            order: playlist.songs.length + 1,
            song_id: songId,
          },
        },
      },
      include: {
        songs: {
          orderBy: {
            order: 'asc',
          },
          select: ORDERED_SONG_QUERY_SELECT,
        },
      },
    });

    return updatedPlatlist;
  }

  async removeSongFromPlaylist(
    userId: number,
    playlistId: number,
    songId: number,
  ) {
    const playlist = await this.checkIfPlaylistExists(playlistId);

    this.checkAccess(userId, playlist.owner_id);

    const updatedPlaylist = await this.prisma.playlist.update({
      where: {
        id: playlistId,
      },
      data: {
        songs: {
          deleteMany: {
            song_id: songId,
          },
        },
      },
      include: {
        songs: {
          orderBy: {
            order: 'asc',
          },
          select: ORDERED_SONG_QUERY_SELECT,
        },
      },
    });

    return updatedPlaylist;
  }

  async deletePlaylist(userId: number, playlistId: number) {
    const playlist = await this.checkIfPlaylistExists(playlistId);

    this.checkAccess(userId, playlist.owner_id);

    const deletedPlaylist = await this.prisma.playlist.delete({
      where: {
        id: playlistId,
      },
    });

    return deletedPlaylist;
  }

  async checkIfPlaylistExists(playlistId: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: {
        id: playlistId,
      },
      include: {
        songs: true,
        image: IMAGE_QUERY,
      },
    });

    if (!playlist) throw new NotFoundException();

    return playlist;
  }

  checkAccess(userId: number, ownerId: number) {
    if (userId !== ownerId) throw new ForbiddenException();
  }
}
