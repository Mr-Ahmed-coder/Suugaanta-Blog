import React, { useEffect, useState } from "react";

function CommentForm({
  initialValue = "",
  submitLabel = "Post Comment",
  onCancel,
  onSubmit,
  loading = false,
}) {
  const [content, setContent] = useState(initialValue);
  const [error, setError] = useState("");

  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedContent = content.trim();

    if (trimmedContent.length < 2) {
      setError("Please write at least 2 characters.");
      return;
    }

    if (trimmedContent.length > 1000) {
      setError("Comments cannot exceed 1000 characters.");
      return;
    }

    setError("");
    await onSubmit(trimmedContent);

    if (!initialValue) {
      setContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={4}
        maxLength={1000}
        placeholder="Share a respectful reflection about this archive item..."
        className="block w-full rounded-2xl border border-brand-gold/25 bg-brand-cream/10 px-4 py-3 text-sm leading-6 text-brand-green-950 placeholder:text-brand-green-700/45 transition focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {error && <p className="text-xs font-semibold text-red-700">{error}</p>}
          <p className="text-xs text-brand-green-700/70">{content.trim().length}/1000 characters</p>
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-brand-gold/30 px-4 py-2 text-xs font-semibold text-brand-green-900 transition hover:bg-brand-green-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-brand-green-900 px-5 py-2 text-xs font-semibold text-brand-cream shadow-soft transition hover:bg-brand-green-800 disabled:cursor-not-allowed disabled:bg-brand-green-900/60"
          >
            {loading ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

export default CommentForm;
