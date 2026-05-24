import React, { useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/layout/PageHero";
import { getPoetry } from "../api/services/poetryService";
import useCollection from "../hooks/useCollection";
import FilterBar from "../components/common/FilterBar";
import Pagination from "../components/common/Pagination";
import { LoadingSpinner, ErrorState, EmptyState } from "../components/common/FeedbackStates";

const POETRY_CATEGORIES = ["Jacayl", "Waddani", "Taariikh", "Guubaabo", "Falsafad"];

function GabayoPage() {
  const {
    items: poetryList,
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
  } = useCollection(getPoetry);

  // Keep track of which poem is expanded
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Gabayo"
        title="Somali Poetry Registry"
        description="Browse the rich Somali poetry collection, historical verses, and literature."
      />

      <FilterBar
        search={search}
        onSearchChange={handleSearch}
        category={category}
        onCategoryChange={handleCategory}
        sort={sort}
        onSortChange={handleSort}
        categories={POETRY_CATEGORIES}
        placeholder="Search poems or poets..."
      />

      {loading && <LoadingSpinner message="Loading poetry..." />}

      {error && <ErrorState error={error} />}

      {!loading && !error && poetryList.length === 0 && (
        <EmptyState message="No poems match your search." />
      )}

      {!loading && !error && poetryList.length > 0 && (
        <>
          <div className="grid gap-8 md:grid-cols-2">
            {poetryList.map((poetry) => {
              const isExpanded = expandedId === poetry._id;
              return (
                <article
                  key={poetry._id}
                  className="flex flex-col justify-between rounded-3xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft hover:shadow-md hover:border-brand-gold/40 transition duration-300"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-brand-green-50 px-2.5 py-0.5 text-xs font-medium text-brand-green-800 border border-brand-green-100">
                        {poetry.category}
                      </span>
                      <span className="text-xs font-semibold text-brand-gold-dark">
                        Poet: <strong className="text-brand-green-950">{poetry.author?.name || poetry.poet}</strong>
                      </span>
                    </div>

                    <h3 className="mt-4 font-display text-2xl font-bold text-brand-green-950">
                      {poetry.title}
                    </h3>

                    {/* Poem Content Representation */}
                    <div className="mt-6 rounded-2xl bg-brand-cream/20 p-5 border border-brand-gold/10 font-display italic text-brand-green-900 leading-relaxed text-center whitespace-pre-line">
                      {isExpanded 
                        ? poetry.content 
                        : `${poetry.content.substring(0, 120)}...`}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-4">
                    {/* Tags */}
                    {poetry.tags && poetry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {poetry.tags.map((tag) => (
                          <span key={tag} className="text-[10px] bg-brand-cream/45 px-2 py-0.5 rounded text-brand-green-900/60 font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-brand-gold/10 pt-4">
                      <button
                        onClick={() => toggleExpand(poetry._id)}
                        className="text-xs font-semibold text-brand-gold-dark hover:text-brand-green-900 transition flex items-center gap-1"
                      >
                        {isExpanded ? "▲ Show Less" : "▼ Read Full Poem"}
                      </button>
                      <Link
                        to={`/gabayo/${poetry.slug || poetry._id}`}
                        className="text-xs font-semibold text-brand-green-900 transition hover:text-brand-gold-dark"
                      >
                        Open Page
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

export default GabayoPage;
