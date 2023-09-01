import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Req,
} from '@nestjs/common';
import { signInDto, signUpDto, verifyEmailDto } from './dto';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: signUpDto) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signin(@Body() dto: signInDto) {
    return this.authService.signin(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@Req() request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return this.authService.refreshTokens(type, token);
  }

  @HttpCode(HttpStatus.OK)
  @Post('email/verify')
  verifyEmail(@Body() dto: verifyEmailDto) {
    return this.authService.sendVerificationCode(dto);
  }
}
