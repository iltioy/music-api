import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { CategoriesFormatter } from 'src/categories/categories.formatter';
import { PlaylistsFormatter } from 'src/playlists/playlists.formatter';
import { PrismaService } from 'src/prisma/prisma.service';
import { FormattedChart } from './types';

@Injectable()
export class ChartFormatter {
  constructor(
    private prisma: PrismaService,
    private categoriesFormatter: CategoriesFormatter,
  ) {}

  async format(cata: Category[]): Promise<FormattedChart> {
    const categoriesIds = cata.map((category) => category.id);

    const categories = await this.prisma.category.findMany({
      where: {
        id: {
          in: categoriesIds,
        },
      },
      orderBy: {
        order: 'desc',
      },
    });

    const formattedCategories = await this.categoriesFormatter.formatMany(
      categories,
    );

    return {
      name: categories[0]?.chart_type,
      categories: formattedCategories,
    };
  }
}
