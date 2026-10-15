import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShoppingBag,
  ShoppingCart,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Sparkles,
  Heart,
} from "lucide-react";

const Navbar = () => {
  const { user, logout, wishlistCount, cartCount } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/95">
      {/* Top micro-announcement bar */}
      <div className="bg-slate-900 text-white text-[11px] py-1.5 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-4">
        <span>
          🇺🇸 US &nbsp;•&nbsp; 🇬🇧 UK &nbsp;•&nbsp; 🇦🇪 UAE &nbsp;•&nbsp; 🇮🇳 India
        </span>
        <span className="hidden sm:inline text-red-400 font-semibold">
          • Fast Express Delivery On All Orders
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <Link
            to={user ? "/home" : "/login"}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/25 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  ShopKart
                </span>
                <span className="w-2 h-2 rounded-full bg-red-600 ml-1 mt-1"></span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold -mt-1">
                Tech & Gadgets
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/products"
              className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              <span>Browse Catalog</span>
            </Link>

            {user ? (
              <>
                <Link
                  to="/home"
                  className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-red-600 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-red-600" />
                  <span className="hidden sm:inline">My Profile</span>
                  <span className="sm:hidden">Profile</span>
                </Link>

                <div className="h-5 w-px bg-slate-200 hidden sm:block mx-1"></div>

                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                  <span>{user.fullName}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
                <Link
                  to="/cart"
                  className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-red-600" />

                  <span>
                    Cart
                    <span className="ml-1 text-red-600">({cartCount})</span>
                  </span>
                </Link>
                <Link
                  to="/wishlist"
                  className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-red-600 hover:bg-red-50/50 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 text-red-600" />

                  <span>
                    Wishlist
                    <span className="ml-1 text-red-600">({wishlistCount})</span>
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 hover:text-red-600 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/25 transition-all hover:shadow-lg"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
