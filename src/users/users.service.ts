import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  IMAGE_QUERY,
  ORDERED_PLAYLISY_QUERY_SELECT,
  SELECT_USER_QUERY,
} from 'src/queries';
import { updateUserDto } from './dto/update-user.dto';
import { createUserDto } from './dto';
import {
  DEFAULT_USER_IMAGE_URL,
  FAVORITE_PLAYLIST_ICON_URL,
  PASSWORD_RECOVERY_LINK,
} from 'src/constants';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuid } from 'uuid';
import {
  restorePasswordDto,
  restorePasswordRequestDto,
} from './dto/restore-password.dto';
import * as argon from 'argon2';
import { PlaylistsService } from 'src/playlists/playlists.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailerService,
    private playlistsService: PlaylistsService,
  ) {}

  async createUser(dto: createUserDto) {
    try {
      const maxUserIdQuery = await this.prisma.user.aggregate({
        _max: {
          id: true,
        },
      });

      let maxUserId = maxUserIdQuery._max.id;

      if (!maxUserId) {
        maxUserId = 0;
      }

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: dto.hash,
          username: `User${maxUserId + 1}`,
          image: {
            create: {
              image_key: null,
              image_url: DEFAULT_USER_IMAGE_URL,
            },
          },
        },
        select: SELECT_USER_QUERY,
      });

      const iLikePlaylist = await this.playlistsService.createPlaylist(
        user.id,
        {
          name: 'Мне нравится',
          image_key: null,
          image_url: FAVORITE_PLAYLIST_ICON_URL,
        },
        true,
      );

      const updatedUser = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          added_playlists: {
            create: {
              order: 1,
              playlist_id: iLikePlaylist.id,
            },
          },
        },
        select: SELECT_USER_QUERY,
      });

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async getUserByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
      select: SELECT_USER_QUERY,
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async updateUser(userId: number, dto: updateUserDto) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          username: dto.username,
          image: {
            update: {
              data: {
                image_key: dto.image_key,
                image_url: dto.image_url,
              },
            },
          },
        },
        select: SELECT_USER_QUERY,
      });

      if (!updateUserDto) {
        throw new BadRequestException();
      }

      return updatedUser;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('This username is already taken!');
      }

      throw new BadRequestException();
    }
  }

  async restorePasswordCreateLink(dto: restorePasswordRequestDto) {
    try {
      const link_id = uuid();

      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (!user) throw new NotFoundException();

      await this.prisma.user.update({
        where: {
          email: dto.email,
        },
        data: {
          restore_password_link_id: link_id,
        },
      });

      await this.mailService.sendMail({
        to: dto.email,
        from: 'tema.illar@outlook.com',
        subject: 'Password Recovery',
        text: `Your password recovery link: ${PASSWORD_RECOVERY_LINK}/${link_id}`,
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async addPlaylistToUserCollection(userId: number, playlistId: number) {
    await this.playlistsService.getPlaylist(playlistId);

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        added_playlists: true,
      },
    });

    let isInCollection = false;
    user.added_playlists.map((playlist) =>
      playlist.playlist_id === playlistId
        ? (isInCollection = true)
        : (isInCollection = false),
    );

    if (isInCollection) throw new BadRequestException();

    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        added_playlists: {
          create: {
            order: user.added_playlists.length + 1,
            playlist_id: playlistId,
          },
        },
      },
      select: SELECT_USER_QUERY,
    });

    return updatedUser;
  }

  async removePlaylistFromUserCollection(userId: number, playlistId: number) {
    await this.playlistsService.getPlaylist(playlistId);

    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        added_playlists: {
          deleteMany: {
            playlist_id: playlistId,
          },
        },
      },
      select: SELECT_USER_QUERY,
    });

    return updatedUser;
  }

  async restorePassword(recovery_link_id: string, dto: restorePasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (!user) throw new NotFoundException();

      if (user.restore_password_link_id !== recovery_link_id)
        throw new ForbiddenException();

      const hash = await argon.hash(dto.password);
      await this.prisma.user.update({
        where: {
          email: dto.email,
        },
        data: {
          restore_password_link_id: null,
          hash,
        },
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}
