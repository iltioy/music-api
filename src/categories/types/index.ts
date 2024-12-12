import { FormattedPlaylist } from 'src/playlists/types';
import { FormattedUser } from 'src/users/types';

export interface FormattedCategory {
  id: number;
  name: string;
  owner: FormattedUser;
  playlists: FormattedPlaylist[];
}
