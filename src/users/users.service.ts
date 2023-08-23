import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IMAGE_QUERY, USER_QUERY, SELECT_USER_QUERY } from 'src/queries';
import { updateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
