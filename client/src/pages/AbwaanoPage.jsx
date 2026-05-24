import React, { useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/layout/PageHero";
import { getAuthors } from "../api/services/authorService";
import useCollection from "../hooks/useCollection";
import FilterBar from "../components/common/FilterBar";
import Pagination from "../components/common/Pagination";
import { LoadingSpinner, ErrorState, EmptyState } from "../components/common/FeedbackStates";

const SPECIALTIES = ["Poetry", "Singing", "Music Production", "Playwriting", "Patriotism"];

function AbwaanoPage() {
  const {
    items: authors,
    meta,
    loading,
    error,
    page,
    setPage,
    search,
    handleSearch,
    category: specialty,
    handleCategory: handleSpecialty,
    sort,
    handleSort,
  } = useCollection(getAuthors);

  // Selected author for detailed biography modal
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Abwaano"
        title="Somali Poets & Artists Registry"
        description="Discover biographies of pioneers who shaped Somali literature, music, and art."
      />

      <FilterBar
        search={search}
        onSearchChange={handleSearch}
        category={specialty}
        onCategoryChange={handleSpecialty}
        sort={sort}
        onSortChange={handleSort}
        categories={SPECIALTIES}
        placeholder="Search poets or singers..."
        categoryLabel="Specialty"
      />

      {loading && <LoadingSpinner message="Loading artists..." />}

      {error && <ErrorState error={error} />}

      {!loading && !error && authors.length === 0 && (
        <EmptyState message="No artists match your search." />
      )}

      {!loading && !error && authors.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {authors.map((author) => (
              <article
                key={author._id}
                className="flex flex-col justify-between overflow-hidden rounded-3xl border border-brand-gold/20 bg-brand-surface shadow-soft hover:shadow-md hover:border-brand-gold/40 transition duration-300"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative h-48 w-full bg-gradient-to-br from-brand-green-900 to-brand-green-950 flex items-center justify-center text-brand-cream/15 font-display text-4xl select-none">
                    {author.photo ? (
                      <img
                        src={author.photo}
                        alt={author.name}
                        className="h-full w-full object-cover opacity-80"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <span className="absolute bottom-4 left-4 font-display text-xl font-bold text-white tracking-wide">
                      {author.name}
                    </span>
                  </div>

                  <div className="p-6">
                    {/* Specialties */}
                    {author.specialties && author.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {author.specialties.map((spec) => (
                          <span key={spec} className="inline-flex items-center rounded-full bg-brand-green-50 px-2 py-0.5 text-[10px] font-medium text-brand-green-800 border border-brand-green-100">
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="mt-4 text-xs leading-relaxed text-brand-green-800/80 line-clamp-3">
                      {author.biography}
                    </p>
                  </div>
                </div>

                <div className="p-6 border-t border-brand-gold/10 flex items-center justify-between">
                  {author.birthYear && (
                    <span className="text-[11px] font-semibold text-brand-gold-dark">
                      Born: {author.birthYear}
                    </span>
                  )}
                  <button
                    onClick={() => setSelectedAuthor(author)}
                    className="text-xs font-semibold text-brand-gold-dark hover:text-brand-green-900 transition flex items-center gap-1"
                  >
                    Read Bio →
                  </button>
                  <Link
                    to={`/abwaano/${author.slug || author._id}`}
                    className="text-xs font-semibold text-brand-green-900 transition hover:text-brand-gold-dark"
                  >
                    Open Page
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}

      {/* Author Bio Modal */}
      {selectedAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-2xl overflow-y-auto max-h-[90vh] rounded-3xl border border-brand-gold/30 bg-brand-surface p-6 shadow-soft md:p-8">
            <button
              onClick={() => setSelectedAuthor(null)}
              className="absolute top-4 right-4 text-2xl text-brand-green-800 hover:text-brand-green-950 transition"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Photo */}
              <div className="h-32 w-32 md:h-40 md:w-40 flex-shrink-0 rounded-2xl overflow-hidden bg-brand-green-900 border border-brand-gold/30 shadow-soft">
                {selectedAuthor.photo ? (
                  <img
                    src={selectedAuthor.photo}
                    alt={selectedAuthor.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center font-display text-4xl text-brand-cream/20">
                    ✍️
                  </div>
                )}
              </div>

              <div>
                <h2 className="font-display text-2xl font-bold text-brand-green-950">
                  {selectedAuthor.name}
                </h2>
                {selectedAuthor.birthYear && (
                  <p className="text-xs text-brand-gold-dark font-medium mt-1">
                    Birth Year: {selectedAuthor.birthYear}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedAuthor.specialties.map((spec) => (
                    <span key={spec} className="inline-flex items-center rounded-full bg-brand-green-50 px-2 py-0.5 text-[10px] font-medium text-brand-green-800 border border-brand-green-100">
                      {spec}
                    </span>
                  ))}
                </div>

                <hr className="my-4 border-brand-gold/25" />

                <p className="text-brand-green-900 text-sm leading-relaxed whitespace-pre-line">
                  {selectedAuthor.biography}
                </p>

                {selectedAuthor.socialLinks && Object.values(selectedAuthor.socialLinks).some(Boolean) && (
                  <div className="mt-6 border-t border-brand-gold/20 pt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-gold-dark mb-2">Social Connections:</h4>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(selectedAuthor.socialLinks).map(([platform, url]) => {
                        if (!url) return null;
                        return (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-brand-green-800 hover:text-brand-gold-dark transition font-semibold capitalize"
                          >
                            🔗 {platform}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AbwaanoPage;
