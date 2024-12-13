import { FormattedCategory } from 'src/categories/types';
import { FormattedPlaylist } from 'src/playlists/types';

export interface FormattedChart {
  name: string;
  categories: FormattedCategory[];
  playlist?: FormattedPlaylist;
}
