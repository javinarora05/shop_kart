import React, { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../services/api";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  ShoppingBag,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

const Home = () => {
  const { user, loading } = useAuth();

  // Change password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState({ type: "", text: "" });
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  // If Not Logged In -> Automatically redirect to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setPwdMsg({ type: "error", text: "Please provide both passwords" });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMsg({
        type: "error",
        text: "New password must be at least 6 characters",
      });
      return;
    }

    setIsChangingPwd(true);
    setPwdMsg({ type: "", text: "" });

    try {
      const res = await changePassword({ oldPassword, newPassword });
      setPwdMsg({
        type: "success",
        text: res.message || "Password changed successfully!",
      });
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPwdMsg({ type: "", text: "" });
      }, 1500);
    } catch (err) {
      setPwdMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update password",
      });
    } finally {
      setIsChangingPwd(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-slate-900 p-8 sm:p-10 text-white shadow-xl shadow-red-500/20 mb-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Verified Customer Session
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Welcome, {user.fullName}!
          </h1>
          <p className="mt-2 text-rose-100 text-sm sm:text-base leading-relaxed">
            Your ShopKart account is fully active and secured with HttpOnly JWT
            cookies. Discover our curated catalog of tech gadgets today.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition-colors shadow-sm"
            >
              <ShoppingBag className="w-4 h-4 text-red-600" />
              <span>Browse Catalog</span>
            </Link>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur-sm transition-colors border border-white/20"
            >
              <KeyRound className="w-4 h-4" />
              <span>Change Password</span>
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Profile Details Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Customer Profile
              </h2>
              <p className="text-xs text-slate-500">
                Fetched directly from <code className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-mono">GET /customers/me</code>
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-600">
                <User className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Customer Name
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {user.fullName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-600">
                <Mail className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Email Address
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {user.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-600">
                <Phone className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Phone Number
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {user.phone}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security / System Summary Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Authentication Security
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Your session is authenticated via secure HttpOnly cookies, protecting your session from XSS attacks.
            </p>

            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Bcrypt encrypted password hash</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>JWT signed with HS256 algorithm</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Protected routes guard private data</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>HttpOnly cookie prevents script access</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <Link
              to="/products"
              className="w-full py-3 px-4 rounded-full bg-slate-900 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Explore Product Catalog</span>
              <ShoppingBag className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Change Account Password
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Verify your current password to set a new secure password
            </p>

            {pwdMsg.text && (
              <div
                className={`p-3 rounded-xl mb-4 flex items-center gap-2 text-xs ${
                  pwdMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {pwdMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{pwdMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPwdMsg({ type: "", text: "" });
                  }}
                  className="w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPwd}
                  className="w-1/2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm disabled:opacity-50"
                >
                  {isChangingPwd ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
