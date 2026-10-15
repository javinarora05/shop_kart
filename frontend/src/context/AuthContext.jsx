import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getMyProfile,
  getWishlistCount,
  getCart,
  loginCustomer,
  logoutCustomer,
} from "../services/api";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const refreshWishlistCount = async () => {
    try {
      // Only logged-in users have a wishlist
      if (!user) {
        setWishlistCount(0);
        return;
      }

      const data = await getWishlistCount();

      setWishlistCount(data.count || 0);
    } catch (err) {
      // If the count request fails, don't break the entire app
      console.error("Wishlist count error:", err);
    }
  };
  const refreshCartCount = async () => {
    try {
      if (!user) {
        setCartCount(0);
        return;
      }

      const data = await getCart();

      const count = (data.cart || []).reduce(
        (total, item) => total + item.quantity,
        0,
      );

      setCartCount(count);
    } catch (err) {
      console.error("Cart count error:", err);
    }
  };
  const fetchProfile = async () => {
    try {
      const data = await getMyProfile();

      const profile = data.customer || data;

      setUser(profile);

      // Fetch wishlist count after authentication succeeds
      try {
        const wishlistData = await getWishlistCount();

        setWishlistCount(wishlistData.count || 0);
      } catch (wishlistError) {
        console.error("Unable to fetch wishlist count:", wishlistError);

        setWishlistCount(0);
      }
      try {
        const cartData = await getCart();

        const count = (cartData.cart || []).reduce(
          (total, item) => total + item.quantity,
          0,
        );

        setCartCount(count);
      } catch (cartError) {
        console.error("Unable to fetch cart count:", cartError);

        setCartCount(0);
      }
    } catch (err) {
      setUser(null);
      setWishlistCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (credentials) => {
    await loginCustomer(credentials);
    await fetchProfile();
  };

  const logout = async () => {
    try {
      await logoutCustomer();
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
      setWishlistCount(0);
      setCartCount(0);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        logout,
        wishlistCount,
        setWishlistCount,
        refreshWishlistCount,
        cartCount,
        setCartCount,
        refreshCartCount,
        refreshUser: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
