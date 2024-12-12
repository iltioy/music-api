import { FormattedPlaylist } from 'src/playlists/types';

export interface FormattedUser {
  id: number;
  email: string;
  username: string;
  role: string;
  image_url: string;
  playlists?: FormattedPlaylist[];
  added_playlists?: FormattedPlaylist[];
  liked_playlists?: FormattedPlaylist[];
}
