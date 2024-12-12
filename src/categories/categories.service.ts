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

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

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
          select: ORDERED_PLAYLISY_QUERY_SELECT,
        },
      },
    });

    if (!category) throw new NotFoundException();

    return category;
  }

  async getAllCategories() {
    const categories = await this.prisma.category.findMany({
      include: {
        playlists_to_categories: {
          orderBy: {
            order: 'asc',
          },
          select: {
            order: true,
            playlist: {
              include: {
                owner: USER_QUERY,
                songs_to_playlists: {
                  orderBy: {
                    order: 'desc',
                  },
                  include: {
                    song: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return categories;
  }

  async createCategory(userId: number, dto: createCategoryDto) {
    await this.checkAdmin(userId);
    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        owner_id: userId,
      },
    });

    if (!category) throw new BadRequestException();

    return category;
  }

  async updateCategory(
    userId: number,
    categoryId: number,
    dto: updateCategoryDto,
  ) {
    const category = await this.checkIfCategoryExists(categoryId);

    await this.checkAccess(userId, category.owner_id);

    const updatedCategory = await this.prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name: dto.name,
      },
      include: {
        playlists_to_categories: {
          orderBy: {
            order: 'asc',
          },
          include: {
            playlist: {
              include: {
                songs_to_playlists: {
                  include: {
                    song: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return updatedCategory;
  }

  async addPlaylistToCategory(
    userId: number,
    categoryId: number,
    playlistId: number,
  ) {
    const category = await this.checkIfCategoryExists(categoryId);
    await this.checkAccess(userId, category.owner_id);

    let isInCategory = false;

    category.playlists_to_categories.forEach((playlist) => {
      if (playlist.playlist_id === playlistId) {
        isInCategory = true;
      }
    });

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
      include: {
        playlists_to_categories: {
          orderBy: {
            order: 'asc',
          },
          include: {
            playlist: true,
          },
        },
      },
    });

    return updatedCategory;
  }

  async removePlaylistFromCategory(
    userId: number,
    categoryId: number,
    playlistId: number,
  ) {
    const category = await this.checkIfCategoryExists(categoryId);

    await this.checkAccess(userId, category.owner_id);

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
      include: {
        playlists_to_categories: {
          orderBy: {
            order: 'asc',
          },
          select: ORDERED_PLAYLISY_QUERY_SELECT,
        },
      },
    });

    return updatedCategory;
  }

  async deleteCategory(userId: number, categoryId: number) {
    const category = await this.checkIfCategoryExists(categoryId);

    await this.checkAccess(userId, category.owner_id);

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

  async checkAccess(userId: number, ownerId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (userId === ownerId || user.role === 'admin') return;
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
