import { FromattedUser } from 'src/users/types';
import { FormattedSong } from 'src/songs/types';

export interface FormattedPlaylist {
  id: number;
  owner: FromattedUser;
  name: string;
  image_url: string;
  songs: FormattedSong[];
  isFavorite: boolean;
  isLiked: boolean;
}
