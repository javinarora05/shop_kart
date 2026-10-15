import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  RefreshCw,
  AlertCircle,
  PackageOpen,
  ShoppingBag,
} from "lucide-react";

import { getWishlist, removeFromWishlist } from "../services/api";
import { useAuth } from "../context/AuthContext";
import WishlistCard from "../components/WishlistCard";

const Wishlist = () => {
  const { user, loading: authLoading, setWishlistCount } = useAuth();
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const fetchWishlist = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getWishlist();

      setWishlist(data.wishlist || []);
      setWishlistCount(data.count ?? (data.wishlist || []).length);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We couldn't load your wishlist."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait until AuthContext finishes checking login
    if (authLoading) {
      return;
    }

    // Wishlist is only for logged-in users
    if (!user) {
      navigate("/login");
      return;
    }

    fetchWishlist();
  }, [user, authLoading, navigate]);

  const handleRemove = async (productId) => {
    setRemovingId(productId);

    try {
      await removeFromWishlist(productId);

      // Remove it from the UI without refreshing the page
      setWishlist((currentWishlist) =>
        currentWishlist.filter(
          (product) => product._id !== productId
        )
      );

      // Keep the navbar count in sync
      setWishlistCount((count) => Math.max(count - 1, 0));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to remove product from wishlist."
      );
    } finally {
      setRemovingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-red-600" />

          <p className="text-sm font-semibold text-slate-500">
            Loading your wishlist...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <Heart className="w-6 h-6 fill-red-500" />
            </div>

            <div>
              <h1 className="text-3xl font-black text-slate-900">
                My Wishlist
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                {wishlist.length}{" "}
                {wishlist.length === 1 ? "product" : "products"} saved
              </p>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5" />

              <div className="flex-1">
                <h3 className="text-sm font-bold text-rose-700">
                  Something went wrong
                </h3>

                <p className="text-xs text-rose-600 mt-1">
                  {error}
                </p>

                <button
                  onClick={fetchWishlist}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!error && wishlist.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm py-20 px-6 text-center">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-red-50 text-red-500 items-center justify-center mb-5">
              <PackageOpen className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-slate-900">
              Your wishlist is empty
            </h2>

            <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 mb-6">
              Save products you love and find them here later.
            </p>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-red-600 text-white text-xs font-bold transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Products
            </Link>
          </div>
        )}

        {/* Wishlist products */}
        {!error && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemove}
                removing={removingId === product._id}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Wishlist;