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
import { CategoriesService } from './categories.service';

UseGuards(AuthGuard);
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @SkipAuth()
  @Get(':categoryId')
  getCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.categoriesService.getCategory(categoryId);
  }

  @Post('create')
  createCategory(@GetUser('id') userId: number, dto: createCategoryDto) {
    return this.categoriesService.createCategory(userId, dto);
  }

  @Patch('update/:categoryId')
  updateCategory(
    @GetUser('id') userId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    dto: updateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(userId, categoryId, dto);
  }

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

  @Delete('delete/:categoryId')
  removeCategory(
    @GetUser('id') userId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ) {
    return this.categoriesService.deleteCategory(userId, categoryId);
  }
}
