import { Controller, Post, Body, HttpStatus, HttpCode, Req } from '@nestjs/common';
import { AuthDto } from './dto';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }
  
  @Post("refresh")
  refreshTokens(@Req() request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return this.authService.refreshTokens(type, token)
  }
}
