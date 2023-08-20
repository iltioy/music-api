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
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { PlaylistsService } from './playlists.service';

// @UseGuards(AuthGuard)
@Controller('playlists')
export class PlaylistsController {
  constructor(private playlistService: PlaylistsService) {}

  @HttpCode(HttpStatus.OK)
  @Get(':playlistId')
  getPlaylist(@Param('playlistId', ParseIntPipe) playlistId: number) {
    return this.playlistService.getPlaylist(playlistId);
  }
}
