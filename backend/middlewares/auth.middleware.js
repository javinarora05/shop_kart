const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token missing",
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default_shopkart_jwt_secret"
      );
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid or expired token",
      });
    }

    // Find customer in MongoDB
    const customer = await Customer.findById(decoded.id).select("-password");
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Customer not found",
      });
    }

    // Attach customer object to req.user
    req.user = customer;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error in authentication middleware",
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
