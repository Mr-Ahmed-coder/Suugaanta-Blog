import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyFavorites, removeFavorite } from "../api/services/favoriteService";
import { ErrorState, LoadingSpinner } from "../components/common/FeedbackStates";

const emptyLibrary = {
  authors: [],
  songs: [],
  poetry: [],
  history: [],
  meta: {
    authorsCount: 0,
    songsCount: 0,
    poetryCount: 0,
    historyCount: 0,
    totalItems: 0,
  },
};

const excerpt = (text = "", max = 150) => {
  const cleanText = String(text || "").replace(/\s+/g, " ").trim();
  return cleanText.length > max ? `${cleanText.slice(0, max - 3)}...` : cleanText;
};

const favoriteConfig = {
  authors: {
    title: "Saved Authors",
    typeLabel: "Abwaan",
    getPath: (item) => `/abwaano/${item.slug || item._id}`,
    getTitle: (item) => item.name,
    getSubtitle: (item) => item.specialties?.join(", ") || "Author profile",
    getDescription: (item) => item.legacySummary || item.biography,
    getImage: (item) => item.featuredImage || item.photo,
  },
  songs: {
    title: "Saved Maqal",
    typeLabel: "Maqal",
    getPath: (item) => `/heeso/${item.slug || item._id}`,
    getTitle: (item) => item.title,
    getSubtitle: (item) => item.writer?.name || item.author?.name || item.artist || item.performer || item.category,
    getDescription: (item) => item.description || item.lyrics,
    getImage: (item) => item.thumbnail,
  },
  poetry: {
    title: "Saved Poetry",
    typeLabel: "Gabay",
    getPath: (item) => `/gabayo/${item.slug || item._id}`,
    getTitle: (item) => item.title,
    getSubtitle: (item) => item.author?.name || item.poet || item.category,
    getDescription: (item) => item.content,
    getImage: () => "",
  },
  history: {
    title: "Saved History",
    typeLabel: "Taariikh",
    getPath: (item) => `/taariikho/${item.slug || item._id}`,
    getTitle: (item) => item.title,
    getSubtitle: (item) => item.category,
    getDescription: (item) => item.content,
    getImage: (item) => item.coverImage,
  },
};

const resourceTypeMap = {
  authors: "author",
  songs: "song",
  poetry: "poetry",
  history: "history",
};

function CountCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-brand-gold/20 bg-brand-surface p-4 shadow-soft">
      <p className="font-display text-2xl font-bold text-brand-green-950">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-dark">{label}</p>
    </div>
  );
}

function LibraryCard({ favorite, sectionKey, onRemove, removingId }) {
  const config = favoriteConfig[sectionKey];
  const item = favorite.item;

  if (!item) return null;

  const title = config.getTitle(item);
  const image = config.getImage(item);

  return (
    <article className="grid gap-4 rounded-2xl border border-brand-gold/15 bg-brand-surface p-4 shadow-soft sm:grid-cols-[96px_1fr]">
      <Link to={config.getPath(item)} className="h-24 overflow-hidden rounded-xl bg-brand-green-900">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-3xl text-brand-cream/25">
            {title?.charAt(0) || "S"}
          </div>
        )}
      </Link>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full border border-brand-gold/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-gold-dark">
            {config.typeLabel}
          </span>
          <button
            type="button"
            onClick={() => onRemove(resourceTypeMap[sectionKey], favorite.resourceId)}
            disabled={removingId === favorite.resourceId}
            className="text-xs font-semibold text-red-700 transition hover:text-red-900 disabled:opacity-60"
          >
            {removingId === favorite.resourceId ? "Removing..." : "Remove"}
          </button>
        </div>
        <Link to={config.getPath(item)} className="mt-3 block font-display text-xl font-bold text-brand-green-950 hover:text-brand-green-800">
          {title}
        </Link>
        {config.getSubtitle(item) && (
          <p className="mt-1 text-xs font-semibold text-brand-green-700/75">{config.getSubtitle(item)}</p>
        )}
        {config.getDescription(item) && (
          <p className="mt-2 text-sm leading-6 text-brand-green-800/75">{excerpt(config.getDescription(item))}</p>
        )}
      </div>
    </article>
  );
}

function LibrarySection({ sectionKey, items, onRemove, removingId }) {
  const config = favoriteConfig[sectionKey];

  return (
    <section className="rounded-3xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold text-brand-green-950">{config.title}</h2>
        <span className="rounded-full border border-brand-gold/25 px-3 py-1 text-xs font-semibold text-brand-green-800">
          {items.length} saved
        </span>
      </div>

      {items.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-brand-gold/10 bg-brand-cream/10 p-5 text-sm font-medium text-brand-green-800">
          No saved items in this section yet.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {items.map((favorite) => (
            <LibraryCard
              key={favorite._id}
              favorite={favorite}
              sectionKey={sectionKey}
              onRemove={onRemove}
              removingId={removingId}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MyLibraryPage() {
  const [library, setLibrary] = useState(emptyLibrary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState("");

  const loadLibrary = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getMyFavorites();
      setLibrary({ ...emptyLibrary, ...(response.data || {}) });
    } catch (err) {
      setError(err?.response?.data?.message || "Your library could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "My Library | Suugaanta Soomaliyeed";
    loadLibrary();
  }, []);

  const handleRemove = async (resourceType, resourceId) => {
    setRemovingId(resourceId);
    setError("");

    try {
      await removeFavorite(resourceType, resourceId);
      await loadLibrary();
    } catch (err) {
      setError(err?.response?.data?.message || "Saved item could not be removed.");
    } finally {
      setRemovingId("");
    }
  };

  const meta = library.meta || emptyLibrary.meta;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-brand-gold/25 bg-brand-surface p-6 shadow-soft sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold-dark">Personal Archive</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-brand-green-950">My Library</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-brand-green-800/80">
          A private place to return to the Maqal, poems, histories, and Abwaano profiles you want to keep close.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <CountCard label="Total" value={meta.totalItems || 0} />
        <CountCard label="Abwaano" value={meta.authorsCount || 0} />
        <CountCard label="Maqal" value={meta.songsCount || 0} />
        <CountCard label="Gabayo" value={meta.poetryCount || 0} />
        <CountCard label="Taariikho" value={meta.historyCount || 0} />
      </section>

      {loading && <LoadingSpinner message="Loading your library..." />}
      {error && <ErrorState error={error} />}

      {!loading && !error && (
        <div className="space-y-6">
          <LibrarySection sectionKey="authors" items={library.authors || []} onRemove={handleRemove} removingId={removingId} />
          <LibrarySection sectionKey="songs" items={library.songs || []} onRemove={handleRemove} removingId={removingId} />
          <LibrarySection sectionKey="poetry" items={library.poetry || []} onRemove={handleRemove} removingId={removingId} />
          <LibrarySection sectionKey="history" items={library.history || []} onRemove={handleRemove} removingId={removingId} />
        </div>
      )}
    </div>
  );
}

export default MyLibraryPage;
