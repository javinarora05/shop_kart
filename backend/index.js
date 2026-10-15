require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes = require("./routes/cart.routes")
const orderRoutes = require("./routes/order.routes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopkart";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Middlewares
app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart" , cartRoutes)
app.use("/orders", orderRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ShopKart Backend Authentication & Catalog Service is running!",
  });
});

// Database connection
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log(`Connected to MongoDB successfully at ${MONGO_URI}`);
      app.listen(PORT, () => {
        console.log(`ShopKart Backend Server running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB Connection Error:", err.message);
    });
}

module.exports = app;
