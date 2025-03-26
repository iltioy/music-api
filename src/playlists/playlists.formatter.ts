import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FormattedPlaylist } from './types';
import { FormattedSong } from 'src/songs/types';
import { Playlist } from '@prisma/client';
import { SongsFormatter } from 'src/songs/songs.formatted';

@Injectable()
export class PlaylistsFormatter {
  constructor(
    private prisma: PrismaService,
    private songsFormatter: SongsFormatter,
  ) {}

  async format(
    playlistInput: Playlist,
    userId?: number,
  ): Promise<FormattedPlaylist> {
    let playlist = await this.prisma.playlist.findUnique({
      where: {
        id: playlistInput.id,
      },
      select: {
        id: true,
        name: true,
        is_album: true,
        image_url: true,
        songs_to_playlists: {
          include: {
            song: {
              include: {
                owner: {
                  select: {
                    id: true,
                    username: true,
                    nickname: true,
                    role: true,
                    image_url: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            order: 'desc',
          },
        },
        users_to_playlists: {
          where: {
            user_id: userId,
          },
          select: {
            is_favorite: true,
            is_liked: true,
          },
        },
      },
    });

    const ownerPl = await this.prisma.users_to_playlists.findFirst({
      where: {
        is_owned: true,
        playlist_id: playlist.id,
      },
      include: {
        user: true,
      },
    });

    const owner = ownerPl?.user;

    let isFavorite = false;
    let isLiked = false;

    if (playlist.users_to_playlists.length > 0) {
      isFavorite = playlist.users_to_playlists[0].is_favorite;
      isLiked = playlist.users_to_playlists[0].is_liked;
    }

    let songs = playlist.songs_to_playlists.map((el) => el.song);
    let formattedSongs = await this.songsFormatter.formatMany(songs);

    return {
      id: playlist.id,
      name: playlist.name,
      owner: owner,
      image_url: playlist.image_url,
      is_favorite: isFavorite,
      is_liked: isLiked,
      songs: formattedSongs,
      is_album: playlist.is_album,
    };
  }

  async formatMany(
    playlistsInput: Playlist[],
    userId?: number,
  ): Promise<FormattedPlaylist[]> {
    let formattedPlaylistPromises = playlistsInput.map((playlist) => {
      return this.format(playlist, userId);
    });

    return Promise.all(formattedPlaylistPromises);
  }
}
