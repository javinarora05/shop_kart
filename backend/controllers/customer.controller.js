const bcrypt = require("bcrypt");
const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");

// Task 1 — Register a Customer
const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Check for missing fields
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields (fullName, email, password, phone) are required",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save customer
    const newCustomer = await Customer.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
    });

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        "_id": newCustomer._id,
        fullName: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error during registration",
      error: error.message,
    });
  }
};

// Task 2 — Login
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find customer by email
    const customer = await Customer.findOne({ email: email.toLowerCase() });
    if (!customer) {
      // Do not reveal whether email or password was incorrect
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare password with bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT
    const token = generateToken(customer._id);

    // Set HttpOnly cookie
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error during login",
      error: error.message,
    });
  }
};

// Task 3 — My Profile
const getMyProfile = async (req, res) => {
  try {
    // req.user was attached by authMiddleware without password
    const customer = req.user;
    return res.status(200).json({
      _id: customer._id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching profile",
      error: error.message,
    });
  }
};

// Task 4 — Logout
const logoutCustomer = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error during logout",
      error: error.message,
    });
  }
};

// Bonus Challenge (+10 Marks) — Change Password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least 6 characters",
      });
    }

    // Retrieve full customer document including password
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, customer.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect old password",
      });
    }

    // Hash new password
    customer.password = await bcrypt.hash(newPassword, 10);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error changing password",
      error: error.message,
    });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword,
};
