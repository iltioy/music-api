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
import { SELECT_USER_QUERY } from 'src/queries';
import { reorderPlaylistDto } from './dto/reorder-playlist';
import { PlaylistsFormatter } from './playlists.formatter';

@Injectable()
export class PlaylistsService {
  constructor(
    private prisma: PrismaService,
    private playlistsFormatter: PlaylistsFormatter,
  ) {}

  async getPlaylist(playlistId: number) {
    const playlist = await this.prisma.playlist.findUnique({
      where: {
        id: playlistId,
      },
    });

    if (!playlist) {
      throw new NotFoundException();
    }

    return this.playlistsFormatter.format(playlist);
  }

  async getAddedPlaylists(userId: number) {
    const playlists = await this.prisma.users_to_playlists.findMany({
      where: {
        user_id: userId,
        is_liked: false,
      },
      include: {
        playlist: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return playlists;
  }

  async getLikedPlaylists(userId: number) {
    const playlists = await this.prisma.users_to_playlists.findMany({
      where: {
        user_id: userId,
        is_liked: true,
      },
      include: {
        playlist: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return playlists;
  }

  async getPlaylistsByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const added_playlists_records = await this.getAddedPlaylists(user.id);
    const added_playlits = added_playlists_records.map(
      (record) => record.playlist,
    );

    const liked_playlists_records = await this.getLikedPlaylists(user.id);
    const liked_playlists = liked_playlists_records.map(
      (record) => record.playlist,
    );

    const formatted_added_playlists = await this.playlistsFormatter.formatMany(
      added_playlits,
      user.id,
    );
    const formatted_liked_playlists = await this.playlistsFormatter.formatMany(
      liked_playlists,
      user.id,
    );

    return {
      liked_playlists: formatted_liked_playlists,
      added_playlists: formatted_added_playlists,
    };
  }

  async createPlaylist(userId: number, dto: createPlaylistDto) {
    let playlistImage = DEFAULT_PLAYLISY_IMAGE_URL;

    if (dto.image_url) {
      playlistImage = dto.image_url;
    }

    const added_playlists = await this.getAddedPlaylists(userId);

    const playlist = await this.prisma.playlist.create({
      data: {
        name: `Плейлист #${added_playlists.length + 1}`,
        image_url: playlistImage,
        owner_id: userId,
      },
    });

    let maxOrder = 0;
    added_playlists.forEach((el) => {
      maxOrder = Math.max(maxOrder, el.order);
    });

    await this.prisma.users_to_playlists.create({
      data: {
        user_id: userId,
        playlist_id: playlist.id,
        order: maxOrder + 1,
      },
    });

    if (!playlist) {
      throw new BadRequestException('Could not create a playlist!');
    }

    return this.playlistsFormatter.format(playlist, userId);
  }

  async updatePlaylist(
    userId: number,
    playlistId: number,
    dto: updatePlaylistDto,
  ) {
    const playlist = await this.checkIfPlaylistExists(playlistId);

    this.checkAccess(userId, playlist.owner_id);

    let playlistImage = playlist.image_url;

    if (dto.image_key) {
      playlistImage = dto.image_url;
    }

    const updatedPlaylist = await this.prisma.playlist.update({
      where: {
        id: playlistId,
      },
      data: {
        name: dto.name,
        image_url: playlistImage,
      },
    });

    return this.playlistsFormatter.format(updatedPlaylist, userId);
  }

  async addSongToPlaylist(userId: number, playlistId: number, songId: number) {
    const playlist = await this.checkIfPlaylistExists(playlistId);

    this.checkAccess(userId, playlist.owner_id);

    let isInPlaylist = false;
    let maxOrder = 0;
    playlist.songs_to_playlists.forEach((song) => {
      if (song.song_id === songId) {
        isInPlaylist = true;
      }
      maxOrder = Math.max(maxOrder, song.order);
    });

    if (isInPlaylist)
      throw new BadRequestException('Song is already in the playlist');

    const song = await this.prisma.song.findUnique({
      where: {
        id: songId,
      },
    });

    if (!song) throw new NotFoundException('Song was not found by id');

    const updatedPlatlist = await this.prisma.playlist.update({
      where: {
        id: playlistId,
      },
      data: {
        songs_to_playlists: {
          create: {
            order: maxOrder + 1,
            song_id: songId,
          },
        },
      },
    });

    return this.playlistsFormatter.format(updatedPlatlist, userId);
  }

  async reorderPlaylist(
    userId: number,
    playlistId: number,
    dto: reorderPlaylistDto,
  ) {
    console.log(dto.songs);
    const playlist = await this.checkIfPlaylistExists(playlistId);

    this.checkAccess(userId, playlist.owner_id);

    let highestOrder = dto.songs.length;

    const promises = dto.songs.map(async (song, index) => {
      if (!song || !song.id) return;
      await this.prisma.songs_to_playlists.updateMany({
        data: {
          order: highestOrder - index,
        },
        where: {
          playlist_id: playlistId,
          song_id: song.id,
        },
      });
    });

    await Promise.all(promises);

    return { success: true };
  }

  async handleTogglePlaylistLike(userId: number, playlistId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        users_to_playlists: {
          include: {
            playlist: true,
          },
        },
      },
    });

    if (!user) throw new BadRequestException();

    let isPlaylistAlreadyLiked = false;
    let maxOrder = 0;

    user.users_to_playlists.forEach((el) => {
      if (!el.is_liked) return;
      maxOrder = Math.max(maxOrder, el.order);
      if (el.playlist && el.playlist.id === playlistId && el.is_liked) {
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
          users_to_playlists: {
            create: {
              order: maxOrder + 1,
              playlist_id: playlistId,
              is_liked: true,
            },
          },
        },
        select: SELECT_USER_QUERY,
      });
    } else {
      updatedUser = await this.prisma.users_to_playlists.deleteMany({
        where: {
          user_id: userId,
          playlist_id: playlistId,
          is_liked: true,
        },
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
        users_to_playlists: {
          include: {
            playlist: {
              include: {
                songs_to_playlists: {
                  include: {
                    song: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    let isFavoritePlaylistExists = false;

    user.users_to_playlists.map((el) => {
      if (el.is_favorite) {
        isFavoritePlaylistExists = true;
      }
    });

    if (isFavoritePlaylistExists) return;

    const iLikePlaylist = await this.prisma.playlist.create({
      data: {
        name: 'Мне нравится',
        image_url: FAVORITE_PLAYLIST_ICON_URL,
        owner_id: userId,
      },
    });

    await this.prisma.users_to_playlists.create({
      data: {
        user_id: userId,
        playlist_id: iLikePlaylist.id,
        order: -1,
        is_favorite: true,
      },
    });

    return this.playlistsFormatter.format(iLikePlaylist, userId);
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
        songs_to_playlists: {
          deleteMany: {
            song_id: songId,
          },
        },
      },
    });

    return this.playlistsFormatter.format(updatedPlaylist, userId);
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
        songs_to_playlists: {
          include: {
            song: true,
          },
        },
      },
    });

    if (!playlist) throw new NotFoundException('Playlist was not found');

    return playlist;
  }

  checkAccess(userId: number, ownerId: number) {
    if (userId !== ownerId) throw new ForbiddenException();
  }
}
