const express = require("express");

const router = express.Router();

const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");

const authMiddleware = require("../middlewares/auth.middleware");

// GET /cart
router.get(
  "/",
  authMiddleware,
  getCart
);

// POST /cart/:productId
router.post(
  "/:productId",
  authMiddleware,
  addToCart
);
router.put("/:productId" , authMiddleware , updateCartQuantity)

router.delete("/:productId" , authMiddleware , removeFromCart)
router.delete("/" , authMiddleware , clearCart)

module.exports = router;