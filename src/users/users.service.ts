import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IMAGE_QUERY, USER_QUERY, SELECT_USER_QUERY } from 'src/queries';
import { updateUserDto } from './dto/update-user.dto';
import { createUserDto } from './dto';
import {
  DEFAULT_USER_IMAGE_URL,
  FAVORITE_PLAYLIST_ICON_URL,
} from 'src/constants';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(dto: createUserDto) {
    try {
      const userCountQuery = await this.prisma.user.aggregate({
        _count: {
          _all: true,
        },
      });

      const usersCount = userCountQuery._count._all;

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: dto.hash,
          username: `User${usersCount}`,
          image: {
            create: {
              image_key: null,
              image_url: DEFAULT_USER_IMAGE_URL,
            },
          },
          playlists: {
            create: {
              name: 'Мне нравится',
              is_favorite: true,
              image: {
                create: {
                  image_key: null,
                  image_url: FAVORITE_PLAYLIST_ICON_URL,
                },
              },
            },
          },
        },
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUser(username: string) {
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
  }
}
