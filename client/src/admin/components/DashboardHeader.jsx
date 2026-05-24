import React from "react";
import { useAuth } from "../../context/AuthContext";

function DashboardHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-brand-gold/25 bg-brand-green-950 px-6 shadow-sm">
      <div>
        <h2 className="font-display text-lg font-bold text-brand-cream">
          CMS Control Panel
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* User Context Details */}
        <div className="flex items-center gap-2 rounded-xl bg-brand-surface/10 border border-brand-gold/20 px-3 py-1 shadow-sm">
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

        {/* Quick Logout Trigger */}
        <button
          onClick={logout}
          className="rounded-full border border-brand-gold/40 px-3 py-1.5 text-xs font-semibold text-brand-cream hover:bg-brand-gold hover:text-brand-green-950 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;
