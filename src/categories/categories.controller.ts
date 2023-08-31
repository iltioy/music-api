import {
  Body,
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
import { AuthGuard, Roles, SkipAuth } from 'src/auth/guard';
import { createCategoryDto } from './dto/create-category.dto';
import { updateCategoryDto } from './dto';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get(':categoryId')
  getCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.categoriesService.getCategory(categoryId);
  }

  @UseGuards(AuthGuard)
  @Post('create')
  createCategory(
    @GetUser('id') userId: number,
    @Body() dto: createCategoryDto,
  ) {
    return this.categoriesService.createCategory(userId, dto);
  }

  @UseGuards(AuthGuard)
  @Patch('update/:categoryId')
  updateCategory(
    @GetUser('id') userId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() dto: updateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(userId, categoryId, dto);
  }

  @UseGuards(AuthGuard)
  @Patch(':categoryId/playlist/add/:playlistId')
  addPlaylistToCategory(
    @GetUser('id') userId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Param('playlistId', ParseIntPipe) playlistId: number,
  ) {
    return this.categoriesService.addPlaylistToCategory(
      userId,
      categoryId,
      playlistId,
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':categoryId/playlist/remove/:playlistId')
  removePlaylistFromCategory(
    @GetUser('id') userId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Param('playlistId', ParseIntPipe) playlistId: number,
  ) {
    return this.categoriesService.removePlaylistFromCategory(
      userId,
      categoryId,
      playlistId,
    );
  }

  @UseGuards(AuthGuard)
  @Delete('delete/:categoryId')
  removeCategory(
    @GetUser('id') userId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ) {
    return this.categoriesService.deleteCategory(userId, categoryId);
  }
}
