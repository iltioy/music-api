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
  },
};

export { IMAGE_QUERY, USER_QUERY };
