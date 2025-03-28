import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Post,
  UseGuards,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUser } from 'src/auth/decorator';
import { updateUserDto } from './dto/update-user.dto';
import {
  restorePasswordDto,
  restorePasswordRequestDto,
} from './dto/restore-password.dto';
import { AuthGuard } from 'src/auth/guard';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get(':username')
  getUser(@Param('username') username: string) {
    return this.userService.getUserByUsername(username);
  }

  @UseGuards(AuthGuard)
  @Get('get/me')
  getMe(@GetUser('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

  @UseGuards(AuthGuard)
  @Patch('update')
  updateUser(@GetUser('id') userId: number, @Body() dto: updateUserDto) {
    return this.userService.updateUser(userId, dto);
  }

  @UseGuards(AuthGuard)
  @Patch('playlists/add/:playlistId')
  addPlaylistToUserCollection(
    @GetUser('id') userId: number,
    @Param('playlistId', ParseIntPipe) playlistId: number,
  ) {
    return this.userService.addPlaylistToUserCollection(userId, playlistId);
  }

  @UseGuards(AuthGuard)
  @Delete('playlists/remove/:playlistId')
  removePlaylistFromUserCollection(
    @GetUser('id') userId: number,
    @Param('playlistId', ParseIntPipe) playlistId: number,
  ) {
    return this.userService.removePlaylistFromUserCollection(
      userId,
      playlistId,
    );
  }

  @Post('password/recover')
  restorePasswordCreateLink(@Body() dto: restorePasswordRequestDto) {
    return this.userService.restorePasswordCreateLink(dto);
  }

  @Post('password/recover/:recoveryId')
  restorePassword(
    @Param('recoveryId') recoveryId: string,
    @Body() dto: restorePasswordDto,
  ) {
    return this.userService.restorePassword(recoveryId, dto);
  }
}
