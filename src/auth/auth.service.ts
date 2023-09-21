import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { signInDto, signUpDto, verifyEmailDto } from './dto';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createUserDto } from 'src/users/dto';
import { MailerService } from '@nestjs-modules/mailer';
import { uid } from 'uid';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwt: JwtService,
    private mailService: MailerService,
  ) {}

  async signup(dto: signUpDto) {
    const hash = await argon.hash(dto.password);

    try {
      const isEmailAvaible = await this.checkEmailAvailability(dto.email);
      if (!isEmailAvaible) {
        throw new ForbiddenException('Credentials are already taken!');
      }

      const codes = await this.prisma.verificationCodeToEmail.findMany({
        where: {
          email: dto.email,
        },
      });

      let isVerified = false;
      codes.map((code) => {
        if (code.verification_code === dto.emailVerificationCode) {
          isVerified = true;
        }
      });

      if (!isVerified) {
        throw new UnauthorizedException('Verification code is invalid!');
      }

      await this.prisma.verificationCodeToEmail.deleteMany({
        where: {
          email: dto.email,
        },
      });

      const createUserDto: createUserDto = {
        email: dto.email,
        hash,
      };
      const user = await this.usersService.createUser(createUserDto);

      const tokens = await this.signTokens(
        user.id,
        user.email,
        user.username,
        user.role,
      );
      await this.updateRefreshToken(user.id, tokens.refresh_token);

      return tokens;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async signin(dto: signInDto) {
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

      const tokens = await this.signTokens(
        user.id,
        user.email,
        user.username,
        user.role,
      );
      await this.updateRefreshToken(user.id, tokens.refresh_token);

      return tokens;
    } catch (error) {
      throw error;
    }
  }

  async refreshTokens(type: string, refreshToken: string) {
    try {
      if (!refreshToken || refreshToken === 'null')
        throw new BadRequestException('Token required!');

      const {
        id: userId,
        email,
        username,
        role,
      } = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET_REFRESH,
      });

      // const user = await this.prisma.user.findUnique({
      //   where: {
      //     id: userId,
      //   },
      // });

      const blacklistedToken =
        await this.prisma.blacklisted_refresh_tokens.findFirst({
          where: {
            token: refreshToken,
          },
        });

      if (blacklistedToken) throw new UnauthorizedException('Token expired!');

      // const doMatch = await argon.verify(user.refresh_token, refreshToken);
      // if (!doMatch) throw new UnauthorizedException();

      const tokens = await this.signTokens(userId, email, username, role);
      setTimeout(() => {
        this.blacklistRefreshToken(refreshToken);
      }, 1000 * 15);
      // await this.updateRefreshToken(userId, tokens.refresh_token);

      // return {
      //   access_token: tokens.access_token,
      //   refresh_token: refreshToken,
      // };

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await argon.hash(refreshToken);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refresh_token: hashedRefreshToken,
      },
    });
  }

  async blacklistRefreshToken(token: string) {
    try {
      await this.prisma.blacklisted_refresh_tokens.create({
        data: {
          token,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async signTokens(
    userId: number,
    email: string,
    username: string,
    role: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
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
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  async sendVerificationCode(dto: verifyEmailDto) {
    try {
      const isEmailAvaible = await this.checkEmailAvailability(dto.email);
      if (!isEmailAvaible) {
        throw new ForbiddenException('Credentials are already taken!');
      }

      const code = uid(6);

      await this.prisma.verificationCodeToEmail.deleteMany({
        where: {
          email: dto.email,
        },
      });

      const virifyEmailRecord =
        await this.prisma.verificationCodeToEmail.create({
          data: {
            email: dto.email,
            verification_code: code,
          },
        });

      if (!dto.test) {
        await this.mailService.sendMail({
          from: 'tema.illar@outlook.com',
          to: dto.email,
          subject: 'Verification code',
          text: `Your verification code: ${virifyEmailRecord.verification_code}`,
        });
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  async checkEmailAvailability(email: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return false;
    }
    return true;
  }
}
