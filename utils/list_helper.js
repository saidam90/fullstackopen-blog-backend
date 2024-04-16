const dummy = (blogs) => {
  return 1;
};

const totalLikes = (listWithBlogs) => {
  total = 0;
  for (i = 0; i < listWithBlogs.length; i++) {
    total += listWithBlogs[i].likes;
  }
  // console.log(total);
  return total;
};

module.exports = {
  dummy,
  totalLikes,
};
