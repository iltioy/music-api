import { Injectable } from '@nestjs/common';
import { FormattedUser } from './types';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PlaylistsFormatter } from 'src/playlists/playlists.formatter';
import { PlaylistsService } from 'src/playlists/playlists.service';

@Injectable()
export class UsersFormatter {
  constructor(
    private prisma: PrismaService,
    private playlistsFormatter: PlaylistsFormatter,
    private playlistsService: PlaylistsService,
  ) {}

  async format(userInput: User): Promise<FormattedUser> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userInput.id,
      },
      include: {
        users_to_playlists: {
          select: {
            playlist: true,
          },
        },
      },
    });

    const added_playlists_raw = (
      await this.playlistsService.getAddedPlaylists(user.id)
    ).map((el) => el.playlist);
    const liked_playlists_raw = (
      await this.playlistsService.getLikedPlaylists(user.id)
    ).map((el) => el.playlist);

    const added_playlists = await this.playlistsFormatter.formatMany(
      added_playlists_raw,
    );
    const liked_playlists = await this.playlistsFormatter.formatMany(
      liked_playlists_raw,
    );

    const playlists = user.users_to_playlists.map((el) => el.playlist);
    const formattedPlaylists = await this.playlistsFormatter.formatMany(
      playlists,
    );

    return {
      id: user.id,
      email: user.email,
      image_url: user.image_url,
      role: user.role,
      username: user.username,
      playlists: formattedPlaylists,
      added_playlists,
      liked_playlists,
    };
  }
}
