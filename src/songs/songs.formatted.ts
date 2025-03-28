import { Injectable } from '@nestjs/common';
import { Song } from '@prisma/client';
import { FormattedSong } from './types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SongsFormatter {
  constructor(private prisma: PrismaService) {}

  async format(songInput: Song): Promise<FormattedSong> {
    const song = await this.prisma.song.findUnique({
      where: {
        id: songInput.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            role: true,
            image_url: true,
            email: true,
          },
        },
        songs_to_playlists: {
          where: {
            song_id: songInput.id,
            playlist: {
              is_album: true,
            },
          },
          include: {
            playlist: {
              include: {
                users_to_playlists: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const playlist_record = song.songs_to_playlists[0];

    return {
      id: song.id,
      name: song.name,
      author: song.owner.username,
      image_url: song.image_url,
      owner: song.owner,
      url: song.url,
      album: playlist_record ? playlist_record.playlist.name : '',
      // genre: song.genre,
      // language: song.language,
      // mood: song.mood,
    };
  }

  async formatMany(songsInput: Song[]): Promise<FormattedSong[]> {
    const ids = songsInput.map((el) => el.id);

    const songs = await this.prisma.song.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            image_url: true,
          },
        },
      },
    });

    const formattedSongs = songs.map((song) => {
      return {
        id: song.id,
        name: song.name,
        author: song.owner.username,
        image_url: song.image_url,
        owner: song.owner,
        url: song.url,
        // album: song.album,
        // genre: song.genre,
        // language: song.language,
        // mood: song.mood,
      };
    });

    return formattedSongs;
  }
}
