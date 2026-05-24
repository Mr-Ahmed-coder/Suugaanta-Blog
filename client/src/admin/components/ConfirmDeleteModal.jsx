import React from "react";

function ConfirmDeleteModal({ isOpen, onClose, onConfirm, itemName, loading }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-3xl border border-brand-gold/30 bg-brand-surface p-6 shadow-soft text-center md:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100 text-2xl">
          ⚠️
        </div>

        <h3 className="mt-4 font-display text-xl font-bold text-brand-green-950">
          Confirm Deletion
        </h3>
        <p className="mt-2 text-sm text-brand-green-800 leading-relaxed">
          You are about to delete{" "}
          <strong className="text-red-700 font-bold">"{itemName}"</strong>. This action is permanent and cannot be undone.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-full border border-brand-gold/40 px-5 py-2.5 text-xs font-semibold text-brand-green-950 hover:bg-brand-green-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-full bg-red-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-700 disabled:bg-red-600/60 transition shadow-soft flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white"></span>
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
