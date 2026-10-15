import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";

const WishlistCard = ({ product, onRemove, removing }) => {
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col">
      
      {/* Product image */}
      <div className="relative aspect-square bg-slate-50 p-6">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";
          }}
        />

        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-slate-700 shadow-sm border border-slate-100">
            {product.category}
          </span>
        </div>

        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
        </div>
      </div>

      {/* Product information */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
          {product.name}
        </h3>

        <p className="mt-1 text-xs text-slate-400 line-clamp-2">
          {product.description}
        </p>

        <div className="mt-4">
          <span className="text-lg font-black text-slate-900">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </span>
        </div>

        {/* Stock */}
        <div className="mt-2 text-[11px]">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
              <AlertCircle className="w-3 h-3" />
              Out of stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
              <CheckCircle2 className="w-3 h-3" />
              {product.stock} in stock
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            to={`/products/${product._id}`}
            className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => onRemove(product._id)}
            disabled={removing}
            className="py-2.5 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{removing ? "Removing..." : "Remove"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;