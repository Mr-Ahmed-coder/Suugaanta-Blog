import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthors } from "../api/services/authorService";
import { getHistory } from "../api/services/historyService";
import { getPoetry } from "../api/services/poetryService";
import { getSongs } from "../api/services/songService";
import { getStats } from "../api/services/statsService";

const emptyStats = { songs: 0, poetry: 0, history: 0, authors: 0 };

function HomePage() {
  const [stats, setStats] = useState(emptyStats);
  const [featured, setFeatured] = useState({ song: null, poem: null, article: null, author: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchHomeData() {
      try {
        const [statsRes, songsRes, poetryRes, historyRes, authorsRes] = await Promise.all([
          getStats(),
          getSongs({ limit: 1, sort: "newest" }),
          getPoetry({ limit: 1, sort: "newest" }),
          getHistory({ limit: 1, sort: "newest" }),
          getAuthors({ limit: 1, sort: "newest" }),
        ]);

        if (!isMounted) return;

        setStats({ ...emptyStats, ...(statsRes.data || {}) });
        setFeatured({
          song: songsRes?.data?.[0] || null,
          poem: poetryRes?.data?.[0] || null,
          article: historyRes?.data?.[0] || null,
          author: authorsRes?.data?.[0] || null,
        });
      } catch (err) {
        console.error("Error loading homepage dynamic details:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchHomeData();
    window.addEventListener("archive:stats-invalidated", fetchHomeData);
    window.addEventListener("focus", fetchHomeData);

    return () => {
      isMounted = false;
      window.removeEventListener("archive:stats-invalidated", fetchHomeData);
      window.removeEventListener("focus", fetchHomeData);
    };
  }, []);

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-brand-gold/30 bg-gradient-to-br from-brand-green-950 to-brand-green-900 px-6 py-16 shadow-soft text-brand-cream sm:px-12 md:py-20 text-center">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#FFD700_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-gold">Cultural Heritage Archive</p>
        <h1 className="mt-4 font-display text-4xl font-bold sm:text-6xl tracking-wide">
          Suugaanta Soomaliyeed
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-brand-cream/80 sm:text-lg">
          Welcome to the home of Somali poetry, Maqal collections, and historical archives. Discover and reconnect with the cultural wealth preserved across generations.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/heeso"
            className="rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-green-950 hover:bg-brand-gold-dark transition shadow-soft"
          >
            Explore Maqal
          </Link>
          <Link
            to="/gabayo"
            className="rounded-full border border-brand-gold/50 px-6 py-3 text-sm font-semibold text-brand-cream hover:bg-brand-cream/10 transition"
          >
            Read Poetry
          </Link>
        </div>
      </section>

      <section className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Maqal", count: stats.songs, link: "/heeso", eyebrow: "Audio" },
          { label: "Gabayo", count: stats.poetry, link: "/gabayo", eyebrow: "Poetry" },
          { label: "Taariikho", count: stats.history, link: "/taariikho", eyebrow: "History" },
          { label: "Abwaano", count: stats.authors, link: "/abwaano", eyebrow: "Authors" },
        ].map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="group rounded-2xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft hover:border-brand-gold/55 hover:shadow-md transition duration-300 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-brand-gold/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-gold-dark">
                {stat.eyebrow}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-gold-dark group-hover:text-brand-green-900 transition">Explore</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-display font-bold text-brand-green-950">
                {loading ? "..." : stat.count}
              </p>
              <h3 className="mt-1 text-sm font-medium text-brand-green-800/80">{stat.label}</h3>
            </div>
          </Link>
        ))}
      </section>

      <section className="rounded-3xl border border-brand-gold/20 bg-brand-surface p-8 md:p-12 shadow-soft text-center max-w-4xl mx-auto">
        <span className="text-brand-gold-dark text-3xl font-serif">"</span>
        <blockquote className="font-display italic text-lg md:text-xl text-brand-green-900 leading-relaxed">
          Sida tegeyba tegey, ee wax kale toshaan, taariikhdu waa laba: mid ku tidhaahda ku dayo, iyo mid ku tidhaahda ka digtoonow.
        </blockquote>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-brand-gold-dark">Somali Proverb</p>
      </section>

      {!loading && (featured.song || featured.poem || featured.article || featured.author) && (
        <section className="space-y-6">
          <h2 className="font-display text-3xl text-brand-green-950 font-bold text-center">Featured Heritage Highlights</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {featured.song && (
              <div className="rounded-2xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-gold-dark">Featured Maqal</span>
                  <h3 className="mt-2 font-display text-xl font-bold text-brand-green-950">{featured.song.title}</h3>
                  <p className="text-xs font-medium text-brand-green-800">
                    Artist: {featured.song.writer?.name || featured.song.author?.name || featured.song.artist || featured.song.performer || "Archive entry"}
                  </p>
                  {featured.song.description && (
                    <p className="mt-3 text-xs leading-relaxed text-brand-green-800/70 line-clamp-2">{featured.song.description}</p>
                  )}
                </div>
                <Link to="/heeso" className="mt-4 inline-flex items-center text-xs font-semibold text-brand-gold-dark hover:text-brand-green-950">
                  Open Maqal Archive
                </Link>
              </div>
            )}

            {featured.poem && (
              <div className="rounded-2xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-gold-dark">Featured Poem</span>
                  <h3 className="mt-2 font-display text-xl font-bold text-brand-green-950">{featured.poem.title}</h3>
                  <p className="text-xs font-medium text-brand-green-800">
                    Poet: {featured.poem.author?.name || featured.poem.poet || "Traditional / Anonymous"}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-brand-green-800/70 line-clamp-2 italic font-serif">
                    "{featured.poem.content?.substring(0, 80)}..."
                  </p>
                </div>
                <Link to="/gabayo" className="mt-4 inline-flex items-center text-xs font-semibold text-brand-gold-dark hover:text-brand-green-950">
                  Read Poetry
                </Link>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default HomePage;
