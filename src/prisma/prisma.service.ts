import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })
  }

  async onModuleInit() {
    await this.$connect();
  }

  cleanDb() {
    return this.$transaction([
      this.user.deleteMany(),
      this.song.deleteMany(),
      this.playlist.deleteMany(),
      this.category.deleteMany(),
      this.image.deleteMany(),
      this.orderedCategory.deleteMany(),
      this.orderedPlaylist.deleteMany(),
      this.orderedSong.deleteMany(),
      this.chart.deleteMany()
    ])
  }
}
