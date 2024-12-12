const USER_QUERY = {
  select: {
    username: true,
    email: true,
    image_url: true,
    role: true,
  },
};

const ORDERED_SONG_QUERY_SELECT = {
  order: true,
  song: {
    include: {
      image: true,
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
      owner: USER_QUERY,
    },
  },
};

const SELECT_USERS_TO_PLAYLISTS = {
  playlist: {
    include: {
      songs_to_playlists: {
        include: {
          song: true,
        },
      },
    },
  },
};

const SELECT_USER_CATEGORIES = {
  playlists_to_categories: {
    include: {
      playlist: {
        include: {
          songs_to_playlists: {
            include: {
              song: true,
            },
          },
        },
      },
    },
  },
};

const SELECT_USER_QUERY = {
  id: true,
  role: true,
  username: true,
  email: true,
  image_url: true,
  users_to_playlists: {
    select: SELECT_USERS_TO_PLAYLISTS,
  },
  categories: {
    select: SELECT_USER_CATEGORIES,
  },
};

const SELECT_ME_USER_QUERY = {
  id: true,
  role: true,
  username: true,
  email: true,
  image: true,
  added_playlists: {
    select: {
      order: true,
      playlist: {
        include: {
          image: true,
          owner: USER_QUERY,
          songs: {
            orderBy: {
              order: 'desc',
            },
            select: ORDERED_SONG_QUERY_SELECT,
          },
        },
      },
    },
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
  USER_QUERY,
  SELECT_USER_QUERY,
  ORDERED_SONG_QUERY_SELECT,
  ORDERED_SONG_QUERY,
  ORDERED_PLAYLISY_QUERY_SELECT,
  SELECT_ME_USER_QUERY,
  SELECT_USERS_TO_PLAYLISTS,
  SELECT_USER_CATEGORIES,
};
