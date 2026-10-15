const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// Load the customer's cart with product details and its subtotal.
// Items whose product was deleted (e.g. after re-seeding) populate as null,
// so they are skipped instead of crashing the subtotal calculation.
const getPopulatedCart = async (customerId) => {
  const customer = await Customer.findById(customerId).populate({
    path: "cart.product",
    select: "name description price category image stock",
  });

  if (!customer) {
    return null;
  }

  const cart = customer.cart.filter((item) => item.product);
  const subtotal = cart.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  return { cart, subtotal };
};

// POST /cart/:productId
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Find product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check stock
    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    // Find logged-in customer
    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check if product already exists in cart
    const cartItem = customer.cart.find(
      (item) => item.product.toString() === productId,
    );

    // Increase quantity if product already exists
    if (cartItem) {
      // Prevent cart quantity from exceeding available stock
      if (cartItem.quantity >= product.stock) {
        return res.status(400).json({
          success: false,
          message: "Requested quantity exceeds available stock",
        });
      }
      cartItem.quantity += 1;
    } else {
      customer.cart.push({
        product: product._id,
        quantity: 1,
      });
    }

    await customer.save();

    const { cart, subtotal } = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
      subtotal,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error adding product to cart",
      error: error.message,
    });
  }
};

// GET /cart
const getCart = async (req, res) => {
  try {
    const populated = await getPopulatedCart(req.user._id);

    if (!populated) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const { cart, subtotal } = populated;

    return res.status(200).json({
      success: true,
      count: cart.length,
      subtotal,
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error fetching cart",
      error: error.message,
    });
  }
};

// PUT /cart/:productId
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Find logged-in customer
    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Find product in cart
    const cartItem = customer.cart.find(
      (item) => item.product.toString() === productId,
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items are available in stock`,
      });
    }

    // Update quantity
    cartItem.quantity = quantity;

    // Save customer
    await customer.save();

    const { cart, subtotal } = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart,
      subtotal,
    });
  } catch (error) {
    console.error("Update cart quantity error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error updating cart quantity",
      error: error.message,
    });
  }
};
// DELETE /cart/:productId
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Find logged-in customer
    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Find product in cart
    const cartIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId,
    );

    // Product doesn't exist in cart
    if (cartIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // Remove the cart item
    customer.cart.splice(cartIndex, 1);

    // Save updated customer
    await customer.save();

    const { cart, subtotal } = await getPopulatedCart(req.user._id);

return res.status(200).json({
  success: true,
  message: "Product removed from cart",
  cart,
  subtotal,
});
  } catch (error) {
    console.error("Remove from cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error removing product from cart",
      error: error.message,
    });
  }
};
// DELETE /cart
const clearCart = async (req, res) => {
  try {
    // Find logged-in customer
    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Clear all cart items
    customer.cart = [];

    // Save updated customer
    await customer.save();

    return res.status(200).json({
  success: true,
  message: "Cart cleared successfully",
  cart: [],
  subtotal: 0,
});
  } catch (error) {
    console.error("Clear cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error clearing cart",
      error: error.message,
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
};
