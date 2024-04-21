const { test, after, beforeEach } = require("node:test");
const assert = require("node:assert"); // Import assert module
const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const api = supertest(app);
require("express-async-errors");

const helper = require("./test_helper");

const Blog = require("../models/blog");

beforeEach(async () => {
  await Blog.deleteMany({});
  console.log("Database cleared");

  for (let blogData of helper.initialBlogs) {
    let blogObject = new Blog(blogData);
    await blogObject.save();
  }
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all blogs are returned", async () => {
  const response = await api.get("/api/blogs");
  // console.log(response.body);

  assert.strictEqual(response.body.length, helper.initialBlogs.length);
});

test("the unique identifier property is named id", async () => {
  const response = await api.get("/api/blogs");

  const id = response.body.every((blog) => "id" in blog);
  assert(id);
});

test("a valid blog can be added", async () => {
  const newBlog = {
    title: "Mom's story",
    author: "Mom",
    url: "medium.com",
    likes: 15,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

  const authors = blogsAtEnd.map((blog) => blog.author);
  assert(authors.includes("Mom"));
});

test("blog without content is not added", async () => {
  const newBlog = {};

  await api //break
    .post("/api/blogs")
    .send(newBlog)
    .expect(400);

  const blogsAtEnd = await helper.blogsInDb();
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
});

test("a specific blog can be viewed", async () => {
  const blogsAtStart = await helper.blogsInDb();

  const blogToView = blogsAtStart[0];

  const resultBlog = await api
    .get(`/api/blogs/${blogToView.id}`)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  assert.deepStrictEqual(resultBlog.body, blogToView);
});

test("a blog can be deleted", async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToDelete = blogsAtStart[0];

  await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

  const blogsAtEnd = await helper.blogsInDb();

  const authors = blogsAtEnd.map((blog) => blog.author);
  assert(!authors.includes(blogToDelete.author));

  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);
});

after(async () => {
  await mongoose.connection.close();
});
