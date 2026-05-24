import React, { useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/layout/PageHero";
import { getHistory } from "../api/services/historyService";
import useCollection from "../hooks/useCollection";
import FilterBar from "../components/common/FilterBar";
import Pagination from "../components/common/Pagination";
import { LoadingSpinner, ErrorState, EmptyState } from "../components/common/FeedbackStates";

const HISTORY_CATEGORIES = ["Pre-Colonial", "Colonial Era", "Independence", "Modern Era", "Arts & Culture"];

function TaariikhoPage() {
  const {
    items: articles,
    meta,
    loading,
    error,
    page,
    setPage,
    search,
    handleSearch,
    category,
    handleCategory,
    sort,
    handleSort,
  } = useCollection(getHistory);

  // Selected article for detailed reading modal
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Taariikho"
        title="Somali Historical Archives"
        description="Learn about historical milestones, rich culture, and the journey of the Somali people."
      />

      <FilterBar
        search={search}
        onSearchChange={handleSearch}
        category={category}
        onCategoryChange={handleCategory}
        sort={sort}
        onSortChange={handleSort}
        categories={HISTORY_CATEGORIES}
        placeholder="Search history, events..."
      />

      {loading && <LoadingSpinner message="Loading articles..." />}

      {error && <ErrorState error={error} />}

      {!loading && !error && articles.length === 0 && (
        <EmptyState message="No history articles match your search." />
      )}

      {!loading && !error && articles.length > 0 && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {articles.map((article) => (
              <article
                key={article._id}
                className="flex flex-col justify-between overflow-hidden rounded-3xl border border-brand-gold/20 bg-brand-surface shadow-soft hover:shadow-md hover:border-brand-gold/40 transition duration-300"
              >
                <div>
                  {/* Article Cover Image */}
                  {article.coverImage && (
                    <div className="relative h-48 w-full bg-brand-green-900 overflow-hidden border-b border-brand-gold/10">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="h-full w-full object-cover opacity-90 transition duration-500 hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-brand-green-50 px-2.5 py-0.5 text-xs font-medium text-brand-green-800 border border-brand-green-100">
                        {article.category}
                      </span>
                    </div>

                    <h3 className="mt-4 font-display text-2xl font-bold text-brand-green-950 leading-tight">
                      {article.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-brand-green-800/80 line-clamp-4">
                      {article.content}
                    </p>
                  </div>
                </div>

                <div className="bg-brand-cream/15 p-6 border-t border-brand-gold/10 flex flex-col gap-4">
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {article.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-brand-cream/80 px-2 py-0.5 rounded text-brand-green-900/60 font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedArticle(article)}
                      className="text-xs font-semibold text-brand-gold-dark hover:text-brand-green-900 transition flex items-center gap-1"
                    >
                      Read Full Article →
                    </button>
                    <Link
                      to={`/taariikho/${article.slug || article._id}`}
                      className="text-xs font-semibold text-brand-green-900 transition hover:text-brand-gold-dark"
                    >
                      Open Page
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}

      {/* Detail Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-3xl overflow-y-auto max-h-[90vh] rounded-3xl border border-brand-gold/30 bg-brand-surface p-0 shadow-soft">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition"
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Modal Cover Image */}
            {selectedArticle.coverImage && (
              <div className="relative h-64 w-full bg-brand-green-900 overflow-hidden">
                <img
                  src={selectedArticle.coverImage}
                  alt={selectedArticle.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30"></div>
              </div>
            )}

            <div className="p-6 md:p-8">
              <span className="inline-flex items-center rounded-full bg-brand-green-50 px-2.5 py-0.5 text-xs font-medium text-brand-green-800 border border-brand-green-100">
                {selectedArticle.category}
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold text-brand-green-950 leading-tight">
                {selectedArticle.title}
              </h2>

              <hr className="my-6 border-brand-gold/25" />

              <div className="prose max-w-none text-brand-green-900 text-base leading-relaxed whitespace-pre-line">
                {selectedArticle.content}
              </div>

              {selectedArticle.references && selectedArticle.references.length > 0 && (
                <div className="mt-8 border-t border-brand-gold/20 pt-6">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-gold-dark">References:</h4>
                  <ul className="mt-2 list-disc list-inside text-xs text-brand-green-800 space-y-1">
                    {selectedArticle.references.map((ref, idx) => (
                      <li key={idx}>{ref}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaariikhoPage;
