import React from "react";

export function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-gold/20 border-t-brand-gold"></div>
      <p className="mt-4 text-sm font-medium text-brand-green-800">{message}</p>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="mx-auto my-12 max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-soft">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-red-200 text-red-700">
        !
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold text-red-950">An Error Occurred</h3>
      <p className="mt-2 text-sm leading-relaxed text-red-800">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-full bg-brand-green-900 px-5 py-2 text-sm font-medium text-brand-cream transition hover:bg-brand-green-800"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message = "No records found." }) {
  return (
    <div className="my-8 rounded-2xl border border-brand-gold/10 bg-brand-surface p-12 text-center shadow-soft">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-brand-gold/25 text-brand-gold-dark">
        <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 7h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Zm0 0 2-3h12l2 3M8 13h8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="mt-4 text-base font-medium text-brand-green-950">{message}</p>
      <p className="mt-1 text-sm text-brand-green-700/65">Please adjust your search filters or try a different keyword.</p>
    </div>
  );
}
