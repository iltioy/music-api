import { FormattedUser } from 'src/users/types';
import { FormattedSong } from 'src/songs/types';

export interface FormattedPlaylist {
  id: number;
  owner: FormattedUser;
  name: string;
  image_url: string;
  songs: FormattedSong[];
  is_favorite: boolean;
  is_liked: boolean;
}
