import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Input Validations
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setValidationError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setValidationError(err || "Registration failed. Please verify your details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 md:py-16">
      <div className="w-full max-w-md rounded-3xl border border-brand-gold/20 bg-brand-surface p-8 shadow-soft">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold-dark">Administration & Editor Portal</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-brand-green-950">Register Account</h2>
          <p className="mt-2 text-xs text-brand-green-700">
            Create a new account to contribute to the archive.
          </p>
        </div>

        {validationError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800">
            ⚠️ {validationError}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/40 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
              required
            />
          </div>

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
              placeholder="At least 8 characters"
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/40 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
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
                <span>Creating account...</span>
              </>
            ) : (
              <span>Register</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-brand-gold/10 pt-6">
          <p className="text-xs text-brand-green-800/80">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-gold-dark hover:text-brand-green-950 transition">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
