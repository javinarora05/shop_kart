import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  RefreshCw,
  AlertCircle,
  PackageOpen,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} from "../services/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";

const formatPrice = (value) => `₹${Number(value).toLocaleString("en-IN")}`;

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [clearing, setClearing] = useState(false);
  const { user, loading: authLoading, refreshCartCount } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait until AuthContext finishes checking login
    if (authLoading) {
      return;
    }

    // Cart is only for logged-in users
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchCart = async () => {
      try {
        const data = await getCart();

        setCart(data.cart || []);
        setSubtotal(data.subtotal || 0);
      } catch (error) {
        console.error("Fetch cart error:", error);

        setError(error.response?.data?.message || "Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user, authLoading, navigate]);

  const handleRemove = async (productId) => {
    setActionError("");
    setBusyId(productId);

    try {
      await removeFromCart(productId);

      // Refresh cart after removal
      const updatedCart = await getCart();

      setCart(updatedCart.cart || []);
      setSubtotal(updatedCart.subtotal || 0);
      await refreshCartCount();
    } catch (error) {
      console.error("Remove from cart error:", error);

      setActionError(
        error.response?.data?.message || "Failed to remove product from cart",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await handleRemove(productId);
      return;
    }

    setActionError("");
    setBusyId(productId);

    try {
      const data = await updateCartQuantity(productId, newQuantity);

      // Update cart and subtotal with backend response
      setCart(data.cart || []);
      setSubtotal(data.subtotal || 0);

      await refreshCartCount();
    } catch (error) {
      console.error("Update quantity error:", error);

      setActionError(
        error.response?.data?.message || "Failed to update quantity",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleClearCart = async () => {
    setActionError("");
    setClearing(true);

    try {
      await clearCart();

      setCart([]);
      setSubtotal(0);

      await refreshCartCount();
    } catch (error) {
      console.error("Clear cart error:", error);

      setActionError(error.response?.data?.message || "Failed to clear cart");
    } finally {
      setClearing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-red-600" />

          <p className="text-sm font-semibold text-slate-500">
            Loading your cart...
          </p>
        </div>
      </div>
    );
  }

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-3xl font-black text-slate-900">My Cart</h1>

            <p className="text-sm text-slate-500 mt-1">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>
        </div>

        {/* Error state */}
        {(error || actionError) && (
          <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5" />

              <div>
                <h3 className="text-sm font-bold text-rose-700">
                  Something went wrong
                </h3>

                <p className="text-xs text-rose-600 mt-1">
                  {error || actionError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!error && cart.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm py-20 px-6 text-center">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-red-50 text-red-500 items-center justify-center mb-5">
              <PackageOpen className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-slate-900">
              Your cart is empty
            </h2>

            <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 mb-6">
              Add products to your cart and they will show up here.
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

        {/* Cart items + summary */}
        {!error && cart.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => {
                const { product } = item;
                const busy = busyId === product._id;
                const atStockLimit =
                  product.stock != null && item.quantity >= product.stock;

                return (
                  <div
                    key={product._id}
                    className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex gap-4 transition-opacity ${
                      busy ? "opacity-60" : ""
                    }`}
                  >
                    <Link
                      to={`/products/${product._id}`}
                      className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-50 p-3"
                    >
                      <img
                        src={product.image || FALLBACK_IMAGE}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = FALLBACK_IMAGE;
                        }}
                      />
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          {product.category && (
                            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                              {product.category}
                            </span>
                          )}

                          <Link
                            to={`/products/${product._id}`}
                            className="block text-sm sm:text-base font-bold text-slate-900 hover:text-red-600 line-clamp-1"
                          >
                            {product.name}
                          </Link>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatPrice(product.price)} each
                          </p>
                        </div>

                        <button
                          onClick={() => handleRemove(product._id)}
                          disabled={busy}
                          aria-label={`Remove ${product.name}`}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-auto pt-3 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center rounded-xl border border-slate-200">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                product._id,
                                item.quantity - 1,
                              )
                            }
                            disabled={busy}
                            aria-label="Decrease quantity"
                            className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-l-xl disabled:opacity-50"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <span className="w-10 text-center text-sm font-bold text-slate-900">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              handleQuantityChange(
                                product._id,
                                item.quantity + 1,
                              )
                            }
                            disabled={busy || atStockLimit}
                            aria-label="Increase quantity"
                            className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-r-xl disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-base sm:text-lg font-black text-slate-900">
                          {formatPrice(product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-black text-slate-900">
                Order Summary
              </h2>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Items ({itemCount})</span>
                  <span className="font-semibold text-slate-700">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Delivery</span>
                  <span className="font-semibold text-emerald-600">Free</span>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">
                  Subtotal
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  to="/checkout"
                  className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-red-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-red-200"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  Continue Shopping
                </Link>
              </div>

              <button
                onClick={handleClearCart}
                disabled={clearing}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {clearing ? "Clearing..." : "Clear Cart"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
