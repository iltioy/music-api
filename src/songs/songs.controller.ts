import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { SongsService } from './songs.service';
import { AuthGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { createSongDto } from './dto';
import { updateSongDto } from './dto/update-song.dto';
import { getRadioSongDto } from './dto/get-radio-song.dto';

@Controller('songs')
export class SongsController {
  constructor(private songsService: SongsService) {}

  @Get('get/random')
  @HttpCode(HttpStatus.OK)
  getRandomSong() {
    return this.songsService.getRandomSong();
  }

  @UseGuards(AuthGuard)
  @Post('get/radio')
  @HttpCode(HttpStatus.OK)
  getRadioSong(@Body() dto: getRadioSongDto, @GetUser('id') userId: number) {
    return this.songsService.getSongForRadio(dto, userId);
  }

  @Get('search')
  searchForSong(
    @Query('query') query: string,
    @Query('page', ParseIntPipe) page: number,
  ) {
    return this.songsService.search(query, page);
  }

  @Get(':songId')
  @HttpCode(HttpStatus.OK)
  getSong(@Param('songId', ParseIntPipe) songId: number) {
    return this.songsService.getSong(songId);
  }

  @UseGuards(AuthGuard)
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  createSong(@GetUser('id') userId: number, @Body() dto: createSongDto) {
    return this.songsService.createSong(userId, dto);
  }

  @UseGuards(AuthGuard)
  @Patch('/favorite/add/:songId')
  addSongToFavoritePlaylist(
    @GetUser('id') userId: number,
    @Param('songId', ParseIntPipe) songId: number,
  ) {
    return this.songsService.addSongToFavoritePlaylist(userId, songId);
  }

  @UseGuards(AuthGuard)
  @Patch('/favorite/toggle/:songId')
  toggleAddSongToFavorites(
    @GetUser('id') userId: number,
    @Param('songId', ParseIntPipe) songId: number,
  ) {
    return this.songsService.handleToggleSongLike(userId, songId);
  }

  @UseGuards(AuthGuard)
  @Patch('update/:songId')
  //   @HttpCode(HttpStatus.OK)
  updateSong(
    @GetUser('id') userId: number,
    @Param('songId', ParseIntPipe) songId: number,
    @Body() dto: updateSongDto,
  ) {
    return this.songsService.updateSong(userId, songId, dto);
  }

  @UseGuards(AuthGuard)
  @Delete('delete/:songId')
  deleteSong(
    @GetUser('id') userId: number,
    @Param('songId', ParseIntPipe) songId: number,
  ) {
    return this.songsService.deleteSong(userId, songId);
  }
}
