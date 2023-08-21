import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  UseGuards,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { PlaylistsService } from './playlists.service';
import { createPlaylistDto } from './dto/create-playlist.dto';
import { updatePlaylistDto } from './dto';

// @UseGuards(AuthGuard)
@Controller('playlists')
export class PlaylistsController {
  constructor(private playlistService: PlaylistsService) {}

  @HttpCode(HttpStatus.OK)
  @Get(':playlistId')
  getPlaylist(@Param('playlistId', ParseIntPipe) playlistId: number) {
    return this.playlistService.getPlaylist(playlistId);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  createPlaylist(
    @GetUser('id') userId: number,
    @Body() dto: createPlaylistDto,
  ) {
    return this.playlistService.createPlaylist(userId, dto);
  }

  @UseGuards(AuthGuard)
  @Patch('update/:playlistId')
  updatePlaylist(
    @GetUser('id') userId: number,
    @Param('playlistId', ParseIntPipe) playlistId: number,
    @Body() dto: updatePlaylistDto,
  ) {
    return this.playlistService.updatePlaylist(userId, playlistId, dto);
  }

  @UseGuards(AuthGuard)
  @Delete('delete/:playlistId')
  deletePlaylist(
    @GetUser('id') userId: number,
    @Param('playlistId', ParseIntPipe) playlistId: number,
  ) {
    return this.playlistService.deletePlaylist(userId, playlistId);
  }
}
