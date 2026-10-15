import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerCustomer } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Lock, Phone, UserPlus, AlertCircle, ShoppingBag } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must contain at least 6 characters";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError("");

    try {
      await registerCustomer(formData);
      // On success -> Redirect to Login page with state
      navigate("/login", {
        state: { message: "Account created successfully! Please log in." },
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Registration failed. Please check your details and try again.";
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="text-center">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 items-center justify-center text-white shadow-lg shadow-red-500/30 mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Join ShopKart today to start shopping latest gadgets
          </p>
        </div>

        {serverError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.fullName
                    ? "border-rose-300 focus:ring-rose-500"
                    : "border-slate-200 focus:ring-blue-500"
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-xs text-rose-600">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@gmail.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.email
                    ? "border-rose-300 focus:ring-rose-500"
                    : "border-slate-200 focus:ring-blue-500"
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.password
                    ? "border-rose-300 focus:ring-rose-500"
                    : "border-slate-200 focus:ring-blue-500"
                }`}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-600">{errors.password}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.phone
                    ? "border-rose-300 focus:ring-rose-500"
                    : "border-slate-200 focus:ring-red-500"
                }`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-full text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isSubmitting ? "Creating Account..." : "Create Account"}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-red-600 hover:text-red-700 hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
