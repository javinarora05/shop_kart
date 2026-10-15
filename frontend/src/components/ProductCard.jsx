import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  toggleWishlist,
  addToCart,
  updateCartQuantity,
  clearCart,
  removeFromCart,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  ArrowRight,
  Heart,
  Star,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const ProductCard = ({ product, isWishlisted = false }) => {
  const { setWishlistCount, refreshCartCount } = useAuth();
  const [liked, setLiked] = useState(isWishlisted);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [wishlistError, setWishlistError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");
  const isOutOfStock = product.stock <= 0;

  // Wishlist IDs are fetched after the first render, so keep the heart in sync
  useEffect(() => {
    setLiked(isWishlisted);
  }, [isWishlisted]);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent duplicate clicks while API request is running
    if (savingWishlist) {
      return;
    }

    setSavingWishlist(true);
    setWishlistError("");

    try {
      const data = await toggleWishlist(product._id);

      // Backend tells us whether it is now saved
      setLiked(data.saved);

      // Backend also returns the latest count
      if (typeof data.count === "number") {
        setWishlistCount(data.count);
      }
    } catch (err) {
      setWishlistError(
        err.response?.data?.message ||
          "Unable to update wishlist. Please try again.",
      );
    } finally {
      setSavingWishlist(false);
    }
  };
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (addingToCart || isOutOfStock) {
      return;
    }

    setAddingToCart(true);
    setCartMessage("");
    setCartError("");

    try {
      await addToCart(product._id);

      await refreshCartCount();

      setCartMessage("Added to cart");
    } catch (err) {
      setCartError(
        err.response?.data?.message ||
          "Unable to add product to cart. Please try again.",
      );
    } finally {
      setAddingToCart(false);
    }
  };
  // Generate deterministic realistic like counts based on id
  const likes = Math.floor(1200 + (product.price % 800) * 1.5);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50 flex items-center justify-center p-6">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain object-center group-hover:scale-108 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";
          }}
        />

        {/* Category Pill Tag */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-slate-700 shadow-sm border border-slate-100">
            {product.category}
          </span>
        </div>

        {/* Heart / Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={savingWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full
    bg-white/90 backdrop-blur-md
    flex items-center justify-center
    shadow-sm border border-slate-100
    transition-colors
    ${liked ? "text-red-500" : "text-slate-400 hover:text-red-500"}
    ${savingWishlist ? "opacity-60 cursor-not-allowed" : ""}
  `}
          title={
            savingWishlist
              ? "Saving..."
              : liked
                ? "Remove from wishlist"
                : "Add to wishlist"
          }
        >
          <Heart
            className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`}
          />
        </button>
        {savingWishlist && (
          <div className="absolute top-12 right-3 bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-lg">
            Saving...
          </div>
        )}
        {wishlistError && (
          <div className="absolute top-12 right-3 z-10 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg px-3 py-2 text-[10px] font-semibold shadow-sm max-w-[180px]">
            {wishlistError}
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Social proof row */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
            <span>{(likes / 1000).toFixed(1)}k</span>
          </div>
        </div>

        {/* Stock status indicator */}
        <div className="mt-2 flex items-center justify-between text-[11px]">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
              <AlertCircle className="w-3 h-3" />
              Out of stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
              <CheckCircle2 className="w-3 h-3" />
              {product.stock} in stock
            </span>
          )}

          <span className="text-slate-400">Ships in 24h</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={addingToCart || isOutOfStock}
          className={`mt-3.5 w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold transition-colors duration-200 ${
            isOutOfStock
              ? "bg-slate-300 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {addingToCart
            ? "Adding..."
            : isOutOfStock
              ? "Out of Stock"
              : "Add to Cart"}
        </button>
        {cartMessage && (
          <p className="mt-2 text-xs font-semibold text-emerald-600">
            {cartMessage}
          </p>
        )}

        {cartError && (
          <p className="mt-2 text-xs font-semibold text-rose-600">
            {cartError}
          </p>
        )}
        {/* View Details Action Button */}
        <Link
          to={`/products/${product._id}`}
          className="mt-3.5 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors duration-200"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
