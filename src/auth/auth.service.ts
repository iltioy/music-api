import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { DEFAULT_USER_IMAGE_URL } from 'src/constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);

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
          hash,
          username: `User${usersCount}`,
          image: {
            create: {
              image_key: null,
              image_url: DEFAULT_USER_IMAGE_URL,
            },
          },
        },
      });

      return this.signToken(user.id, user.email, user.username);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Credentials are already taken');
      }

      throw new BadRequestException(
        'An error occured while processing your request',
      );
    }
  }

  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Credentials are incorrect!');
    }

    const passworsMath = await argon.verify(user.hash, dto.password);

    if (!passworsMath) {
      throw new ForbiddenException('Credentials are incorrect!');
    }

    return this.signToken(user.id, user.email, user.username);
  }

  async signToken(
    userId: number,
    email: string,
    username: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      id: userId,
      email,
      username,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '30m',
      secret: process.env.JWT_SECRET,
    });
    return {
      access_token: token,
    };
  }
}
