import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStats } from "../../api/services/statsService";
import { useAuth } from "../../context/AuthContext";
import { LoadingSpinner } from "../../components/common/FeedbackStates";

const emptyStats = { songs: 0, poetry: 0, history: 0, authors: 0, users: 0 };

function DashboardOverview() {
  const { isAdmin } = useAuth();
  const [counts, setCounts] = useState(emptyStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardCounts() {
      try {
        const response = await getStats();

        if (isMounted) {
          setCounts({ ...emptyStats, ...(response.data || {}) });
        }
      } catch (error) {
        console.error("Error loading CMS overview stats:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardCounts();
    window.addEventListener("archive:stats-invalidated", loadDashboardCounts);
    window.addEventListener("focus", loadDashboardCounts);

    return () => {
      isMounted = false;
      window.removeEventListener("archive:stats-invalidated", loadDashboardCounts);
      window.removeEventListener("focus", loadDashboardCounts);
    };
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading CMS statistics..." />;
  }

  const statCards = [
    { label: "Heeso", count: counts.songs, link: "/admin/songs", icon: "Songs" },
    { label: "Gabayo", count: counts.poetry, link: "/admin/poetry", icon: "Poetry" },
    { label: "Taariikho", count: counts.history, link: "/admin/history", icon: "History" },
    { label: "Abwaano", count: counts.authors, link: "/admin/authors", icon: "Authors" },
  ];

  if (isAdmin) {
    statCards.push({ label: "Users", count: counts.users, link: "/admin/users", icon: "Users" });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand-green-950">Overview</h1>
        <p className="mt-1 text-sm text-brand-green-800">
          Live CMS statistics are pulled directly from MongoDB and refresh after archive changes.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-brand-gold/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-gold-dark">
                {card.icon}
              </span>
              <Link
                to={card.link}
                className="text-[11px] font-bold uppercase tracking-wider text-brand-gold-dark hover:text-brand-green-950 transition"
              >
                Manage
              </Link>
            </div>
            <div className="mt-6">
              <p className="text-3xl font-display font-bold text-brand-green-950">{card.count}</p>
              <h3 className="text-xs font-semibold text-brand-green-800/70 uppercase tracking-wider mt-1">{card.label}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft">
          <h3 className="font-display text-lg font-bold text-brand-green-950 mb-4">Quick Actions</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/admin/songs/new"
              className="rounded-xl border border-brand-gold/10 bg-brand-cream/15 p-4 hover:border-brand-gold/30 hover:bg-brand-cream/35 transition"
            >
              <p className="text-sm font-bold text-brand-green-950">Add Song</p>
              <p className="mt-1 text-[11px] text-brand-green-700/80">Create a new song with metadata and lyrics</p>
            </Link>

            <Link
              to="/admin/poetry/new"
              className="rounded-xl border border-brand-gold/10 bg-brand-cream/15 p-4 hover:border-brand-gold/30 hover:bg-brand-cream/35 transition"
            >
              <p className="text-sm font-bold text-brand-green-950">Add Poem</p>
              <p className="mt-1 text-[11px] text-brand-green-700/80">Register a new poem with content and categories</p>
            </Link>

            <Link
              to="/admin/history/new"
              className="rounded-xl border border-brand-gold/10 bg-brand-cream/15 p-4 hover:border-brand-gold/30 hover:bg-brand-cream/35 transition"
            >
              <p className="text-sm font-bold text-brand-green-950">Add Article</p>
              <p className="mt-1 text-[11px] text-brand-green-700/80">Publish a historical article or chronicle</p>
            </Link>

            <Link
              to="/admin/authors/new"
              className="rounded-xl border border-brand-gold/10 bg-brand-cream/15 p-4 hover:border-brand-gold/30 hover:bg-brand-cream/35 transition"
            >
              <p className="text-sm font-bold text-brand-green-950">Add Abwaan</p>
              <p className="mt-1 text-[11px] text-brand-green-700/80">Create a canonical profile for a poet or artist</p>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-brand-green-950 mb-3">Editorial Guidelines</h3>
            <p className="text-xs text-brand-green-800 leading-relaxed mb-4">
              Verify literary works, lyrics, author identities, and historical references before saving to preserve archival fidelity.
            </p>
            <hr className="border-brand-gold/10 my-3" />
            <p className="text-[11px] text-brand-gold-dark font-semibold">
              Counts refresh automatically after successful archive create, update, and delete actions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
