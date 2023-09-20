const IMAGE_QUERY = {
  select: {
    image_key: true,
    image_url: true,
  },
};

const USER_QUERY = {
  select: {
    username: true,
    email: true,
    image: IMAGE_QUERY,
    role: true,
  },
};

const ORDERED_SONG_QUERY_SELECT = {
  order: true,
  song: {
    include: {
      image: IMAGE_QUERY,
    },
  },
};

const ORDERED_SONG_QUERY = {
  orderBy: {
    order: 'asc',
  },
  select: ORDERED_SONG_QUERY_SELECT,
};

const ORDERED_PLAYLISY_QUERY_SELECT = {
  order: true,
  playlist: {
    include: {
      image: IMAGE_QUERY,
      owner: USER_QUERY,
    },
  },
};

const SELECT_USER_QUERY = {
  id: true,
  role: true,
  username: true,
  email: true,
  image: IMAGE_QUERY,
  added_playlists: {
    select: ORDERED_PLAYLISY_QUERY_SELECT,
  },
  liked_playlists: {
    select: ORDERED_PLAYLISY_QUERY_SELECT,
  },
  categories: {
    select: {
      playlists: {
        select: ORDERED_PLAYLISY_QUERY_SELECT,
      },
      name: true,
    },
  },
};

export {
  IMAGE_QUERY,
  USER_QUERY,
  SELECT_USER_QUERY,
  ORDERED_SONG_QUERY_SELECT,
  ORDERED_SONG_QUERY,
  ORDERED_PLAYLISY_QUERY_SELECT,
};
