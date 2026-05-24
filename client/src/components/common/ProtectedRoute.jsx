import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LoadingSpinner } from "./FeedbackStates";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner message="Verifying credentials..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="mx-auto my-12 max-w-xl rounded-3xl border border-brand-gold/20 bg-brand-surface p-12 text-center shadow-soft">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-brand-gold/25 text-brand-gold-dark">
          <svg className="h-6 w-6" aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3 5 6v5c0 4.25 2.55 8.05 7 10 4.45-1.95 7-5.75 7-10V6l-7-3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold text-brand-green-950">Access Denied</h3>
        <p className="mt-2 text-sm leading-relaxed text-brand-green-800">
          You do not have the required permissions to access this section. Please contact an administrator if you need support.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
