const express = require("express")

const router = express.Router();


const {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    toggleWishlist ,
    getWishlistCount,
} = require("../controllers/wishlist.controller")


const authMiddleware = require("../middlewares/auth.middleware")


router.post("/:productId" , authMiddleware , addToWishlist)

router.get("/count" , authMiddleware , getWishlistCount)
 
router.get("/" , authMiddleware , getWishlist)

router.delete("/:productId" , authMiddleware , removeFromWishlist)

router.patch("/:productId/toggle" , authMiddleware , toggleWishlist);


module.exports = router;