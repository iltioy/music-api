import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { AuthGuard, SkipAuth } from 'src/auth/guard';
import { createCategoryDto } from './dto/create-category.dto';
import { updateCategoryDto } from './dto';

UseGuards(AuthGuard);
@Controller('categories')
export class CategoriesController {
  @SkipAuth()
  @Get(':categoryId')
  getCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {}

  @Post('create')
  createCategory(@GetUser('id') userId: number, dto: createCategoryDto) {}

  @Patch('update/:categoryId')
  updateCategory(
    @GetUser('id') userId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    dto: updateCategoryDto,
  ) {}

  @Patch(':categoryId/playlist/add/:playlistId')
  addPlaylistToCategory(
    @GetUser('id') userId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Param('playlistId', ParseIntPipe) playlistId: number,
  ) {}

  @Delete(':categoryId/playlist/remove/:playlistId')
  removePlaylistFromCategory(
    @GetUser('id') userId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Param('playlistId', ParseIntPipe) playlistId: number,
  ) {}

  @Delete('delete/:categoryId')
  removeCategory(
    @GetUser('id') userId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ) {}
}
