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
} from '@nestjs/common';
import { SongsService } from './songs.service';
import { AuthGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { createSongDto } from './dto';
import { updateSongDto } from './dto/update-song.dto';

@Controller('songs')
export class SongsController {
  constructor(private songsService: SongsService) {}

  @Get(':songId')
  @HttpCode(HttpStatus.OK)
  getSong(@Param('songId', ParseIntPipe) songId: number) {
    return this.songsService.getSong(songId);
  }

  @Get('get/random')
  @HttpCode(HttpStatus.OK)
  getRandomSong() {
    return this.songsService.getRandomSong();
  }

  @UseGuards(AuthGuard)
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  createSong(@GetUser('id') userId: number, @Body() dto: createSongDto) {
    return this.songsService.createSong(userId, dto);
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
