import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PlaylistsModule } from 'src/playlists/playlists.module';
import { UsersFormatter } from './users.formatter';

@Module({
  imports: [PlaylistsModule],
  providers: [UsersService, UsersFormatter],
  exports: [UsersService, UsersFormatter],
  controllers: [UsersController],
})
export class UsersModule {}
