import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, LogIn, AlertCircle, CheckCircle2, ShoppingBag } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success message passed from registration redirect
  const successMessage = location.state?.message;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await login(formData);
      // On success -> Navigate to /home
      navigate("/home");
    } catch (err) {
      // Must show "Invalid Credentials" on failure as required by spec
      const status = err.response?.status;
      if (status === 401) {
        setErrorMessage("Invalid Credentials");
      } else {
        setErrorMessage(
          err.response?.data?.message || "Invalid Credentials"
        );
      }
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
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Sign in to access your ShopKart gadgets
          </p>
        </div>

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-700 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-medium"
              />
            </div>
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
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-full text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? "Signing In..." : "Sign In"}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-red-600 hover:text-red-700 hover:underline"
            >
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
