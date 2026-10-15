import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { createPaymentOrder, getCart, verifyPayment } from "../services/api";

const formatPrice = (value) => `₹${Number(value).toLocaleString("en-IN")}`;

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { refreshCartCount } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchCart = async () => {
      try {
        const data = await getCart();

        if (isMounted) {
          setCart(data.cart || []);
          setSubtotal(data.subtotal || 0);
        }
      } catch (error) {
        console.error("Fetch checkout cart error:", error);

        if (isMounted) {
          setCartError(
            error.response?.data?.message || "Failed to load your cart",
          );
        }
      } finally {
        if (isMounted) {
          setCartLoading(false);
        }
      }
    };

    fetchCart();

    return () => {
      isMounted = false;
    };
  }, []);

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone number must contain 10 digits";
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Pincode must contain 6 digits";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const shippingAddress = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine1: formData.addressLine1.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      };

      // Create ShopKart + Razorpay order
      const data = await createPaymentOrder(shippingAddress);

      // Load Razorpay Checkout
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        setErrors({
          form: "Unable to load Razorpay Checkout. Please try again.",
        });
        return;
      }

      // Razorpay Checkout configuration
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart Order",
        order_id: data.razorpayOrderId,

        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
        },

        handler: async function (response) {
          try {
            setLoading(true);

            const verificationData = {
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            const result = await verifyPayment(verificationData);

            console.log("Payment verification result:", result);
            await refreshCartCount();
            navigate(`/order-success/${data.shopKartOrderId}`);
          } catch (error) {
            console.error("Payment verification error:", error);

            setErrors({
              form:
                error.response?.data?.message || "Payment verification failed",
            });
          } finally {
            setLoading(false);
          }
        },

        theme: {},
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.open();
    } catch (error) {
      console.error("Checkout error:", error);

      setErrors({
        form: error.response?.data?.message || "Unable to start payment",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
          Checkout
        </h1>

        <div className="grid gap-10 lg:grid-cols-[1.65fr_0.95fr] lg:items-start">
          <div className="w-full">
            <div className="rounded-3xl border border-slate-200 bg-slate-100/60 p-0">
              <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-800">
                Shipping Details
              </h2>

              {errors.form && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {errors.form}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-lg font-medium text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-200/80 px-4 text-base text-slate-800 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100"
                    placeholder=""
                  />
                  {errors.fullName && (
                    <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-lg font-medium text-slate-700">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-200/80 px-4 text-base text-slate-800 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100"
                    placeholder=""
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-lg font-medium text-slate-700">
                    Address
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-200/80 px-4 text-base text-slate-800 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100"
                    placeholder=""
                  />
                  {errors.addressLine1 && (
                    <p className="mt-2 text-sm text-red-600">{errors.addressLine1}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-lg font-medium text-slate-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-200/80 px-4 text-base text-slate-800 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100"
                    placeholder=""
                  />
                  {errors.city && (
                    <p className="mt-2 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-lg font-medium text-slate-700">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-200/80 px-4 text-base text-slate-800 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100"
                    placeholder=""
                  />
                  {errors.state && (
                    <p className="mt-2 text-sm text-red-600">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-lg font-medium text-slate-700">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-200/80 px-4 text-base text-slate-800 outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100"
                    placeholder=""
                  />
                  {errors.pincode && (
                    <p className="mt-2 text-sm text-red-600">{errors.pincode}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-base font-semibold text-white shadow-sm transition duration-200 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? "Creating Order..." : "Place Order"}
                </button>
              </form>
            </div>
          </div>

          <aside className="w-full rounded-[1.5rem] border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur-sm sm:p-6">
            <h3 className="mb-4 text-2xl font-bold tracking-tight text-slate-800">
              Order Summary
            </h3>

            {cartLoading ? (
              <p className="text-sm leading-6 text-slate-500">
                Loading your cart...
              </p>
            ) : cartError ? (
              <p role="alert" className="text-sm leading-6 text-red-600">
                {cartError}
              </p>
            ) : cart.length === 0 ? (
              <p className="text-sm leading-6 text-slate-500">
                Your cart is empty.
              </p>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map(({ product, quantity }) => (
                    <div
                      key={product._id}
                      className="flex justify-between gap-4 text-sm"
                    >
                      <span className="min-w-0 text-slate-600">
                        <span className="block truncate font-medium text-slate-800">
                          {product.name}
                        </span>
                        <span>Qty: {quantity}</span>
                      </span>
                      <span className="shrink-0 font-semibold text-slate-700">
                        {formatPrice(product.price * quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="my-5 h-px w-full bg-slate-200" />

                <div className="mb-4 flex items-center justify-between gap-3 text-sm text-slate-500">
                  <span>Items ({itemCount})</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="mb-4 flex items-center justify-between gap-3 text-sm text-slate-500">
                  <span>Delivery</span>
                  <span className="font-semibold text-emerald-600">Free</span>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4 text-base font-semibold text-slate-700">
                  <span>Total</span>
                  <span className="text-right text-xl font-black text-slate-900">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
