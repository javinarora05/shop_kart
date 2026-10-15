import React from "react";
import { Search, Filter, ArrowUpDown, X } from "lucide-react";

const categories = ["All", "Electronics", "Fashion", "Books", "Home"];

const SearchBar = ({
  searchTerm,
  setSearchTerm,
  category,
  setCategory,
  sort,
  setSort,
  onReset,
}) => {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
      {/* Search Input */}
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search smart watches, earbuds, keyboards, gadgets..."
          className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-medium"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Dropdown */}
      <div className="relative min-w-[160px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white appearance-none cursor-pointer"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "All" ? "All Departments" : cat}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
          ▼
        </div>
      </div>

      {/* Sorting Dropdown */}
      <div className="relative min-w-[170px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white appearance-none cursor-pointer"
        >
          <option value="">Sort: Featured</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
          ▼
        </div>
      </div>

      {/* Reset Button */}
      {(searchTerm || (category && category !== "All") || sort) && (
        <button
          onClick={onReset}
          className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
};

export default SearchBar;
