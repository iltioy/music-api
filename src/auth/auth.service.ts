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
import { createUserDto } from 'src/users/dto';

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
      const createUserDto: createUserDto = {
        email: dto.email,
        hash,
      };
      const user = await this.usersService.createUser(createUserDto);

      return this.signToken(user.id, user.email, user.username, user.role);
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

    return this.signToken(user.id, user.email, user.username, user.role);
  }

  async signToken(
    userId: number,
    email: string,
    username: string,
    role: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      id: userId,
      email,
      username,
      role,
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
