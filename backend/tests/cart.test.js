const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../index");

const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/shopkart_test";

describe("Lab 05: Add to Cart", () => {
  let authCookie;
  let product;

  const sampleCustomer = {
    fullName: "Cart User",
    email: "cart@gmail.com",
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

    // Create a product with stock
    product = await Product.create({
      name: "Mechanical Keyboard",
      description: "RGB mechanical keyboard",
      price: 2999,
      category: "Electronics",
      image: "https://example.com/keyboard.jpg",
      stock: 10,
    });

    // Register customer
    await request(app)
      .post("/customers/register")
      .send(sampleCustomer);

    // Login customer
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

  it("should add a product to cart", async () => {
    const response = await request(app)
      .post(`/cart/${product._id}`)
      .set("Cookie", authCookie);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should increase quantity when adding the same product again", async () => {
    await request(app)
      .post(`/cart/${product._id}`)
      .set("Cookie", authCookie);

    await request(app)
      .post(`/cart/${product._id}`)
      .set("Cookie", authCookie);

    const customer = await Customer.findOne({
      email: sampleCustomer.email,
    });

    expect(customer.cart.length).toBe(1);
    expect(customer.cart[0].quantity).toBe(2);
  });

it("should return populated cart with subtotal", async () => {
  // Add product twice
  await request(app)
    .post(`/cart/${product._id}`)
    .set("Cookie", authCookie);

  await request(app)
    .post(`/cart/${product._id}`)
    .set("Cookie", authCookie);

  // Get cart
  const response = await request(app)
    .get("/cart")
    .set("Cookie", authCookie);

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);

  // One unique product in cart
  expect(response.body.count).toBe(1);

  // Product should be populated
  expect(response.body.cart[0].product.name).toBe(
    "Mechanical Keyboard"
  );

  // Quantity should be 2
  expect(response.body.cart[0].quantity).toBe(2);

  // 2999 × 2
  expect(response.body.subtotal).toBe(5998);
});

it("should update cart quantity", async () => {
  // Add product to cart
  await request(app)
    .post(`/cart/${product._id}`)
    .set("Cookie", authCookie);

  // Update quantity to 5
  const response = await request(app)
    .put(`/cart/${product._id}`)
    .set("Cookie", authCookie)
    .send({
      quantity: 5,
    });

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);

  // Verify database
  const customer = await Customer.findOne({
    email: sampleCustomer.email,
  });

  expect(customer.cart.length).toBe(1);
  expect(customer.cart[0].quantity).toBe(5);
});


it("should reject quantity less than 1", async () => {
  // Add product first
  await request(app)
    .post(`/cart/${product._id}`)
    .set("Cookie", authCookie);

  // Try to set quantity to 0
  const response = await request(app)
    .put(`/cart/${product._id}`)
    .set("Cookie", authCookie)
    .send({
      quantity: 0,
    });

  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
});


it("should reject updating a product that is not in the cart", async () => {
  const response = await request(app)
    .put(`/cart/${product._id}`)
    .set("Cookie", authCookie)
    .send({
      quantity: 5,
    });

  expect(response.status).toBe(404);
  expect(response.body.success).toBe(false);
});
it("should remove a product from cart", async () => {
  // Add product to cart
  await request(app)
    .post(`/cart/${product._id}`)
    .set("Cookie", authCookie);

  // Remove product
  const response = await request(app)
    .delete(`/cart/${product._id}`)
    .set("Cookie", authCookie);

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);

  // Verify product was removed
  const customer = await Customer.findOne({
    email: sampleCustomer.email,
  });

  expect(customer.cart.length).toBe(0);
});


it("should reject removing a product that is not in cart", async () => {
  const response = await request(app)
    .delete(`/cart/${product._id}`)
    .set("Cookie", authCookie);

  expect(response.status).toBe(404);
  expect(response.body.success).toBe(false);
});
it("should reject quantity beyond available stock", async () => {
  // Set stock to 1
  product.stock = 1;
  await product.save();

  // First addition should work
  const firstResponse = await request(app)
    .post(`/cart/${product._id}`)
    .set("Cookie", authCookie);

  expect(firstResponse.status).toBe(200);

  // Second addition should fail
  const secondResponse = await request(app)
    .post(`/cart/${product._id}`)
    .set("Cookie", authCookie);

  expect(secondResponse.status).toBe(400);
  expect(secondResponse.body.success).toBe(false);
});
it("should clear the entire cart", async () => {
  // Add product to cart
  await request(app)
    .post(`/cart/${product._id}`)
    .set("Cookie", authCookie);

  // Clear cart
  const response = await request(app)
    .delete("/cart")
    .set("Cookie", authCookie);

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);

  // Verify cart is empty
  const customer = await Customer.findOne({
    email: sampleCustomer.email,
  });

  expect(customer.cart.length).toBe(0);
});


it("should allow clearing an already empty cart", async () => {
  const response = await request(app)
    .delete("/cart")
    .set("Cookie", authCookie);

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);

  const customer = await Customer.findOne({
    email: sampleCustomer.email,
  });

  expect(customer.cart.length).toBe(0);
});
it("should drop cart items whose product no longer exists instead of crashing", async () => {
  await request(app)
    .post(`/cart/${product._id}`)
    .set("Cookie", authCookie);

  // e.g. products re-seeded with new IDs
  await Product.deleteMany({});

  const response = await request(app)
    .get("/cart")
    .set("Cookie", authCookie);

  expect(response.status).toBe(200);
  expect(response.body.cart).toEqual([]);
  expect(response.body.subtotal).toBe(0);
});
});
