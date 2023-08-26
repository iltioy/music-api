import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
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

      const tokens = await this.signTokens(user.id, user.email, user.username, user.role);
      await this.updateRefreshToken(user.id, tokens.refresh_token)

      return tokens
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
    try {
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
  
      const tokens = await this.signTokens(user.id, user.email, user.username, user.role);
      await this.updateRefreshToken(user.id, tokens.refresh_token)

      return tokens
    } catch (error) {
      throw error
    }

  }

  async refreshTokens(type: string, refreshToken: string) {
    try {
      const {id: userId, email, username, role} = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET_REFRESH
      })

      const user = await this.prisma.user.findUnique({
        where: {
          id: userId
        }
      })

      const doMatch = await argon.verify(user.refresh_token, refreshToken)
      if (!doMatch) throw new UnauthorizedException()

      const tokens = await this.signTokens(userId, email, username, role)
      await this.updateRefreshToken(userId, tokens.refresh_token)

      return tokens
    } catch (error) {
      throw new UnauthorizedException()
    }
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await argon.hash(refreshToken)

    await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        refresh_token: hashedRefreshToken
      }
    })
  }

  async signTokens(
    userId: number,
    email: string,
    username: string,
    role: string,
  ): Promise<{ access_token: string, refresh_token: string }> {
    const payload = {
      id: userId,
      email,
      username,
      role,
    };
    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(payload, {
        expiresIn: '30m',
        secret: process.env.JWT_SECRET_ACCESS,
      }),
      this.jwt.signAsync(payload, {
        expiresIn: '30d',
        secret: process.env.JWT_SECRET_REFRESH,
      })
    ])
  
    return {
      access_token,
      refresh_token
    };
  }

 
}
