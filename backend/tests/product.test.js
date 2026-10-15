const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const Product = require("../models/product.model");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopkart_test";

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
});

beforeEach(async () => {
  await Product.deleteMany({});
});

afterAll(async () => {
  await Product.deleteMany({});
  await mongoose.connection.close();
});

describe("Lab 03: Product APIs", () => {
  const sampleProduct = {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with blue switches.",
    price: 2999,
    category: "Electronics",
    image: "https://example.com/keyboard.jpg",
    stock: 10,
  };

  describe("POST /products", () => {
    it("should create a product successfully with status 201", async () => {
      const res = await request(app).post("/products").send(sampleProduct);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.product).toBeDefined();
      expect(res.body.product.name).toBe("Mechanical Keyboard");
      expect(res.body.product.price).toBe(2999);
      expect(res.body.product.stock).toBe(10);
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app).post("/products").send({
        name: "Incomplete Product",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 if price is 0 or negative", async () => {
      const res = await request(app).post("/products").send({
        ...sampleProduct,
        price: 0,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 if stock is negative", async () => {
      const res = await request(app).post("/products").send({
        ...sampleProduct,
        stock: -5,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /products", () => {
    beforeEach(async () => {
      await Product.insertMany([
        {
          name: "Mechanical Keyboard",
          description: "RGB mechanical keyboard",
          price: 2999,
          category: "Electronics",
          image: "https://example.com/keyboard.jpg",
          stock: 10,
        },
        {
          name: "Wireless Mouse",
          description: "Ergonomic optical mouse",
          price: 999,
          category: "Electronics",
          image: "https://example.com/mouse.jpg",
          stock: 25,
        },
        {
          name: "Denim Jacket",
          description: "Classic denim jacket",
          price: 2499,
          category: "Fashion",
          image: "https://example.com/jacket.jpg",
          stock: 8,
        },
      ]);
    });

    it("should return all products with count and success", async () => {
      const res = await request(app).get("/products");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(3);
      expect(res.body.products.length).toBe(3);
    });

    it("should filter products by search query (case-insensitive)", async () => {
      const res = await request(app).get("/products?search=keyboard");

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.products[0].name).toBe("Mechanical Keyboard");
    });

    it("should filter products by category", async () => {
      const res = await request(app).get("/products?category=Electronics");

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
    });

    it("should filter products by both search and category", async () => {
      const res = await request(app).get(
        "/products?search=mouse&category=Electronics"
      );

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.products[0].name).toBe("Wireless Mouse");
    });

    it("should sort products by price ascending (price_asc)", async () => {
      const res = await request(app).get("/products?sort=price_asc");

      expect(res.status).toBe(200);
      expect(res.body.products[0].price).toBe(999);
      expect(res.body.products[2].price).toBe(2999);
    });

    it("should sort products by price descending (price_desc)", async () => {
      const res = await request(app).get("/products?sort=price_desc");

      expect(res.status).toBe(200);
      expect(res.body.products[0].price).toBe(2999);
      expect(res.body.products[2].price).toBe(999);
    });
    it("should treat regex special characters in search/category literally", async () => {
      const searchRes = await request(app).get("/products?search=(");
      expect(searchRes.status).toBe(200);
      expect(searchRes.body.count).toBe(0);

      const categoryRes = await request(app).get("/products?category=Electr.nics");
      expect(categoryRes.status).toBe(200);
      expect(categoryRes.body.count).toBe(0);
    });
  });

  describe("GET /products/:id", () => {
    let createdProduct;

    beforeEach(async () => {
      createdProduct = await Product.create(sampleProduct);
    });

    it("should return a product by its valid id", async () => {
      const res = await request(app).get(`/products/${createdProduct._id}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Mechanical Keyboard");
      expect(res.body.price).toBe(2999);
    });

    it("should return 400 for an invalid MongoDB ObjectId", async () => {
      const res = await request(app).get("/products/invalid-id-123");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid product ID");
    });

    it("should return 404 for a non-existent product ID", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/products/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Product not found");
    });
  });
});
