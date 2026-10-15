const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../index");

const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/shopkart_test";

describe("Lab 04: Wishlist APIs", () => {
  let authCookie;
  let product;

  const sampleCustomer = {
    fullName: "Wishlist User",
    email: "wishlist@gmail.com",
    password: "password123",
    phone: "9876543210",
  };

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
    }
  });

  beforeEach(async () => {
    await Customer.deleteMany({});
    await Product.deleteMany({});

    product = await Product.create({
      name: "Mechanical Keyboard",
      description: "RGB mechanical keyboard",
      price: 2999,
      category: "Electronics",
      image: "https://example.com/keyboard.jpg",
      stock: 10,
    });

    await request(app)
      .post("/customers/register")
      .send(sampleCustomer);

    const loginResponse = await request(app)
      .post("/customers/login")
      .send({
        email: sampleCustomer.email,
        password: sampleCustomer.password,
      });

    authCookie = loginResponse.headers["set-cookie"];
  });

  afterAll(async () => {
    await Customer.deleteMany({});
    await Product.deleteMany({});
    await mongoose.connection.close();
  });

  it("should reject unauthenticated wishlist requests", async () => {
    const response = await request(app).get("/wishlist");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should add a product to wishlist", async () => {
    const response = await request(app)
      .post(`/wishlist/${product._id}`)
      .set("Cookie", authCookie);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it("should prevent duplicate wishlist products", async () => {
    await request(app)
      .post(`/wishlist/${product._id}`)
      .set("Cookie", authCookie);

    const response = await request(app)
      .post(`/wishlist/${product._id}`)
      .set("Cookie", authCookie);

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it("should return populated wishlist", async () => {
    await request(app)
      .post(`/wishlist/${product._id}`)
      .set("Cookie", authCookie);

    const response = await request(app)
      .get("/wishlist")
      .set("Cookie", authCookie);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(1);
    expect(response.body.wishlist[0].name).toBe(
      "Mechanical Keyboard"
    );
  });

  it("should remove a product from wishlist", async () => {
    await request(app)
      .post(`/wishlist/${product._id}`)
      .set("Cookie", authCookie);

    const response = await request(app)
      .delete(`/wishlist/${product._id}`)
      .set("Cookie", authCookie);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should toggle a product in and out of wishlist", async () => {
    const added = await request(app)
      .patch(`/wishlist/${product._id}/toggle`)
      .set("Cookie", authCookie);

    expect(added.status).toBe(200);
    expect(added.body.saved).toBe(true);
    expect(added.body.count).toBe(1);

    const removed = await request(app)
      .patch(`/wishlist/${product._id}/toggle`)
      .set("Cookie", authCookie);

    expect(removed.status).toBe(200);
    expect(removed.body.saved).toBe(false);
    expect(removed.body.count).toBe(0);
  });

  it("should return wishlist count", async () => {
    await request(app)
      .post(`/wishlist/${product._id}`)
      .set("Cookie", authCookie);

    const response = await request(app)
      .get("/wishlist/count")
      .set("Cookie", authCookie);

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(1);
  });
});