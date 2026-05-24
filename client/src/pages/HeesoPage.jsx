import React, { useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/layout/PageHero";
import { getSongs } from "../api/services/songService";
import useCollection from "../hooks/useCollection";
import FilterBar from "../components/common/FilterBar";
import Pagination from "../components/common/Pagination";
import { LoadingSpinner, ErrorState, EmptyState } from "../components/common/FeedbackStates";

const SONG_CATEGORIES = ["Jacayl", "Waddani", "Aroos", "Classic"];

function HeesoPage() {
  const {
    items: songs,
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
  } = useCollection(getSongs);

  // Simple UI state for a simulated play button
  const [playingId, setPlayingId] = useState(null);

  const togglePlay = (id) => {
    setPlayingId(playingId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Heeso"
        title="Somali Song Archive"
        description="Explore classic and modern Somali songs, audio archive, and lyrics."
      />

      <FilterBar
        search={search}
        onSearchChange={handleSearch}
        category={category}
        onCategoryChange={handleCategory}
        sort={sort}
        onSortChange={handleSort}
        categories={SONG_CATEGORIES}
        placeholder="Search songs or artists..."
      />

      {loading && <LoadingSpinner message="Loading songs..." />}

      {error && <ErrorState error={error} />}

      {!loading && !error && songs.length === 0 && (
        <EmptyState message="No songs match your search." />
      )}

      {!loading && !error && songs.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {songs.map((song) => (
              <article
                key={song._id}
                className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-brand-gold/20 bg-brand-surface shadow-soft hover:shadow-md hover:border-brand-gold/40 transition duration-300"
              >
                <div>
                  {/* Song Thumbnail */}
                  <div className="relative h-40 w-full bg-gradient-to-br from-brand-green-900 to-brand-green-950 flex items-center justify-center text-brand-cream/15 font-display text-4xl select-none overflow-hidden border-b border-brand-gold/10">
                    {song.thumbnail ? (
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="h-full w-full object-cover opacity-85"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="opacity-25">🎵</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  </div>

                  <div className="p-6 pb-0">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-brand-green-50 px-2.5 py-0.5 text-xs font-medium text-brand-green-800 border border-brand-green-100">
                        {song.category}
                      </span>
                      {song.year && (
                        <span className="text-xs font-semibold text-brand-gold-dark">
                          {song.year}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 font-display text-xl text-brand-green-950 font-semibold line-clamp-1">
                      {song.title}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-brand-green-800/80">
                      Artist: <strong className="text-brand-green-950">{song.writer?.name || song.author?.name || song.artist || song.performer}</strong>
                    </p>

                    {song.description && (
                      <p className="mt-3 text-xs leading-5 text-brand-green-800/70 line-clamp-2">
                        {song.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-4 flex flex-col gap-4">
                  {/* Tags */}
                  {song.tags && song.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {song.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-brand-cream/45 px-2 py-0.5 rounded text-brand-green-900/60 font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Playback Simulation */}
                  <div className="flex items-center justify-between border-t border-brand-gold/10 pt-4">
                    <button
                      onClick={() => togglePlay(song._id)}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                        playingId === song._id
                          ? "bg-brand-gold text-brand-green-950"
                          : "bg-brand-green-900 text-brand-cream hover:bg-brand-green-800"
                      }`}
                    >
                      <span>{playingId === song._id ? "⏸ Pause" : "▶ Listen"}</span>
                    </button>
                    {playingId === song._id && (
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-1 animate-pulse bg-brand-gold rounded-full"></span>
                        <span className="h-3 w-1 animate-pulse bg-brand-gold rounded-full delay-75"></span>
                        <span className="h-1.5 w-1 animate-pulse bg-brand-gold rounded-full delay-150"></span>
                        <span className="text-[10px] text-brand-gold-dark font-medium ml-1">Playing...</span>
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/heeso/${song.slug || song._id}`}
                    className="inline-flex justify-center rounded-full border border-brand-gold/35 px-4 py-2 text-xs font-semibold text-brand-green-900 transition hover:bg-brand-green-50"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

export default HeesoPage;
