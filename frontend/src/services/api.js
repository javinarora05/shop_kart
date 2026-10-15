import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true, // Send and receive HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Authentication APIs (Lab 01 & Lab 02)
export const registerCustomer = async (userData) => {
  const response = await API.post("/customers/register", userData);
  return response.data;
};

export const loginCustomer = async (credentials) => {
  const response = await API.post("/customers/login", credentials);
  return response.data;
};

export const getMyProfile = async () => {
  const response = await API.get("/customers/me");
  return response.data;
};

export const logoutCustomer = async () => {
  const response = await API.post("/customers/logout");
  return response.data;
};

export const changePassword = async (passwords) => {
  const response = await API.patch("/customers/change-password", passwords);
  return response.data;
};

// Product APIs (Lab 03)
export const getProducts = async (params = {}) => {
  const response = await API.get("/products", { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await API.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await API.post("/products", productData);
  return response.data;
};

export const addToWishlist = async (productId) => {
  const response = await API.post(`/wishlist/${productId}`);
  return response.data;
}


export const getWishlist = async () => {
  const response = await API.get("/wishlist")
  return response.data
}

export const removeFromWishlist = async (productId) => {
  const response = await API.delete(`/wishlist/${productId}`)
  return response.data
}

export const toggleWishlist =async (productId) => {
  const response = await API.patch(
    `/wishlist/${productId}/toggle`
  )

  return response.data 
}

export const getWishlistCount = async () => {
  const response = await API.get("/wishlist/count")

  return response.data 
}

export const addToCart = async (productId) => {
  const response = await API.post(`/cart/${productId}`)

  return response.data
}

export const getCart = async () => {
  const response = await API.get("/cart")

  return response.data 
}

export const updateCartQuantity = async(productId , quantity) => {
  const response = await API.put(`/cart/${productId}` , {quantity , })

  return response.data
}

export const removeFromCart = async (productId) => {
  const response = await API.delete(`/cart/${productId}`)

  return response.data
}

export const clearCart = async () => {
  const response = await API.delete("/cart")

  return response.data 
}

// Order APIs (Lab 06)
export const createPaymentOrder = async (shippingAddress) => {
  const response = await API.post("/orders/create-payment-order", {
    shippingAddress,
  });

  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await API.post(
    "/orders/verify-payment",
    paymentData
  );

  return response.data;
};
export const getMyOrders = async () => {
  const response = await API.get("/orders");
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await API.get(`/orders/${id}`);
  return response.data;
};
export default API;
