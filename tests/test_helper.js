const Blog = require("../models/blog");
const User = require("../models/user");

const initialBlogs = [
  {
    title: "My story",
    author: "Saida",
    url: "medium.com",
    likes: 7,
  },
  {
    title: "Inara's story",
    author: "Inara",
    url: "medium.com",
    likes: 10,
  },
  {
    title: "Emil's story",
    author: "Emil",
    url: "medium.com",
    likes: 20,
  },
];

const nonExistingId = async () => {
  const blog = new Blog({
    title: "willremovethissoon",
    author: "willremovethissoon",
    url: "willremovethissoon",
    likes: 0,
  });
  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
};
