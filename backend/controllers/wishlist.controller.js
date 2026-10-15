const mongoose = require("mongoose")
const Customer = require("../models/customer.model")
const Product = require("../models/product.model")



const addToWishlist = async(req , res) => {
    try {
        const {productId} = req.params;


        if(!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false , 
                message: "Invalid product ID",
            })
        }

        const product = await Product.findById(productId)

        if(!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }
        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
                });
            }

        const alreadyExists  = customer.wishlist.some(
            (id) => id.toString() === productId
        )
        if (alreadyExists) {
            return res.status(409).json({
                success: false,
                message: "Product already exists in wishlist",
            });
        }
        customer.wishlist.push(product._id);

        await customer.save()

        return res.status(201).json({
            success: true,
            message: "Product added to wishlist",
        });
    }
    catch(error) {
        console.error("Add wishlist error: " , error)

        return res.status(500).json({
            success:false,
            message: "Internal server error adding product to wishlist",
            error: error.message,
        })
    }
};

const getWishlist = async (req, res) => {
  try {
    
    const customer = await Customer.findById(req.user._id)
      .populate({
        path: "wishlist",
        select: "name description price category image stock",
      });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error fetching wishlist",
      error: error.message,
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const wishlistIndex = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (wishlistIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    customer.wishlist.splice(wishlistIndex, 1);

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Remove wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error removing product from wishlist",
      error: error.message,
    });
  }
};

// Bonus +10 — Toggle Wishlist
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate Product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Make sure the product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 3. Find the currently authenticated customer
    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // 4. Check whether the product is already saved
    const wishlistIndex = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    // Product is already saved → remove it
    if (wishlistIndex !== -1) {
      customer.wishlist.splice(wishlistIndex, 1);

      await customer.save();

      return res.status(200).json({
        success: true,
        saved: false,
        message: "Product removed from wishlist",
        count: customer.wishlist.length,
      });
    }

    // Product is not saved → add it
    customer.wishlist.push(product._id);

    await customer.save();

    return res.status(200).json({
      success: true,
      saved: true,
      message: "Product added to wishlist",
      count: customer.wishlist.length,
    });
  } catch (error) {
    console.error("Toggle wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error toggling wishlist",
      error: error.message,
    });
  }
};
// Bonus +5 — Get Wishlist Count
const getWishlistCount = async (req, res) => {
  try {
    // req.user is provided by authMiddleware
    const customer = await Customer.findById(req.user._id).select(
      "wishlist"
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      count: customer.wishlist.length,
    });
  } catch (error) {
    console.error("Get wishlist count error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error fetching wishlist count",
      error: error.message,
    });
  }
};

module.exports = {
    addToWishlist, 
    getWishlist,
    removeFromWishlist,
    toggleWishlist, 
    getWishlistCount
}