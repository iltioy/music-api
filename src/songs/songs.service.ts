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
import { IMAGE_QUERY, USER_QUERY } from 'src/queries';

@Injectable()
export class SongsService {
  private defaultImage = {
    image_key: null,
    image_url: DEFAULT_MUSIC_IMAGE_URL,
  };

  constructor(private prisma: PrismaService) {}

  async getSong(songId: number) {
    const song = await this.prisma.song.findUnique({
      where: {
        id: songId,
      },
      include: {
        image: IMAGE_QUERY,
        owner: USER_QUERY,
      },
    });

    if (!song) {
      throw new NotFoundException();
    }

    return song;
  }

  async getRandomSong() {
    const songsCount = await this.prisma.song.count();
    const skip = Math.floor(Math.random() * songsCount);

    const randomSong = await this.prisma.song.findMany({
      take: 1,
      skip: skip,
      include: {
        image: IMAGE_QUERY,
        owner: USER_QUERY,
      },
    });

    return randomSong[0];
  }

  async createSong(userId: number, dto: createSongDto) {
    let songImage = this.defaultImage;

    if (dto.image_key) {
      songImage = {
        image_key: dto.image_key,
        image_url: dto.image_url,
      };
    }

    const song = await this.prisma.song.create({
      data: {
        author: dto.author,
        image: {
          create: songImage,
        },
        name: dto.name,
        album: dto.album,
        owner_id: userId,
        url: dto.url,
      },
      include: {
        owner: USER_QUERY,
        image: IMAGE_QUERY,
      },
    });

    if (!song) {
      throw new BadRequestException();
    }

    return song;
  }

  async updateSong(userId: number, songId: number, dto: updateSongDto) {
    const song = await this.prisma.song.findUnique({
      where: {
        id: songId,
      },
      include: {
        image: IMAGE_QUERY,
      },
    });

    if (!song) {
      throw new NotFoundException();
    }

    this.checkAccess(userId, song.owner_id);

    let songImage = song.image;
    if (dto.image_key) {
      songImage = {
        image_key: dto.image_key,
        image_url: dto.image_url,
      };
    }

    const updatedSong = await this.prisma.song.update({
      where: {
        id: songId,
      },
      data: {
        album: dto.album,
        author: dto.author,
        image: {
          update: {
            data: songImage,
          },
        },
        name: dto.name,
      },
      include: {
        image: IMAGE_QUERY,
        owner: USER_QUERY,
      },
    });

    if (!updatedSong) {
      throw new BadRequestException();
    }

    return updatedSong;
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
}
