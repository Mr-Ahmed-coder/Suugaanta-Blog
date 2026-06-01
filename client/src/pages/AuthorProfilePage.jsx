import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getAuthorHistory,
  getAuthorPoetry,
  getAuthorProfile,
  getAuthorSongs,
} from "../api/services/authorService";
import { ErrorState, LoadingSpinner } from "../components/common/FeedbackStates";
import FavoriteButton from "../components/common/FavoriteButton";
import CommentSection from "../components/comments/CommentSection";
import Pagination from "../components/common/Pagination";
import RelatedContent from "../components/common/RelatedContent";

const tabs = [
  { key: "poetry", label: "Poetry" },
  { key: "songs", label: "Songs" },
  { key: "history", label: "Historical Mentions" },
];

const libraryFetchers = {
  poetry: getAuthorPoetry,
  songs: getAuthorSongs,
  history: getAuthorHistory,
};

const getLifespan = (author) => {
  if (author.birthYear && author.deathYear) return `${author.birthYear} - ${author.deathYear}`;
  if (author.birthYear) return `Born ${author.birthYear}`;
  if (author.deathYear) return `Died ${author.deathYear}`;
  return "Life dates not yet archived";
};

const excerpt = (text = "", max = 180) => {
  const cleanText = text.replace(/\s+/g, " ").trim();
  return cleanText.length > max ? `${cleanText.slice(0, max - 3)}...` : cleanText;
};

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-brand-gold/20 bg-brand-surface/85 p-4 shadow-soft">
      <p className="text-2xl font-bold text-brand-green-950">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-dark">{label}</p>
    </div>
  );
}

function LibraryCard({ type, item }) {
  const title = item.title || item.name;
  const description = item.description || item.content || item.lyrics || "";
  const detailPath =
    type === "poetry"
      ? `/gabayo/${item.slug || item._id}`
      : type === "songs"
        ? `/heeso/${item.slug || item._id}`
        : `/taariikho/${item.slug || item._id}`;

  return (
    <article className="rounded-2xl border border-brand-gold/15 bg-brand-surface p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-brand-green-50 px-3 py-1 text-xs font-semibold text-brand-green-800">
          {item.category || type}
        </span>
        {(item.writer?.name || item.composer?.name || item.author?.name || item.poet || item.artist || item.performer) && (
          <span className="text-xs font-semibold text-brand-gold-dark">
            {item.writer?.name || item.composer?.name || item.author?.name || item.poet || item.artist || item.performer}
          </span>
        )}
      </div>
      <h3 className="mt-4 font-display text-xl font-bold text-brand-green-950">{title}</h3>
      {description && (
        <p className="mt-3 text-sm leading-6 text-brand-green-800/80">{excerpt(description)}</p>
      )}
      <Link
        to={detailPath}
        className="mt-5 inline-flex rounded-full border border-brand-gold/30 px-4 py-2 text-xs font-semibold text-brand-green-900 transition hover:bg-brand-green-50"
      >
        Open Archive Item
      </Link>
    </article>
  );
}

function AuthorProfilePage() {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("poetry");
  const [libraryItems, setLibraryItems] = useState([]);
  const [libraryMeta, setLibraryMeta] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [error, setError] = useState("");
  const [libraryError, setLibraryError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const author = profile?.author;
  const counts = profile?.libraryCounts || {};

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setProfileLoading(true);
      setError("");

      try {
        const response = await getAuthorProfile(slug);
        if (isMounted) {
          setProfile(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Author profile could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!author?.slug) return;

    let isMounted = true;

    async function loadLibrary() {
      setLibraryLoading(true);
      setLibraryError("");

      try {
        const response = await libraryFetchers[activeTab](author.slug, {
          page,
          limit: 6,
          search: search.trim() || undefined,
          sort: "newest",
        });

        if (isMounted) {
          setLibraryItems(response.data || []);
          setLibraryMeta(response.meta || null);
        }
      } catch (err) {
        if (isMounted) {
          setLibraryError(err?.response?.data?.message || "Author library could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setLibraryLoading(false);
        }
      }
    }

    loadLibrary();

    return () => {
      isMounted = false;
    };
  }, [activeTab, author?.slug, page, search]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search]);

  useEffect(() => {
    if (!author) return;

    document.title = `${author.name} | Abwaano | Suugaanta Soomaliyeed`;

    const description = author.legacySummary || excerpt(author.biography || "", 155);
    let meta = document.head.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
  }, [author]);

  const portrait = useMemo(() => author?.featuredImage || author?.photo, [author]);

  if (profileLoading) {
    return <LoadingSpinner message="Loading author profile..." />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!author) {
    return <ErrorState error="Author profile could not be found." />;
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-brand-gold/25 bg-brand-surface shadow-soft">
        <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="min-h-80 bg-brand-green-900">
            {portrait ? (
              <img src={portrait} alt={author.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-80 items-center justify-center font-display text-6xl text-brand-cream/20">
                {author.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <Link to="/abwaano" className="text-sm font-semibold text-brand-gold-dark hover:text-brand-green-900">
              Back to Abwaano
            </Link>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold-dark">
                  Abwaan Profile
                </p>
                <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-brand-green-950 sm:text-5xl">
                  {author.name}
                </h1>
              </div>
              <FavoriteButton resourceType="author" resourceId={author._id} />
            </div>
            <p className="mt-3 text-sm font-semibold text-brand-green-700">{getLifespan(author)}</p>

            {author.specialties?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {author.specialties.map((specialty) => (
                  <span key={specialty} className="rounded-full bg-brand-green-50 px-3 py-1 text-xs font-semibold text-brand-green-800 ring-1 ring-brand-green-100">
                    {specialty}
                  </span>
                ))}
              </div>
            )}

            {(author.legacySummary || author.biography) && (
              <p className="mt-6 max-w-3xl text-base leading-8 text-brand-green-800/85">
                {author.legacySummary || excerpt(author.biography, 320)}
              </p>
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Stat label="Poetry" value={counts.poetry || 0} />
              <Stat label="Songs" value={counts.songs || 0} />
              <Stat label="History" value={counts.history || 0} />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft sm:p-8">
        <h2 className="font-display text-2xl font-bold text-brand-green-950">Biography</h2>
        <div className="mt-5 whitespace-pre-line text-base leading-8 text-brand-green-900">
          {author.biography || "A full biography has not been archived yet."}
        </div>
      </section>

      <section className="rounded-3xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold-dark">Searchable Library</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-brand-green-950">Archive Connected to {author.name}</h2>
          </div>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${author.name} poems...`}
            className="w-full rounded-2xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-3 text-sm text-brand-green-950 placeholder:text-brand-green-700/40 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark lg:max-w-sm"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-b border-brand-gold/15 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? "bg-brand-green-900 text-brand-cream"
                  : "bg-brand-green-50 text-brand-green-800 hover:bg-brand-green-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {libraryLoading && <LoadingSpinner message="Loading archive items..." />}
        {libraryError && <ErrorState error={libraryError} />}

        {!libraryLoading && !libraryError && libraryItems.length === 0 && (
          <div className="py-12 text-center text-sm font-medium text-brand-green-800">
            No connected archive items found yet.
          </div>
        )}

        {!libraryLoading && !libraryError && libraryItems.length > 0 && (
          <>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {libraryItems.map((item) => (
                <LibraryCard key={item._id} type={activeTab} item={item} />
              ))}
            </div>
            <Pagination meta={libraryMeta} onPageChange={setPage} />
          </>
        )}
      </section>

      <section className="rounded-3xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft sm:p-8">
        <h2 className="font-display text-2xl font-bold text-brand-green-950">Media Archive</h2>
        {author.mediaAssets?.length ? (
          <div className="mt-5 space-y-3">
            {author.mediaAssets.map((asset) => (
              <a
                key={`${asset.url}-${asset.title}`}
                href={asset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl border border-brand-gold/15 p-4 transition hover:bg-brand-green-50"
              >
                <p className="text-sm font-semibold text-brand-green-950">{asset.title || asset.type}</p>
                {asset.description && <p className="mt-1 text-xs text-brand-green-700">{asset.description}</p>}
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-brand-green-800/75">
            Future media support is ready for interviews, documentaries, manuscripts, and gallery assets.
          </p>
        )}
      </section>

      <RelatedContent resourceType="author" resourceId={author._id} />

      <CommentSection
        resourceType="author"
        resourceId={author._id}
        title={`${author.name} Discussion`}
      />
    </div>
  );
}

export default AuthorProfilePage;
