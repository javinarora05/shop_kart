import React, { useState, useEffect } from "react";
import { getProducts, getWishlist } from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import { useAuth } from "../context/AuthContext";
import {
  ArrowRight,
  Headphones,
  Cpu,
  Watch,
  Smartphone,
  Tag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headset,
  Gift,
  Mail,
  RefreshCw,
  PackageX,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistIds, setWishlistIds] = useState([]);
  const { user } = useAuth();

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("");

  useEffect(() => {
    const fetchWishlistIds = async () => {
      if (!user) {
        setWishlistIds([]);
        return;
      }

      try {
        const data = await getWishlist();

        setWishlistIds((data.wishlist || []).map((product) => product._id));
      } catch (err) {
        console.error("Unable to load wishlist state:", err);
      }
    };

    fetchWishlistIds();
  }, [user]);

  const fetchProductList = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (category && category !== "All") params.category = category;
      if (sort) params.sort = sort;

      const data = await getProducts(params);
      setProducts(data.products || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong while loading products.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductList();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, category, sort]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setCategory("All");
    setSort("");
  };

  const handleQuickCategory = (cat) => {
    setCategory(cat);
    // Smooth scroll to catalog section
    const el = document.getElementById("trending-catalog");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* ========================================================
          1. HERO SHOWCASE SECTION (Matches Reference Image)
      ======================================================== */}
      <section className="relative overflow-hidden bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Headline, CTAs, Shipping tags */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs sm:text-sm font-black tracking-wider text-red-600 uppercase">
                Discover. Shop. Upgrade.
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
                Latest Tech <br />
                <span className="text-red-600">Gadgets</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-500 font-medium max-w-lg leading-relaxed">
                Explore cutting-edge gadgets that upgrade your lifestyle with
                next-generation performance, audio fidelity, and intelligent
                connectivity.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#trending-catalog"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 transition-all hover:gap-3"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <button
                  onClick={() => handleQuickCategory("Electronics")}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 transition-colors"
                >
                  Browse Collection
                </button>
              </div>

              {/* Supported Countries & Fast Shipping Badge */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span>🇺🇸</span> US
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span>🇬🇧</span> UK
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span>🇦🇪</span> UAE
                </span>
                <span className="text-slate-300">|</span>
                <span className="inline-flex items-center gap-1.5 text-slate-700 font-bold">
                  <Truck className="w-4 h-4 text-red-600" /> Fast Worldwide
                  Shipping
                </span>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-6 relative flex justify-center items-center">
              {/* Red abstract curved graphic */}
              <div className="absolute -top-10 -right-10 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 opacity-90 blur-0 -z-0"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-400/20 rounded-full blur-3xl -z-10"></div>

              {/* Featured Gadget Collage */}
              <div className="relative z-10 w-full max-w-lg aspect-[4/3] flex items-center justify-center">
                {/* Silver Headphones hero image */}
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80"
                  alt="Over-Ear Gadgets"
                  className="w-3/5 h-auto object-contain drop-shadow-2xl z-10 hover:scale-105 transition-transform duration-300"
                />

                {/* Smart Watch overlay */}
                <div className="absolute left-2 sm:left-4 bottom-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/60 z-20 hover:scale-105 transition-transform duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=260&q=80"
                    alt="Smartwatch"
                    className="w-20 sm:w-28 aspect-square object-contain rounded-xl"
                  />
                </div>

                {/* Earbuds Pro overlay */}
                <div className="absolute right-2 sm:right-6 bottom-4 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/60 z-20 hover:scale-105 transition-transform duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=260&q=80"
                    alt="Wireless Earbuds"
                    className="w-20 sm:w-28 aspect-square object-contain rounded-xl"
                  />
                </div>

                {/* Floating "New Arrivals" pill badge */}
                <div className="absolute top-2 right-2 sm:right-6 bg-white text-slate-900 rounded-full py-2 px-4 shadow-xl border border-slate-100 flex items-center gap-2 z-20">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                  <span className="text-xs font-black tracking-wide uppercase">
                    New Arrivals
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. QUICK CATEGORY SELECTOR CARDS (Matches Reference Image)
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Card 1: Audio */}
          <button
            onClick={() => handleQuickCategory("Electronics")}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Audio
                </h4>
                <p className="text-[11px] text-slate-400 font-medium">
                  Premium Sound
                </p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 group-hover:translate-x-0.5 transition-transform flex-shrink-0">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Card 2: Smart Devices */}
          <button
            onClick={() => handleQuickCategory("Electronics")}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Smart Devices
                </h4>
                <p className="text-[11px] text-slate-400 font-medium">
                  Smarter Living
                </p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 group-hover:translate-x-0.5 transition-transform flex-shrink-0">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Card 3: Wearables */}
          <button
            onClick={() => handleQuickCategory("Electronics")}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Watch className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Wearables
                </h4>
                <p className="text-[11px] text-slate-400 font-medium">
                  Track. Achieve.
                </p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 group-hover:translate-x-0.5 transition-transform flex-shrink-0">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Card 4: Accessories */}
          <button
            onClick={() => handleQuickCategory("Fashion")}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Accessories
                </h4>
                <p className="text-[11px] text-slate-400 font-medium">
                  Designed for You
                </p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 group-hover:translate-x-0.5 transition-transform flex-shrink-0">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Card 5: Deals */}
          <button
            onClick={() => setSort("price_asc")}
            className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-red-500/20">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Deals
                </h4>
                <p className="text-[11px] text-slate-400 font-medium">
                  Top Deals Today
                </p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 group-hover:translate-x-0.5 transition-transform flex-shrink-0">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </section>

      {/* ========================================================
          3. TRENDING PRODUCTS & CATALOG (Matches Reference Image)
      ======================================================== */}
      <section
        id="trending-catalog"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14"
      >
        {/* Section Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Trending Products
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Top-rated gadgets and devices chosen by our tech community
            </p>
          </div>

          <div className="text-xs font-bold text-slate-400">
            Showing{" "}
            <span className="text-slate-900 font-black">{products.length}</span>{" "}
            items
          </div>
        </div>

        {/* Search & Filter Component */}
        <div className="mb-8">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            category={category}
            setCategory={setCategory}
            sort={sort}
            setSort={setSort}
            onReset={handleResetFilters}
          />
        </div>

        {/* State Handling: Loading, Error, Empty, and Products Grid */}
        {loading ? (
          <div>
            <div className="flex items-center justify-center py-6 text-sm font-bold text-slate-500 gap-2 mb-6">
              <RefreshCw className="w-4 h-4 animate-spin text-red-600" />
              <span>Loading products...</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse flex flex-col gap-3"
                >
                  <div className="aspect-square bg-slate-100 rounded-xl w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-50 rounded w-1/2"></div>
                  <div className="h-9 bg-slate-100 rounded mt-auto"></div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-rose-100 p-8 shadow-sm">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-rose-50 items-center justify-center text-rose-600 mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Something went wrong while loading products.
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              {error}
            </p>
            <button
              onClick={fetchProductList}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-slate-100 items-center justify-center text-slate-400 mb-4">
              <PackageX className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              No products found.
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              We couldn't find any products matching your query. Try resetting
              your search or category filter.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isWishlisted={wishlistIds.includes(product._id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ========================================================
          4. TRUST & VALUE PROPOSITION STRIP (Matches Reference Image)
      ======================================================== */}
      <section className="bg-white border-y border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Worldwide Shipping
                </h4>
                <p className="text-xs text-slate-500">
                  Fast delivery to US, UK & UAE
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Secure Payments
                </h4>
                <p className="text-xs text-slate-500">
                  100% safe & secure checkout
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  30-Day Returns
                </h4>
                <p className="text-xs text-slate-500">
                  Hassle-free returns guaranteed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <Headset className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Premium Support
                </h4>
                <p className="text-xs text-slate-500">
                  24/7 customer assistance
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. "IDEAS FOR YOUR NEXT UPGRADE" (Matches Reference Image)
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Ideas for Your Next Upgrade
          </h2>
          <span className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer">
            See All Collections →
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Tile 1 */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] group cursor-pointer shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=500&q=80"
              alt="Tech Setup Ideas"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
              <div>
                <h4 className="text-xs font-bold leading-tight">
                  Tech Setup Ideas
                </h4>
                <span className="text-[10px] text-slate-300">128 Ideas</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Tile 2 */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] group cursor-pointer shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=500&q=80"
              alt="Travel Tech Essentials"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
              <div>
                <h4 className="text-xs font-bold leading-tight">Travel Tech</h4>
                <span className="text-[10px] text-slate-300">96 Ideas</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Tile 3 */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] group cursor-pointer shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=80"
              alt="Smart Home Inspiration"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
              <div>
                <h4 className="text-xs font-bold leading-tight">Smart Home</h4>
                <span className="text-[10px] text-slate-300">74 Ideas</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Tile 4 */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] group cursor-pointer shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80"
              alt="Gaming Gear"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
              <div>
                <h4 className="text-xs font-bold leading-tight">Gaming Gear</h4>
                <span className="text-[10px] text-slate-300">155 Ideas</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Tile 5 */}
          <div className="hidden lg:block relative rounded-2xl overflow-hidden aspect-[4/5] group cursor-pointer shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80"
              alt="Minimal Desk Setup"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
              <div>
                <h4 className="text-xs font-bold leading-tight">
                  Minimal Desk
                </h4>
                <span className="text-[10px] text-slate-300">87 Ideas</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. EXCLUSIVE DEALS & NEWSLETTER PROMO (Matches Reference Image)
      ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Red Exclusive Deals Card */}
          <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white flex items-center gap-5 shadow-lg shadow-red-500/20">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 text-white">
              <Gift className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">
                Exclusive Deals for You!
              </h3>
              <p className="text-xs text-red-100 mt-1 leading-relaxed">
                Save more on top-rated gadgets handpicked just for you. Members
                get up to 40% off on flagship accessories.
              </p>
            </div>
          </div>

          {/* Newsletter Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 flex flex-col justify-center shadow-sm">
            <h3 className="text-lg font-black text-slate-900">
              Get the Latest Tech & Deals
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Join our newsletter community and never miss a product drop or
              limited-time sale.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-red-600 text-white text-xs font-bold transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
