const mongoose = require("mongoose");
const Product = require("../models/product.model");

// Escape user input so characters like "(" or "+" are matched literally
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Task 2 — Create Product API
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Check for missing required fields
    if (
      !name ||
      !description ||
      price === undefined ||
      !category ||
      !image ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (name, description, price, category, image, stock)",
      });
    }

    // Validate price
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid price: Price must be greater than 0",
      });
    }

    // Validate stock
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock: Stock cannot be negative",
      });
    }

    const product = await Product.create({
      name,
      description,
      price: numPrice,
      category,
      image,
      stock: numStock,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error creating product",
      error: error.message,
    });
  }
};

// Task 3 & Task 5 — Get All Products API with Search & Category Filter & Sorting
const getAllProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    const query = {};

    // Search query (case-insensitive on name)
    if (search && search.trim() !== "") {
      query.name = { $regex: escapeRegex(search.trim()), $options: "i" };
    }

    // Category filter (ignore 'All' or empty)
    if (category && category.trim() !== "" && category.toLowerCase() !== "all") {
      query.category = { $regex: new RegExp(`^${escapeRegex(category.trim())}$`, "i") };
    }

    // Sorting (Bonus Challenge)
    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1 };
    }

    const products = await Product.find(query)
      .sort(sortOption)
      .select("_id name description price category image stock createdAt");

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching products",
      error: error.message,
    });
  }
};

// Task 4 — Get Single Product API
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const productObj = product.toObject();
    return res.status(200).json({
      success: true,
      product: productObj,
      ...productObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching product",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
};
