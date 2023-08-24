import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PlaylistsModule } from './playlists/playlists.module';
import { SongsModule } from './songs/songs.module';
import { FilesModule } from './files/files.module';
import { AwsModule } from './aws/aws.module';
import { ChartModule } from './chart/chart.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PlaylistsModule,
    SongsModule,
    FilesModule,
    AwsModule,
    ChartModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
