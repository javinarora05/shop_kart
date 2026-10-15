import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById, getWishlist, toggleWishlist } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  Tag,
  AlertCircle,
  CheckCircle2,
  Heart,
  Truck,
  Shield,
  RotateCcw,
  RefreshCw,
} from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, setWishlistCount } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [wishlistNotice, setWishlistNotice] = useState("");
  const [wishlistError, setWishlistError] = useState("");

  // Check whether this product is already in the user's wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      if (!user) {
        setLiked(false);
        return;
      }

      try {
        const data = await getWishlist();
        setLiked((data.wishlist || []).some((item) => item._id === id));
      } catch (err) {
        console.error("Unable to load wishlist state:", err);
      }
    };

    checkWishlist();
  }, [user, id]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductById(id);
        const item = data.product || data;
        setProduct(item);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load product details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleWishlistToggle = async () => {
    // Wishlist is only for logged-in users
    if (!user) {
      navigate("/login");
      return;
    }

    // Prevent duplicate clicks while API request is running
    if (savingWishlist) {
      return;
    }

    setSavingWishlist(true);
    setWishlistError("");

    try {
      const data = await toggleWishlist(product._id);

      // Backend tells us whether it is now saved and the latest count
      setLiked(data.saved);
      if (typeof data.count === "number") {
        setWishlistCount(data.count);
      }

      setWishlistNotice(data.saved ? "Added to your wishlist!" : "Removed from your wishlist.");
      setTimeout(() => setWishlistNotice(""), 2500);
    } catch (err) {
      setWishlistError(
        err.response?.data?.message ||
          "Unable to update wishlist. Please try again."
      );
    } finally {
      setSavingWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-rose-100 p-8 shadow-sm">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-rose-50 items-center justify-center text-rose-600 mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {error || "We couldn't retrieve the details for this product."}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Navigation Breadcrumb */}
      <div className="mb-6">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 p-6 sm:p-10">
        {/* Large Product Image */}
        <div className="flex flex-col">
          <div className="relative aspect-[4/3] sm:aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-inner">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80";
              }}
            />
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-sm">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                {product.category}
              </span>
            </div>
          </div>
        </div>

        {/* Product Details & Actions */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                {product.category}
              </span>

              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Out of Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {product.stock} units in stock
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-4">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-black text-slate-900">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-medium text-slate-400">
                inclusive of all taxes
              </span>
            </div>

            <div className="border-t border-b border-slate-100 py-6 mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Description
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Perks / Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Truck className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-700">
                  Fast Express Delivery
                </span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Shield className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-700">
                  1-Year Warranty
                </span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <RotateCcw className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-700">
                  30-Day Returns
                </span>
              </div>
            </div>
          </div>

          {/* Wishlist Section */}
          <div className="pt-4">
            {wishlistNotice && (
              <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{wishlistNotice}</span>
              </div>
            )}

            {wishlistError && (
              <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{wishlistError}</span>
              </div>
            )}

            <button
              onClick={handleWishlistToggle}
              disabled={savingWishlist}
              className={`w-full py-4 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                liked
                  ? "bg-white border-2 border-red-600 text-red-600 hover:bg-red-50"
                  : "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30"
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-red-600" : ""}`} />
              <span>
                {savingWishlist
                  ? "Saving..."
                  : liked
                    ? "Remove from Wishlist"
                    : "Add to Wishlist"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
