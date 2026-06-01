import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const adminNavItems = [
  { label: "Overview", to: "/admin", icon: "📊", end: true },
  { label: "Maqal", to: "/admin/songs", icon: "🎵" },
  { label: "Gabayo", to: "/admin/poetry", icon: "✍️" },
  { label: "Taariikho", to: "/admin/history", icon: "📚" },
  { label: "Abwaano", to: "/admin/authors", icon: "👤" },
];

function DashboardSidebar() {
  const { isAdmin } = useAuth();

  return (
    <aside className="sticky top-0 z-30 flex h-screen w-20 flex-col justify-between border-r border-brand-gold/30 bg-brand-green-950 px-2 py-6 text-brand-cream sm:w-64 sm:px-4">
      <div className="space-y-8">
        {/* Brand/Logo Header */}
        <div className="px-2 text-center sm:text-left">
          <Link to="/admin" className="font-display font-bold tracking-wide text-brand-cream hover:text-brand-gold transition block">
            <span className="sm:hidden text-2xl">🕌</span>
            <span className="hidden sm:inline text-xl">Suugaanta CMS</span>
          </Link>
          <span className="hidden sm:block text-[10px] text-brand-gold font-medium uppercase tracking-widest mt-1">
            Editorial Console
          </span>
        </div>

        {/* Sidebar Nav Links */}
        <nav aria-label="Admin navigation" className="space-y-1.5">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl py-3 px-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-brand-gold text-brand-green-950 shadow-soft"
                    : "text-brand-cream/80 hover:bg-brand-surface/5 hover:text-brand-cream"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </NavLink>
          ))}
          
          {/* Admin Only Link */}
          {isAdmin && (
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl py-3 px-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-brand-gold text-brand-green-950 shadow-soft"
                    : "text-brand-cream/80 hover:bg-brand-surface/5 hover:text-brand-cream"
                }`
              }
            >
              <span className="text-lg">🛡️</span>
              <span className="hidden sm:inline">Manage Users</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* Return to Public Catalog */}
      <div className="border-t border-brand-gold/20 pt-6">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl py-3 px-3 text-sm font-semibold text-brand-gold hover:bg-brand-surface/5 hover:text-brand-cream transition"
        >
          <span className="text-lg">↩️</span>
          <span className="hidden sm:inline">Public Site</span>
        </Link>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
