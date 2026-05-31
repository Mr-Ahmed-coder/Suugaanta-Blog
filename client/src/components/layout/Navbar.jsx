import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Heeso", to: "/heeso" },
  { label: "Gabayo", to: "/gabayo" },
  { label: "Taariikho", to: "/taariikho" },
  { label: "Abwaano", to: "/abwaano" },
  { label: "About Us", to: "/about" },
];

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();

    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="border-b border-brand-gold/30 bg-brand-green-950 text-brand-cream shadow-soft">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <NavLink to="/" className="font-display text-2xl font-semibold tracking-wide text-brand-cream hover:text-brand-gold transition">
            Suugaanta Soomaliyeed
          </NavLink>
          <p className="mt-1 text-sm text-brand-cream/65">
            A living archive for Somali arts, memory, and culture.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <nav aria-label="Primary navigation">
            <ul className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `rounded-full px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-brand-gold text-brand-green-950"
                          : "text-brand-cream/80 hover:bg-brand-surface/10 hover:text-brand-cream"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <form onSubmit={handleSearch} className="flex w-full items-center gap-2 border-t border-brand-gold/10 pt-4 lg:w-auto lg:border-t-0 lg:pt-0">
            <label htmlFor="navbar-search" className="sr-only">
              Search archive
            </label>
            <input
              id="navbar-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search archive"
              className="min-h-10 w-full rounded-full border border-brand-gold/25 bg-brand-surface/10 px-4 text-sm text-brand-cream placeholder:text-brand-cream/50 transition focus:border-brand-gold focus:bg-brand-surface/15 focus:outline-none focus:ring-1 focus:ring-brand-gold lg:w-44 xl:w-56"
            />
            <button
              type="submit"
              className="rounded-full border border-brand-gold/40 px-4 py-2 text-sm font-semibold text-brand-gold transition hover:bg-brand-gold hover:text-brand-green-950"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-3 border-t border-brand-gold/10 pt-4 lg:border-t-0 lg:pt-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {(user?.role === "admin" || user?.role === "editor") && (
                  <NavLink
                    to="/admin"
                    className="rounded-full border border-brand-gold/40 px-3 py-1.5 text-xs font-bold text-brand-gold transition hover:bg-brand-gold hover:text-brand-green-950 shadow-sm"
                  >
                    Admin CMS
                  </NavLink>
                )}
                <NavLink
                  to="/my-library"
                  className="rounded-full border border-brand-gold/40 px-3 py-1.5 text-xs font-bold text-brand-gold transition hover:bg-brand-gold hover:text-brand-green-950 shadow-sm"
                >
                  My Library
                </NavLink>
                <div className="flex items-center gap-2 rounded-xl border border-brand-gold/25 bg-brand-surface/10 px-3 py-1.5 shadow-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gold text-xs font-bold text-brand-green-950">
                    {user?.name?.charAt(0).toUpperCase() || "👤"}
                  </span>
                  <div className="text-left">
                    <p className="text-xs font-bold text-brand-cream line-clamp-1">{user?.name}</p>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-brand-gold">
                      {user?.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="rounded-full border border-brand-gold/40 px-3 py-1.5 text-xs font-semibold text-brand-cream hover:bg-brand-gold hover:text-brand-green-950 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink
                  to="/login"
                  className="rounded-full px-4 py-2 text-sm font-medium text-brand-cream/80 hover:bg-brand-surface/10 hover:text-brand-cream transition"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-full bg-brand-gold px-4 py-2 text-sm font-semibold text-brand-green-950 hover:bg-brand-gold-dark transition shadow-soft"
                >
                  Register
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
