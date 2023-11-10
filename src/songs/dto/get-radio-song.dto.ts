import { IsNotEmpty } from 'class-validator';

enum Genre {
  hipHop = 'hipHop',
  pop = 'pop',
  rap = 'rap',
}

enum Mood {
  calm = 'calm',
  cheerful = 'cheerful',
  sad = 'sad',
}

enum Language {
  russian = 'russian',
  english = 'english',
  nowords = 'nowords',
}

export class getRadioSongDto {
  @IsNotEmpty()
  genres: Genre[];

  @IsNotEmpty()
  moods: Mood[];

  @IsNotEmpty()
  languages: Language[];
}
