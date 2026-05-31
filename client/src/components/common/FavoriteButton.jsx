import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  addFavorite,
  getFavoriteStatus,
  removeFavorite,
} from "../../api/services/favoriteService";
import { useAuth } from "../../context/AuthContext";

function FavoriteButton({ resourceType, resourceId, compact = false }) {
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      if (!isAuthenticated || !resourceType || !resourceId) {
        setSaved(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await getFavoriteStatus(resourceType, resourceId);
        if (isMounted) {
          setSaved(Boolean(response.data?.saved));
        }
      } catch (err) {
        if (isMounted) {
          setError("Save status unavailable.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadStatus();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, resourceType, resourceId]);

  const handleToggle = async () => {
    if (!isAuthenticated || loading) return;

    const previous = saved;
    setSaved(!previous);
    setLoading(true);
    setError("");

    try {
      if (previous) {
        await removeFavorite(resourceType, resourceId);
      } else {
        await addFavorite({ resourceType, resourceId });
      }
    } catch (err) {
      setSaved(previous);
      setError(err?.response?.data?.message || "Library update failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className="inline-flex items-center justify-center rounded-full border border-brand-gold/30 bg-brand-surface px-4 py-2 text-xs font-semibold text-brand-green-900 shadow-soft transition hover:bg-brand-green-50"
      >
        Login to Save
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold shadow-soft transition disabled:cursor-not-allowed disabled:opacity-70 ${
          saved
            ? "border border-brand-gold/45 bg-brand-gold text-brand-green-950 hover:bg-brand-gold-dark"
            : "border border-brand-gold/30 bg-brand-surface text-brand-green-900 hover:bg-brand-green-50"
        } ${compact ? "px-3 py-1.5" : ""}`}
      >
        {loading ? "Saving..." : saved ? "Saved" : "Save to Library"}
      </button>
      {error && <p className="text-xs font-semibold text-red-700">{error}</p>}
    </div>
  );
}

export default FavoriteButton;
