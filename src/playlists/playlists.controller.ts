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
import { AuthGuard, SkipAuth } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { PlaylistsService } from './playlists.service';
import { createPlaylistDto } from './dto/create-playlist.dto';
import { updatePlaylistDto } from './dto';
import { reorderPlaylistDto } from './dto/reorder-playlist';

@UseGuards(AuthGuard)
@Controller('playlists')
export class PlaylistsController {
  constructor(private playlistService: PlaylistsService) {}

  @SkipAuth()
  @HttpCode(HttpStatus.OK)
  @Get(':playlistId')
  getPlaylist(@Param('playlistId', ParseIntPipe) playlistId: number) {
    return this.playlistService.getPlaylist(playlistId);
  }

  @SkipAuth()
  @Get('user/:username')
  getPlaylistsByUsername(@Param('username') username: string) {
    return this.playlistService.getPlaylistsByUsername(username);
  }
  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  createPlaylist(
    @GetUser('id') userId: number,
    @Body() dto: createPlaylistDto,
  ) {
    return this.playlistService.createPlaylist(userId, dto);
  }

  @Patch(':playlistId/song/add/:songId')
  addSongToPlaylist(
    @GetUser('id') userId: number,
    @Param('playlistId', ParseIntPipe) playlistId: number,
    @Param('songId', ParseIntPipe) songId: number,
  ) {
    return this.playlistService.addSongToPlaylist(userId, playlistId, songId);
  }

  @Patch('/favorite/toggle/:playlistId')
  toggleAddPlaylistToFavorites(
    @GetUser('id') userId: number,
    @Param('playlistId', ParseIntPipe) playlistId: number,
  ) {
    return this.playlistService.handleTogglePlaylistLike(userId, playlistId);
  }

  @Delete(':playlistId/song/remove/:songId')
  removeSongFromPlaylist(
    @GetUser('id') userId: number,
    @Param('playlistId', ParseIntPipe) playlistId: number,
    @Param('songId', ParseIntPipe) songId: number,
  ) {
    return this.playlistService.removeSongFromPlaylist(
      userId,
      playlistId,
      songId,
    );
  }

  @Patch('update/:playlistId')
  updatePlaylist(
    @GetUser('id') userId: number,
    @Param('playlistId', ParseIntPipe) playlistId: number,
    @Body() dto: updatePlaylistDto,
  ) {
    return this.playlistService.updatePlaylist(userId, playlistId, dto);
  }

  @Patch('reorder/:playlistId')
  reorderPlaylist(
    @GetUser('id') userId: number,
    @Param('playlistId', ParseIntPipe) playlistId,
    @Body() dto: reorderPlaylistDto,
  ) {
    return this.playlistService.reorderPlaylist(userId, playlistId, dto);
  }

  @Delete('delete/:playlistId')
  deletePlaylist(
    @GetUser('id') userId: number,
    @Param('playlistId', ParseIntPipe) playlistId: number,
  ) {
    return this.playlistService.deletePlaylist(userId, playlistId);
  }
}
