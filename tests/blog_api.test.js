const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert"); // Import assert module
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const bcrypt = require("bcrypt");

require("express-async-errors");

const helper = require("./test_helper");

const Blog = require("../models/blog");
const User = require("../models/user");

describe("when there is initially some blogs saved", () => {
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

  describe("viewing a specific blog", () => {
    test("a specific blog can be viewed", async () => {
      const blogsAtStart = await helper.blogsInDb();

      const blogToView = blogsAtStart[0];

      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      assert.deepStrictEqual(resultBlog.body, blogToView);
    });

    test("the unique identifier property is named id", async () => {
      const response = await api.get("/api/blogs");

      const id = response.body.every((blog) => "id" in blog);
      assert(id);
    });

    test("return 0 if likes property is missed", async () => {
      const newBlog = {
        title: "Example Blog",
        author: "Example author",
        url: "https://example.com",
      };

      await api //break
        .post("/api/blogs")
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();

      const addedBlog = blogsAtEnd.find((blog) => blog.title === newBlog.title);

      assert.strictEqual(addedBlog.likes, 0);
    });
  });

  describe("viewing a specific blog", () => {
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
  });

  describe("deletion of a blog", () => {
    test("a blog can be deleted", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToDelete = blogsAtStart[0];

      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

      const blogsAtEnd = await helper.blogsInDb();

      const authors = blogsAtEnd.map((blog) => blog.author);
      assert(!authors.includes(blogToDelete.author));

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);
    });
  });
});

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "salainen",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert(result.body.error.includes("expected `username` to be unique"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});
