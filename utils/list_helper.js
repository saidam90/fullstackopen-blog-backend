const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  total = 0;
  for (i = 0; i < blogs.length; i++) {
    total += blogs[i].likes;
  }
  // console.log(total);
  return total;
};

const favoriteBlog = (blogs) => {
  let likes = [];
  for (i = 0; i < blogs.length; i++) {
    likes.push(blogs[i].likes);
  }
  const favorite = Math.max(...likes);

  for (i = 0; i < blogs.length; i++) {
    if (favorite === blogs[i].likes) {
      return blogs.indexOf(blogs[i]);
      // console.log(blogs.indexOf(blogs[i]));
    }
  }
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
