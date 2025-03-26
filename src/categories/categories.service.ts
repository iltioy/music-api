import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ORDERED_PLAYLISY_QUERY_SELECT,
  ORDERED_SONG_QUERY_SELECT,
  USER_QUERY,
} from 'src/queries';
import { createCategoryDto, updateCategoryDto } from './dto';
import { CategoriesFormatter } from './categories.formatter';
import { reorderCategoryDto } from './dto/reorder-category';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private categoriesFormatter: CategoriesFormatter,
  ) {}

  async getCategory(categoryId: number) {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        playlists_to_categories: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!category) throw new NotFoundException();

    return this.categoriesFormatter.format(category);
  }

  async getAllCategories() {
    const categories = await this.prisma.category.findMany({});
    return this.categoriesFormatter.formatMany(categories);
  }

  async createCategory(userId: number, dto: createCategoryDto) {
    await this.checkAdmin(userId);
    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        order: 1,
      },
    });

    if (!category) throw new BadRequestException();

    return this.categoriesFormatter.format(category);
  }

  async updateCategory(
    userId: number,
    categoryId: number,
    dto: updateCategoryDto,
  ) {
    const category = await this.checkIfCategoryExists(categoryId);

    await this.checkAccess(userId);

    const updatedCategory = await this.prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name: dto.name,
      },
    });

    return this.categoriesFormatter.format(updatedCategory);
  }

  async addPlaylistToCategory(
    userId: number,
    categoryId: number,
    playlistId: number,
  ) {
    const category = await this.checkIfCategoryExists(categoryId);
    await this.checkAccess(userId);

    let isInCategory = false;

    category.playlists_to_categories.forEach((playlist) => {
      if (playlist.playlist_id === playlistId) {
        isInCategory = true;
      }
    });

    const playlist = await this.prisma.playlist.findMany({
      where: {
        id: playlistId,
      },
    });

    if (playlist.length === 0) {
      throw new NotFoundException('Playlist was not found!');
    }

    if (isInCategory) throw new BadRequestException();

    const updatedCategory = await this.prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        playlists_to_categories: {
          create: {
            order: category.playlists_to_categories.length + 1,
            playlist_id: playlistId,
          },
        },
      },
    });

    return this.categoriesFormatter.format(updatedCategory);
  }

  async removePlaylistFromCategory(
    userId: number,
    categoryId: number,
    playlistId: number,
  ) {
    const category = await this.checkIfCategoryExists(categoryId);

    await this.checkAccess(userId);

    const updatedCategory = await this.prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        playlists_to_categories: {
          deleteMany: {
            playlist_id: playlistId,
          },
        },
      },
    });

    return this.categoriesFormatter.format(updatedCategory);
  }

  async reorderCategory(
    userId: number,
    categoryId: number,
    dto: reorderCategoryDto,
  ) {
    console.log('Пре');
    await this.checkIfCategoryExists(categoryId);
    console.log('Кол');

    await this.checkAccess(userId);
    console.log('Дес');

    let highestOrder = dto.playlists.length;

    console.log({ playlists: dto.playlists });

    const promises = dto.playlists.map(async (playlist, index) => {
      if (!playlist || !playlist.id) return;
      await this.prisma.playlists_to_categories.updateMany({
        data: {
          order: highestOrder - index,
        },
        where: {
          category_id: categoryId,
          playlist_id: playlist.id,
        },
      });
    });

    await Promise.all(promises);

    return { success: true };
  }

  async deleteCategory(userId: number, categoryId: number) {
    const category = await this.checkIfCategoryExists(categoryId);

    await this.checkAccess(userId);

    const deletedCategory = await this.prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    return deletedCategory;
  }

  async checkIfCategoryExists(categoryId: number) {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        playlists_to_categories: {
          include: {
            playlist: true,
          },
        },
      },
    });

    if (!category) throw new NotFoundException();

    return category;
  }

  async checkAccess(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user.role === 'admin') return;
    throw new ForbiddenException();
  }

  async checkAdmin(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user.role === 'admin') return;
    throw new ForbiddenException();
  }
}
