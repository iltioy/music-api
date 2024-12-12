import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FormattedPlaylist } from './types';
import { FormattedSong } from 'src/songs/types';
import { Playlist } from '@prisma/client';

@Injectable()
export class PlaylistsFormatter {
  constructor(private prisma: PrismaService) {}

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
        owner: {
          select: {
            id: true,
            username: true,
            role: true,
            image_url: true,
          },
        },
        name: true,
        image_url: true,
        songs_to_playlists: {
          include: {
            song: {
              include: {
                owner: {
                  select: {
                    id: true,
                    username: true,
                    role: true,
                    image_url: true,
                  },
                },
              },
            },
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

    let isFavorite = false;
    let isLiked = false;

    if (playlist.users_to_playlists.length > 0) {
      isFavorite = playlist.users_to_playlists[0].is_favorite;
      isLiked = playlist.users_to_playlists[0].is_liked;
    }

    let formattedSongs = playlist.songs_to_playlists.map(
      (record): FormattedSong => {
        let song = record.song;

        return {
          id: song.id,
          name: song.name,
          author: song.author,
          image_url: song.image_url,
          owner: song.owner,
          url: song.url,
          album: song.album,
          genre: song.genre,
          language: song.language,
          mood: song.mood,
          order: record.order,
        };
      },
    );

    return {
      id: playlist.id,
      name: playlist.name,
      owner: playlist.owner,
      image_url: playlist.image_url,
      isFavorite,
      isLiked,
      songs: formattedSongs,
    };
  }

  async formatMany(
    playlistsInput: Playlist[],
    userId?: number,
  ): Promise<FormattedPlaylist[]> {
    let playlists = await this.prisma.playlist.findMany({
      where: {
        id: {
          in: this.extractPlaylistsIds(playlistsInput),
        },
      },
      select: {
        id: true,
        owner: {
          select: {
            id: true,
            username: true,
            role: true,
            image_url: true,
          },
        },
        name: true,
        image_url: true,
        songs_to_playlists: {
          include: {
            song: {
              include: {
                owner: {
                  select: {
                    id: true,
                    username: true,
                    role: true,
                    image_url: true,
                  },
                },
              },
            },
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

    const formattedPlaylists = playlists.map((playlist): FormattedPlaylist => {
      let isFavorite = false;
      let isLiked = false;

      if (playlist.users_to_playlists.length > 0) {
        isFavorite = playlist.users_to_playlists[0].is_favorite;
        isLiked = playlist.users_to_playlists[0].is_liked;
      }

      let formattedSongs = playlist.songs_to_playlists.map(
        (record): FormattedSong => {
          let song = record.song;

          return {
            id: song.id,
            name: song.name,
            author: song.author,
            image_url: song.image_url,
            owner: song.owner,
            url: song.url,
            album: song.album,
            genre: song.genre,
            language: song.language,
            mood: song.mood,
            order: record.order,
          };
        },
      );
      return {
        id: playlist.id,
        name: playlist.name,
        owner: playlist.owner,
        image_url: playlist.image_url,
        isFavorite,
        isLiked,
        songs: formattedSongs,
      };
    });

    return formattedPlaylists;
  }

  private extractPlaylistsIds(playlists: Playlist[]) {
    const ids = playlists.map((el) => el.id);

    return ids;
  }
}