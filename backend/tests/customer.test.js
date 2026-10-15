const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index");
const Customer = require("../models/customer.model");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopkart_test";

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
});

beforeEach(async () => {
  await Customer.deleteMany({});
});

afterAll(async () => {
  await Customer.deleteMany({});
  await mongoose.connection.close();
});

describe("Lab 01: Customer Authentication APIs", () => {
  const sampleCustomer = {
    fullName: "John Doe",
    email: "john@gmail.com",
    password: "john123",
    phone: "9876543210",
  };

  describe("POST /customers/register", () => {
    it("should register a new customer successfully", async () => {
      const res = await request(app)
        .post("/customers/register")
        .send(sampleCustomer);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Customer registered successfully");
      expect(res.body.customer).toBeDefined();
      expect(res.body.customer.fullName).toBe("John Doe");
      expect(res.body.customer.email).toBe("john@gmail.com");
      expect(res.body.customer.phone).toBe("9876543210");
      expect(res.body.customer.password).toBeUndefined();

      // Check database: password must be hashed
      const dbCustomer = await Customer.findOne({ email: "john@gmail.com" });
      expect(dbCustomer).not.toBeNull();
      expect(dbCustomer.password).not.toBe("john123");
      expect(dbCustomer.password.startsWith("$2")).toBe(true);
    });

    it("should fail with 400 if any required field is missing", async () => {
      const res = await request(app)
        .post("/customers/register")
        .send({
          fullName: "John Doe",
          email: "john@gmail.com",
          // missing password and phone
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should fail with 400 if password is less than 6 characters", async () => {
      const res = await request(app)
        .post("/customers/register")
        .send({
          ...sampleCustomer,
          password: "123",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should fail with 409 if email already exists", async () => {
      await request(app).post("/customers/register").send(sampleCustomer);

      const res = await request(app)
        .post("/customers/register")
        .send(sampleCustomer);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /customers/login", () => {
    beforeEach(async () => {
      await request(app).post("/customers/register").send(sampleCustomer);
    });

    it("should log in successfully with valid credentials and set HttpOnly cookie", async () => {
      const res = await request(app)
        .post("/customers/login")
        .send({
          email: "john@gmail.com",
          password: "john123",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Login successful");

      // Verify cookie
      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      const tokenCookie = cookies.find((c) => c.startsWith("token="));
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toContain("HttpOnly");
    });

    it("should return 401 with 'Invalid credentials' for incorrect password", async () => {
      const res = await request(app)
        .post("/customers/login")
        .send({
          email: "john@gmail.com",
          password: "wrongpassword",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid credentials");
    });

    it("should return 401 with 'Invalid credentials' for unregistered email", async () => {
      const res = await request(app)
        .post("/customers/login")
        .send({
          email: "nonexistent@gmail.com",
          password: "password123",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid credentials");
    });
  });

  describe("GET /customers/me", () => {
    let authCookie;

    beforeEach(async () => {
      await request(app).post("/customers/register").send(sampleCustomer);
      const loginRes = await request(app).post("/customers/login").send({
        email: "john@gmail.com",
        password: "john123",
      });
      authCookie = loginRes.headers["set-cookie"];
    });

    it("should return current customer profile when authenticated", async () => {
      const res = await request(app)
        .get("/customers/me")
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body.fullName).toBe("John Doe");
      expect(res.body.email).toBe("john@gmail.com");
      expect(res.body.phone).toBe("9876543210");
      expect(res.body.password).toBeUndefined();
    });

    it("should return 401 Unauthorized if token cookie is missing", async () => {
      const res = await request(app).get("/customers/me");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 Unauthorized if token is invalid", async () => {
      const res = await request(app)
        .get("/customers/me")
        .set("Cookie", ["token=invalid_token_string; Path=/"]);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /customers/logout", () => {
    it("should clear the authentication cookie", async () => {
      await request(app).post("/customers/register").send(sampleCustomer);
      const loginRes = await request(app).post("/customers/login").send({
        email: "john@gmail.com",
        password: "john123",
      });
      const authCookie = loginRes.headers["set-cookie"];

      const res = await request(app)
        .post("/customers/logout")
        .set("Cookie", authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Logged out successfully");

      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
    });
  });

  describe("Bonus: PATCH /customers/change-password", () => {
    it("should allow changing password when authenticated", async () => {
      await request(app).post("/customers/register").send(sampleCustomer);
      const loginRes = await request(app).post("/customers/login").send({
        email: "john@gmail.com",
        password: "john123",
      });
      const authCookie = loginRes.headers["set-cookie"];

      const res = await request(app)
        .patch("/customers/change-password")
        .set("Cookie", authCookie)
        .send({
          oldPassword: "john123",
          newPassword: "newsecretpassword",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify login with old password fails
      const oldLogin = await request(app).post("/customers/login").send({
        email: "john@gmail.com",
        password: "john123",
      });
      expect(oldLogin.status).toBe(401);

      // Verify login with new password succeeds
      const newLogin = await request(app).post("/customers/login").send({
        email: "john@gmail.com",
        password: "newsecretpassword",
      });
      expect(newLogin.status).toBe(200);
    });
  });
});
