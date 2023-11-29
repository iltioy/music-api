import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createPlaylistDto } from './dto';
import { updatePlaylistDto } from './dto';
import {
  DEFAULT_PLAYLISY_IMAGE_URL,
  FAVORITE_PLAYLIST_ICON_URL,
} from 'src/constants';
import {
  IMAGE_QUERY,
  ORDERED_SONG_QUERY_SELECT,
  SELECT_USER_QUERY,
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
            order: 'desc',
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

  async getPlaylistsByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
      include: {
        liked_playlists: {
          include: {
            playlist: {
              include: {
                owner: USER_QUERY,
                image: IMAGE_QUERY,
                songs: {
                  orderBy: {
                    order: 'desc',
                  },
                  select: ORDERED_SONG_QUERY_SELECT,
                },
              },
            },
          },
        },
        added_playlists: {
          include: {
            playlist: {
              include: {
                owner: USER_QUERY,
                image: IMAGE_QUERY,
                songs: {
                  orderBy: {
                    order: 'desc',
                  },
                  select: ORDERED_SONG_QUERY_SELECT,
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { liked_playlists, added_playlists } = user;
    return { liked_playlists, added_playlists };
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

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        added_playlists: {
          include: {
            playlist: true,
          },
        },
      },
    });

    const playlist = await this.prisma.playlist.create({
      data: {
        name: `Плейлист #${user.added_playlists.length + 1}`,
        image: {
          create: playlistImage,
        },
        owner_id: userId,
        is_favorite: isFavorite,
      },
      include: {
        owner: USER_QUERY,
        image: IMAGE_QUERY,
        songs: {
          include: {
            song: true,
          },
        },
      },
    });

    let maxOrder = 0;
    user.added_playlists.forEach((el) => {
      maxOrder = Math.max(maxOrder, el.order);
    });

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        added_playlists: {
          create: {
            order: maxOrder + 1,
            playlist_id: playlist.id,
          },
        },
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
            order: 'desc',
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
    let maxOrder = 0;
    playlist.songs.forEach((song) => {
      song.song_id === songId ? (isInPlaylist = true) : (isInPlaylist = false);
      maxOrder = Math.max(maxOrder, song.order);
    });

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
            order: maxOrder + 1,
            song_id: songId,
          },
        },
      },
      include: {
        songs: {
          orderBy: {
            order: 'desc',
          },
          select: ORDERED_SONG_QUERY_SELECT,
        },
      },
    });

    return updatedPlatlist;
  }

  async handleTogglePlaylistLike(userId: number, playlistId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        liked_playlists: {
          include: {
            playlist: true,
          },
        },
      },
    });

    if (!user) throw new BadRequestException();

    let isPlaylistAlreadyLiked = false;
    let maxOrder = 0;

    user.liked_playlists.forEach((el) => {
      maxOrder = Math.max(maxOrder, el.order);
      if (el.playlist.id === playlistId) {
        isPlaylistAlreadyLiked = true;
      }
    });

    let updatedUser;
    if (!isPlaylistAlreadyLiked) {
      updatedUser = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          liked_playlists: {
            create: {
              order: maxOrder + 1,
              playlist_id: playlistId,
            },
          },
        },
        select: SELECT_USER_QUERY,
      });
    } else {
      updatedUser = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          liked_playlists: {
            deleteMany: {
              playlist_id: playlistId,
            },
          },
        },
        select: SELECT_USER_QUERY,
      });
    }

    return updatedUser;
  }

  async createFavoritePlaylist(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        added_playlists: {
          include: {
            playlist: {
              include: {
                songs: true,
              },
            },
          },
        },
      },
    });

    let isFavoritePlaylistExists = false;

    user.added_playlists.map((el) => {
      if (el.playlist.is_favorite) {
        isFavoritePlaylistExists = true;
      }
    });

    if (isFavoritePlaylistExists) return;

    const iLikePlaylist = await this.prisma.playlist.create({
      data: {
        name: 'Мне нравится',
        image: {
          create: {
            image_key: null,
            image_url: FAVORITE_PLAYLIST_ICON_URL,
          },
        },
        owner_id: userId,
        is_favorite: true,
      },
      include: {
        owner: USER_QUERY,
        image: IMAGE_QUERY,
        songs: {
          include: {
            song: true,
          },
        },
      },
    });

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        added_playlists: {
          create: {
            order: 1,
            playlist_id: iLikePlaylist.id,
          },
        },
      },
    });

    return iLikePlaylist;
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
            order: 'desc',
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
