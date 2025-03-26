import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createSongDto } from './dto';
import { updateSongDto } from './dto/update-song.dto';
import { DEFAULT_MUSIC_IMAGE_URL } from 'src/constants';
import { USER_QUERY } from 'src/queries';
import { PlaylistsService } from 'src/playlists/playlists.service';
import { getRadioSongDto } from './dto/get-radio-song.dto';
import { SongsFormatter } from './songs.formatted';
import { PlaylistsFormatter } from 'src/playlists/playlists.formatter';

@Injectable()
export class SongsService {
  private defaultImage = {
    image_key: null,
    image_url: DEFAULT_MUSIC_IMAGE_URL,
  };

  constructor(
    private prisma: PrismaService,
    private playlistsService: PlaylistsService,
    private songsFromatter: SongsFormatter,
    private playlistsFormatter: PlaylistsFormatter,
  ) {}

  async getSong(songId: number) {
    const song = await this.prisma.song.findUnique({
      where: {
        id: songId,
      },
    });

    if (!song) {
      throw new NotFoundException();
    }

    return this.songsFromatter.format(song);
  }

  async getRandomSong() {
    const songsCount = await this.prisma.song.count();
    const skip = Math.floor(Math.random() * songsCount);

    const randomSong = await this.prisma.song.findMany({
      take: 1,
      skip: skip,
    });

    return this.songsFromatter.format(randomSong[0]);
  }

  async getSongForRadio(dto: getRadioSongDto, userId: number) {
    // const genre = dto.genres[Math.floor(Math.random() * dto.genres.length)];
    // const mood = dto.moods[Math.floor(Math.random() * dto.moods.length)];
    // const language =
    //   dto.languages[Math.floor(Math.random() * dto.languages.length)];

    let blacklistedSongs = await this.prisma.users_BlacklistedSongs.findMany({
      where: {
        user_id: userId,
      },
    });

    let blacklistedSongsIds = [];

    blacklistedSongs.forEach((blacklist) => {
      blacklistedSongsIds.push(blacklist.song_id);
    });

    let songs = await this.prisma.song.findMany({
      where: {
        // genre,
        // mood,
        // language,
        id: {
          notIn: blacklistedSongsIds,
        },
      },
    });

    if (songs.length === 0) {
      songs = await this.prisma.song.findMany({
        where: {
          // language,
          // genre,
          id: {
            notIn: blacklistedSongsIds,
          },
        },
        include: {
          owner: USER_QUERY,
        },
      });
    }

    const song = songs[Math.floor(Math.random() * songs.length)];

    if (!song) {
      return this.getRandomSong();
    }
    console.log(song, songs);
    return this.songsFromatter.format(song);
  }

  async createSong(userId: number, dto: createSongDto) {
    let songImage = this.defaultImage;

    if (dto.image_key || dto.image_url) {
      songImage = {
        image_key: dto.image_key,
        image_url: dto.image_url,
      };
    }

    const song = await this.prisma.song.create({
      data: {
        image_url: songImage.image_url,
        name: dto.name,
        owner_id: userId,
        url: dto.url,
      },
    });

    if (!song) {
      throw new BadRequestException('Could not create the song');
    }

    return this.songsFromatter.format(song);
  }

  async updateSong(userId: number, songId: number, dto: updateSongDto) {
    const song = await this.prisma.song.findUnique({
      where: {
        id: songId,
      },
    });

    if (!song) {
      throw new NotFoundException();
    }

    this.checkAccess(userId, song.owner_id);

    let songImage = song.image_url;
    if (dto.image_url) {
      songImage = dto.image_url;
    }

    const updatedSong = await this.prisma.song.update({
      where: {
        id: songId,
      },
      data: {
        image_url: songImage,
        name: dto.name,
      },
    });

    if (!updatedSong) {
      throw new BadRequestException();
    }

    return this.songsFromatter.format(updatedSong);
  }

  async addSongToFavoritePlaylist(userId: number, songId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        users_to_playlists: {
          include: {
            playlist: {
              include: {
                songs_to_playlists: true,
              },
            },
          },
        },
      },
    });

    const existingPlaylist = await this.prisma.users_to_playlists.findFirst({
      where: {
        user_id: userId,
        is_favorite: true,
      },
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
    });

    if (!user) throw new NotFoundException('User was not found by id');

    if (!existingPlaylist) {
      let playlist = await this.playlistsService.createFavoritePlaylist(userId);

      const updatedPlaylist = await this.playlistsService.addSongToPlaylist(
        userId,
        playlist.id,
        songId,
      );

      return updatedPlaylist;
    }

    let isSongInFavoritePlaylist = false;
    existingPlaylist.playlist.songs_to_playlists.map((song) => {
      if (song.song_id === songId) {
        isSongInFavoritePlaylist = true;
      }
    });

    let updatedPlaylist;
    if (!isSongInFavoritePlaylist) {
      updatedPlaylist = await this.playlistsService.addSongToPlaylist(
        userId,
        existingPlaylist.id,
        songId,
      );
    } else {
      updatedPlaylist = await this.playlistsService.removeSongFromPlaylist(
        userId,
        existingPlaylist.id,
        songId,
      );
    }

    return this.playlistsFormatter.format(updatedPlaylist);
  }

  async handleToggleSongLike(userId: number, songId: number) {
    const song = await this.prisma.song.findUnique({
      where: {
        id: songId,
      },
    });

    if (!song) {
      throw new NotFoundException('Song was not found!');
    }

    let isSongAlreadyLiked = false;
    let maxOrder = 0;

    let favoritePlaylistRecord = await this.prisma.users_to_playlists.findFirst(
      {
        where: {
          user_id: userId,
          is_favorite: true,
        },
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
    );

    let favoritePlaylist = await this.playlistsFormatter.format(
      favoritePlaylistRecord.playlist,
    );

    if (!favoritePlaylist) {
      favoritePlaylist = await this.playlistsService.createFavoritePlaylist(
        userId,
      );
    }

    favoritePlaylist.songs.forEach((el) => {
      maxOrder = Math.max(maxOrder, el.order);
      if (el.id === songId) {
        isSongAlreadyLiked = true;
      }
    });

    if (!isSongAlreadyLiked) {
      await this.prisma.playlist.update({
        where: {
          id: favoritePlaylist.id,
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
    } else {
      await this.prisma.playlist.update({
        where: {
          id: favoritePlaylist.id,
        },
        data: {
          songs_to_playlists: {
            deleteMany: {
              song_id: songId,
            },
          },
        },
      });
    }

    return { success: true };
  }

  async deleteSong(userId: number, songId: number) {
    const song = await this.prisma.song.findUnique({
      where: {
        id: songId,
      },
    });

    if (!song) {
      throw new NotFoundException();
    }

    this.checkAccess(userId, song.owner_id);

    const deletedSong = await this.prisma.song.delete({
      where: {
        id: songId,
      },
    });

    return deletedSong;
  }

  checkAccess(userId: number, ownerId: number) {
    if (userId === ownerId) return;

    throw new ForbiddenException();
  }

  async search(query: string, page: number) {
    // const nameItemsPerPage = 20;
    try {
      const songsByName = await this.prisma.song.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        orderBy: {
          name: 'desc',
        },
        include: {
          owner: USER_QUERY,
        },
        // take: nameItemsPerPage,
        // skip: (page - 1) * nameItemsPerPage
      });

      let songByNameIds: number[] = [];

      songsByName.forEach((song) => {
        songByNameIds.push(song.id);
      });

      // let authourItemsPerPage = 0
      // if (songsByName.length < nameItemsPerPage) {
      //   authourItemsPerPage = 20
      // }

      // const songsByAuthor = await this.prisma.song.findMany({
      //   where: {
      //     author: {
      //       contains: query,
      //       mode: 'insensitive',
      //     },
      //     id: {
      //       notIn: songByNameIds,
      //     },
      //   },
      //   orderBy: {
      //     author: 'desc',
      //   },
      //   include: {
      //     owner: USER_QUERY,
      //   },
      //   // take: authourItemsPerPage,
      //   // skip: (page - 1) * authourItemsPerPage
      // });

      const itemsPerPage = 5;

      let allFoundSongs = [...songsByName];
      let paginatedSongs = allFoundSongs.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage,
      );

      return this.songsFromatter.formatMany(paginatedSongs);
    } catch (error) {
      console.log(error);
    }
  }

  async blackListSong(userId: number, songId: number) {
    const song = await this.prisma.song.findUnique({
      where: {
        id: songId,
      },
    });

    if (!song) throw new NotFoundException();

    const blacklistedSong = await this.prisma.users_BlacklistedSongs.findFirst({
      where: {
        user_id: userId,
        song_id: songId,
      },
    });

    if (blacklistedSong)
      throw new BadRequestException('Song already blacklisted');

    await this.prisma.users_BlacklistedSongs.create({
      data: {
        user_id: userId,
        song_id: songId,
      },
    });

    return { success: true };
  }
}
