import React from "react";

function FilterBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  categories = [],
  placeholder = "Search...",
  categoryLabel = "Category",
}) {
  return (
    <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-brand-gold/20 bg-brand-surface p-4 shadow-soft md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1">
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-brand-gold-dark">
          <svg className="h-4 w-4" aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <path
              d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <input
          type="text"
          id="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full rounded-xl border-brand-gold/30 bg-brand-cream/10 py-2.5 pl-10 pr-3 text-sm text-brand-green-950 placeholder:text-brand-green-700/60 transition focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5">
            <label htmlFor="category-select" className="text-xs font-semibold uppercase tracking-wider text-brand-gold-dark">
              {categoryLabel}:
            </label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="rounded-xl border-brand-gold/30 bg-brand-surface px-3 py-2 text-sm text-brand-green-950 transition focus:border-brand-gold-dark focus:outline-none focus:ring-1 focus:ring-brand-gold-dark"
            >
              <option value="">All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <label htmlFor="sort-select" className="text-xs font-semibold uppercase tracking-wider text-brand-gold-dark">
            Sort By:
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-xl border-brand-gold/30 bg-brand-surface px-3 py-2 text-sm text-brand-green-950 transition focus:border-brand-gold-dark focus:outline-none focus:ring-1 focus:ring-brand-gold-dark"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="alphabetical">A-Z</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
