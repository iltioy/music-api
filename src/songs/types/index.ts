import { FormattedUser } from 'src/users/types';

export interface FormattedSong {
  id: number;
  name: string;
  url: string;
  author: string;
  album?: string;

  genre?: string;
  mood?: string;
  language?: string;

  image_url: string;

  owner: FormattedUser;

  order?: number;
}
