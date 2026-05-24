import React from "react";

function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;

  const { page, totalPages, hasNextPage, hasPreviousPage } = meta;

  return (
    <nav className="mt-12 flex items-center justify-between border-t border-brand-gold/20 px-4 py-6 sm:px-0" aria-label="Pagination">
      <div className="-mt-px flex w-0 flex-1">
        {hasPreviousPage ? (
          <button
            onClick={() => onPageChange(page - 1)}
            className="inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium text-brand-green-800 hover:border-brand-gold hover:text-brand-green-950 transition"
          >
            ← Previous
          </button>
        ) : (
          <span className="inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium text-brand-green-800/40 cursor-not-allowed">
            ← Previous
          </span>
        )}
      </div>

      <div className="hidden md:-mt-px md:flex">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium transition ${
              p === page
                ? "border-brand-green-900 text-brand-green-900 font-semibold"
                : "border-transparent text-brand-green-800 hover:border-brand-gold hover:text-brand-green-950"
            }`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="-mt-px flex w-0 flex-1 justify-end">
        {hasNextPage ? (
          <button
            onClick={() => onPageChange(page + 1)}
            className="inline-flex items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium text-brand-green-800 hover:border-brand-gold hover:text-brand-green-950 transition"
          >
            Next →
          </button>
        ) : (
          <span className="inline-flex items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium text-brand-green-800/40 cursor-not-allowed">
            Next →
          </span>
        )}
      </div>
    </nav>
  );
}

export default Pagination;
