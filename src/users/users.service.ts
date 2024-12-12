import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  SELECT_USER_CATEGORIES,
  SELECT_USER_QUERY,
  SELECT_USERS_TO_PLAYLISTS,
  USER_QUERY,
} from 'src/queries';
import { updateUserDto } from './dto/update-user.dto';
import { createUserDto } from './dto';
import { DEFAULT_USER_IMAGE_URL, PASSWORD_RECOVERY_LINK } from 'src/constants';
import { MailerService } from '@nestjs-modules/mailer';
import { v4 as uuid } from 'uuid';
import {
  restorePasswordDto,
  restorePasswordRequestDto,
} from './dto/restore-password.dto';
import * as argon from 'argon2';
import { PlaylistsService } from 'src/playlists/playlists.service';
import { UsersFormatter } from './users.formatter';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailerService,
    private playlistsService: PlaylistsService,
    private usersFormatter: UsersFormatter,
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
          image_url: DEFAULT_USER_IMAGE_URL,
        },
      });

      this.playlistsService.createFavoritePlaylist(user.id);

      const updatedUser = await this.prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });

      console.log(updatedUser);

      return this.usersFormatter.format(updatedUser);
    } catch (error) {
      throw error;
    }
  }

  async getUserByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    return this.usersFormatter.format(user);
  }

  async updateUser(userId: number, dto: updateUserDto) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          username: dto.username,
          image_url: dto.image_url,
        },
      });

      if (!updateUserDto) {
        throw new BadRequestException();
      }

      return this.usersFormatter.format(updatedUser);
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
        from: 'tema.illar@mail.ru',
        subject: 'Password Recovery',
        html: `Your password recovery link: <a href="${PASSWORD_RECOVERY_LINK}/${link_id}">${PASSWORD_RECOVERY_LINK}/${link_id}</a>`,
      });

      setTimeout(async () => {
        await this.prisma.user.update({
          where: {
            email: dto.email,
          },
          data: {
            restore_password_link_id: null,
          },
        });
      }, 1000 * 60);

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
        users_to_playlists: true,
      },
    });

    let isInCollection = false;
    user.users_to_playlists.map((playlist) =>
      playlist.playlist_id === playlistId
        ? (isInCollection = true)
        : (isInCollection = false),
    );

    if (isInCollection) {
      throw new BadRequestException('Playlist is already added');
    }

    const addedPlaylists = await this.playlistsService.getAddedPlaylists(
      userId,
    );

    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        users_to_playlists: {
          create: {
            order: addedPlaylists.length + 1,
            playlist_id: playlistId,
          },
        },
      },
    });

    return this.usersFormatter.format(updatedUser);
  }

  async removePlaylistFromUserCollection(userId: number, playlistId: number) {
    await this.playlistsService.getPlaylist(playlistId);

    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        users_to_playlists: {
          deleteMany: {
            playlist_id: playlistId,
          },
        },
      },
    });

    return this.usersFormatter.format(updatedUser);
  }

  async restorePassword(recovery_link_id: string, dto: restorePasswordDto) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          restore_password_link_id: recovery_link_id,
        },
      });

      if (!user || !user.restore_password_link_id)
        throw new ForbiddenException();

      const hash = await argon.hash(dto.password);
      await this.prisma.user.update({
        where: {
          email: user.email,
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
