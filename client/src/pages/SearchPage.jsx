import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { globalSearch } from "../api/services/searchService";
import { ErrorState, LoadingSpinner } from "../components/common/FeedbackStates";

const emptyResults = {
  authors: [],
  songs: [],
  poetry: [],
  history: [],
  meta: {
    query: "",
    authorsCount: 0,
    songsCount: 0,
    poetryCount: 0,
    historyCount: 0,
    totalResults: 0,
  },
};

const excerpt = (text = "", max = 170) => {
  const cleanText = String(text || "").replace(/\s+/g, " ").trim();
  return cleanText.length > max ? `${cleanText.slice(0, max - 3)}...` : cleanText;
};

const getAuthorLifespan = (author) => {
  if (author.birthYear && author.deathYear) return `${author.birthYear} - ${author.deathYear}`;
  if (author.birthYear) return `Born ${author.birthYear}`;
  if (author.deathYear) return `Died ${author.deathYear}`;
  return "";
};

function CountCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-brand-gold/20 bg-brand-surface p-4 shadow-soft">
      <p className="font-display text-2xl font-bold text-brand-green-950">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-dark">{label}</p>
    </div>
  );
}

function ResultCard({ to, type, title, subtitle, description, image }) {
  return (
    <Link
      to={to}
      className="group grid gap-4 rounded-2xl border border-brand-gold/15 bg-brand-surface p-4 shadow-soft transition hover:border-brand-gold/45 hover:bg-brand-cream/30 sm:grid-cols-[96px_1fr]"
    >
      <div className="h-24 overflow-hidden rounded-xl bg-brand-green-900">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-3xl text-brand-cream/25">
            {title?.charAt(0) || "S"}
          </div>
        )}
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-brand-gold/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-gold-dark">
            {type}
          </span>
          {subtitle && <span className="text-xs font-semibold text-brand-green-700/75">{subtitle}</span>}
        </div>
        <h3 className="mt-3 font-display text-xl font-bold text-brand-green-950">{title}</h3>
        {description && <p className="mt-2 text-sm leading-6 text-brand-green-800/75">{excerpt(description)}</p>}
      </div>
    </Link>
  );
}

function ResultSection({ title, count, children }) {
  return (
    <section className="rounded-3xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold text-brand-green-950">{title}</h2>
        <span className="rounded-full border border-brand-gold/25 px-3 py-1 text-xs font-semibold text-brand-green-800">
          {count} found
        </span>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState(emptyResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  useEffect(() => {
    let isMounted = true;

    async function runSearch() {
      if (!query) {
        setResults(emptyResults);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await globalSearch({ q: query, limit: 6 });
        if (isMounted) {
          setResults(response.data || emptyResults);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Search could not be completed.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    runSearch();

    return () => {
      isMounted = false;
    };
  }, [query]);

  useEffect(() => {
    document.title = query ? `Search "${query}" | Suugaanta Soomaliyeed` : "Search | Suugaanta Soomaliyeed";
  }, [query]);

  const meta = results.meta || emptyResults.meta;
  const hasResults = meta.totalResults > 0;

  const sections = useMemo(() => [
    {
      key: "authors",
      title: "Abwaano",
      count: meta.authorsCount || 0,
      items: results.authors || [],
      render: (author) => (
        <ResultCard
          key={author._id}
          to={`/abwaano/${author.slug || author._id}`}
          type="Abwaan"
          title={author.name}
          subtitle={getAuthorLifespan(author)}
          description={author.legacySummary || author.biography}
          image={author.featuredImage || author.photo}
        />
      ),
    },
    {
      key: "songs",
      title: "Heeso",
      count: meta.songsCount || 0,
      items: results.songs || [],
      render: (song) => (
        <ResultCard
          key={song._id}
          to={`/heeso/${song.slug || song._id}`}
          type="Hees"
          title={song.title}
          subtitle={song.writer?.name || song.author?.name || song.artist || song.performer || song.category}
          description={song.description || song.lyrics}
          image={song.thumbnail}
        />
      ),
    },
    {
      key: "poetry",
      title: "Gabayo",
      count: meta.poetryCount || 0,
      items: results.poetry || [],
      render: (poem) => (
        <ResultCard
          key={poem._id}
          to={`/gabayo/${poem.slug || poem._id}`}
          type="Gabay"
          title={poem.title}
          subtitle={poem.author?.name || poem.poet || poem.category}
          description={poem.content}
        />
      ),
    },
    {
      key: "history",
      title: "Taariikho",
      count: meta.historyCount || 0,
      items: results.history || [],
      render: (article) => (
        <ResultCard
          key={article._id}
          to={`/taariikho/${article.slug || article._id}`}
          type="Taariikh"
          title={article.title}
          subtitle={article.category}
          description={article.content}
          image={article.coverImage}
        />
      ),
    },
  ], [meta, results]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextQuery = inputValue.trim();

    if (nextQuery) {
      setSearchParams({ q: nextQuery });
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-brand-gold/25 bg-brand-surface p-6 shadow-soft sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold-dark">Archive Search</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-brand-green-950">Search the Archive</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-brand-green-800/80">
          Search across Abwaano profiles, songs, poetry, and historical records from one quiet catalog view.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Search Hadraawi, gabay, hees..."
            className="min-h-12 flex-1 rounded-2xl border border-brand-gold/30 bg-brand-cream/10 px-4 text-sm text-brand-green-950 placeholder:text-brand-green-700/45 transition focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark"
          />
          <button
            type="submit"
            className="rounded-2xl bg-brand-green-900 px-6 py-3 text-sm font-semibold text-brand-cream shadow-soft transition hover:bg-brand-green-800"
          >
            Search
          </button>
        </form>
      </section>

      {query && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <CountCard label="Total" value={meta.totalResults || 0} />
          <CountCard label="Abwaano" value={meta.authorsCount || 0} />
          <CountCard label="Heeso" value={meta.songsCount || 0} />
          <CountCard label="Gabayo" value={meta.poetryCount || 0} />
          <CountCard label="Taariikho" value={meta.historyCount || 0} />
        </section>
      )}

      {loading && <LoadingSpinner message="Searching the archive..." />}
      {error && <ErrorState error={error} />}

      {!loading && !error && !query && (
        <div className="rounded-3xl border border-brand-gold/20 bg-brand-surface p-10 text-center shadow-soft">
          <p className="text-sm font-medium text-brand-green-800">Enter a keyword to begin exploring the archive.</p>
        </div>
      )}

      {!loading && !error && query && !hasResults && (
        <div className="rounded-3xl border border-brand-gold/20 bg-brand-surface p-10 text-center shadow-soft">
          <p className="text-sm font-medium text-brand-green-800">No archive results found for "{query}".</p>
        </div>
      )}

      {!loading && !error && hasResults && (
        <div className="space-y-6">
          <p className="text-sm font-semibold text-brand-green-800">
            Results for <span className="text-brand-green-950">"{query}"</span>
          </p>
          {sections
            .filter((section) => section.items.length > 0)
            .map((section) => (
              <ResultSection key={section.key} title={section.title} count={section.count}>
                {section.items.map(section.render)}
              </ResultSection>
            ))}
        </div>
      )}
    </div>
  );
}

export default SearchPage;
