import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FormattedCategory } from './types';
import { Category } from '@prisma/client';
import { PlaylistsFormatter } from 'src/playlists/playlists.formatter';

@Injectable()
export class CategoriesFormatter {
  constructor(
    private prisma: PrismaService,
    private playlistsFormatter: PlaylistsFormatter,
  ) {}

  async format(categoryInput: Category): Promise<FormattedCategory> {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryInput.id,
      },
      include: {
        playlists_to_categories: {
          include: {
            playlist: true,
          },
          orderBy: {
            order: 'desc',
          },
        },
      },
    });

    const playlits = category.playlists_to_categories.map((el) => el.playlist);
    const formattedPlaylists = await this.playlistsFormatter.formatMany(
      playlits,
    );

    return {
      id: category.id,
      name: category.name,
      playlists: formattedPlaylists,
    };
  }

  async formatMany(categoriesInput: Category[]): Promise<FormattedCategory[]> {
    const ids = categoriesInput.map((el) => el.id);

    const categories = await this.prisma.category.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        playlists_to_categories: {
          include: {
            playlist: true,
          },
          orderBy: {
            order: 'desc',
          },
        },
      },
      orderBy: {
        order: 'desc',
      },
    });

    const formattedCategories: FormattedCategory[] = [];

    for (let category of categories) {
      let playlits = category.playlists_to_categories.map((el) => el.playlist);
      let formattedPlaylists = await this.playlistsFormatter.formatMany(
        playlits,
      );

      let formattedCategory: FormattedCategory = {
        id: category.id,
        name: category.name,
        playlists: formattedPlaylists,
      };

      formattedCategories.push(formattedCategory);
    }

    return formattedCategories;
  }
}
