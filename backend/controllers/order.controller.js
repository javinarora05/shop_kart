const mongoose = require("mongoose");
const crypto = require("crypto");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const razorpay = require("../config/razorpay");

// Create a pending ShopKart order
const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // 1. Validate shipping address exists
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    // 2. Validate all shipping fields
    const { fullName, phone, addressLine1, city, state, pincode } =
      shippingAddress;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !addressLine1?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All shipping address fields are required",
      });
    }

    // 3. Validate pincode
    if (!/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Pincode must be exactly 6 digits",
      });
    }

    // 4. Validate authenticated user
    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // 5. Check cart
    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // 6. Prepare order items
    const orderItems = [];
    let totalAmount = 0;

    // 7. Load latest product data
    for (const cartItem of customer.cart) {
      if (!mongoose.Types.ObjectId.isValid(cartItem.product)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product in cart",
        });
      }

      const product = await Product.findById(cartItem.product);

      // Product may have been deleted after being added to cart
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "A product in your cart no longer exists",
        });
      }

      // 8. Final stock verification
      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      // 9. Create historical snapshot
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });

      // 10. Calculate total using latest backend price
      totalAmount += product.price * cartItem.quantity;
    }

    // 11. Create pending ShopKart order
    const order = await Order.create({
      user: customer._id,
      items: orderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      },
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    // Razorpay integration comes in the next stage.
    // For now, return the pending ShopKart order.
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: order._id.toString(),
    });

    // Save Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // Return safe checkout data
    return res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create payment order error:", error);

    if (error?.statusCode === 401 || error?.code === "BAD_REQUEST_ERROR") {
      return res.status(401).json({
        success: false,
        message:
          "Razorpay authentication failed. Check your Razorpay key ID and secret in backend/.env.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error creating order",
      error: error.message,
    });
  }
};
const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // 1. Validate required payment details
    if (
      !shopKartOrderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required",
      });
    }

    // 2. Find the ShopKart order
    const order = await Order.findById(shopKartOrderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 3. Make sure this order belongs to the logged-in user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to verify this order",
      });
    }

    // 4. Use the Razorpay Order ID stored in our database
    const body =
      order.razorpayOrderId + "|" + razorpay_payment_id;

    // 5. Generate expected signature
    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body)
      .digest("hex");

    // 6. Compare signatures
    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = "FAILED";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // 7. Make sure Razorpay order ID matches our stored order
    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID mismatch",
      });
    }

    // 8. Payment is verified
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;

    await order.save();

    // 9. Clear the user's cart only after verification
    const customer = await Customer.findById(req.user._id);

    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error verifying payment",
      error: error.message,
    });
  }
};
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching orders",
    });
  }
};
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Users can only access their own orders
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this order",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching order",
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders, 
  getOrderById
};
