import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Basic Validation
    if (!email.trim() || !password) {
      setValidationError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setValidationError(err || "Login failed. Please verify your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 md:py-16">
      <div className="w-full max-w-md rounded-3xl border border-brand-gold/20 bg-brand-surface p-8 shadow-soft">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold-dark">Administration & Editor Portal</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-brand-green-950">Portal Login</h2>
          <p className="mt-2 text-xs text-brand-green-700">
            Please enter your credentials to access the console.
          </p>
        </div>

        {validationError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800">
            ⚠️ {validationError}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@domain.com"
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/40 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/40 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-brand-green-900 py-3 text-sm font-semibold text-brand-cream hover:bg-brand-green-800 focus:outline-none focus:ring-2 focus:ring-brand-gold-dark disabled:bg-brand-green-900/60 transition shadow-soft flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-cream/20 border-t-brand-cream"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-brand-gold/10 pt-6">
          <p className="text-xs text-brand-green-800/80">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-brand-gold-dark hover:text-brand-green-950 transition">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
