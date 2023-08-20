import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createSongDto } from './dto';
import { updateSongDto } from './dto/update-song.dto';

@Injectable()
export class SongsService {
  constructor(private prisma: PrismaService) {}

  async getSong(songId: number) {
    const song = await this.prisma.song.findUnique({
      where: {
        id: songId,
      },
    });

    if (!song) {
      throw new NotFoundException();
    }

    return song;
  }

  async createSong(userId: number, dto: createSongDto) {
    const song = await this.prisma.song.create({
      data: {
        author: dto.author,
        image_url: dto.image_url,
        name: dto.name,
        album: dto.album,
        owner_id: userId,
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
    });

    if (!song) {
      throw new NotFoundException();
    }

    this.checkAccess(userId, song.owner_id);

    const updatedSong = await this.prisma.song.update({
      where: {
        id: songId,
      },
      data: {
        album: dto.album,
        author: dto.author,
        image_url: dto.image_url,
        name: dto.name,
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
