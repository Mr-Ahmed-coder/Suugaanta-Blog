import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getAuthorByIdentifier, createAuthor, updateAuthor } from "../../api/services/authorService";
import { LoadingSpinner } from "../../components/common/FeedbackStates";
import FileUpload from "../components/FileUpload";

const SPECIALTIES_LIST = ["Poetry", "Singing", "Music Production", "Playwriting", "Patriotism"];

function AuthorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    birthYear: "",
    deathYear: "",
    photo: "",
    featuredImage: "",
    legacySummary: "",
    biography: "",
    specialties: "",
    tags: "",
    website: "",
    facebook: "",
    instagram: "",
    x: "",
    youtube: "",
  });

  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingActive, setUploadingActive] = useState(false);
  const [error, setError] = useState("");

  // Load existing details if in Edit Mode
  useEffect(() => {
    if (!isEditMode) return;

    async function loadAuthorData() {
      setFetching(true);
      setError("");
      try {
        const response = await getAuthorByIdentifier(id);
        const author = response.data;
        setFormData({
          name: author.name || "",
          birthYear: author.birthYear || "",
          deathYear: author.deathYear || "",
          photo: author.photo || "",
          featuredImage: author.featuredImage || "",
          legacySummary: author.legacySummary || "",
          biography: author.biography || "",
          specialties: author.specialties ? author.specialties.join(", ") : "",
          tags: author.tags ? author.tags.join(", ") : "",
          website: author.socialLinks?.website || "",
          facebook: author.socialLinks?.facebook || "",
          instagram: author.socialLinks?.instagram || "",
          x: author.socialLinks?.x || "",
          youtube: author.socialLinks?.youtube || "",
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load author details. Please try again.");
      } finally {
        setFetching(false);
      }
    }
    loadAuthorData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Front-end validations
    if (!formData.name.trim() || !formData.biography.trim()) {
      setError("Name and Biography are required fields.");
      return;
    }

    if (formData.biography.trim().length < 20) {
      setError("Biography must be at least 20 characters long.");
      return;
    }

    if (formData.birthYear && (isNaN(formData.birthYear) || formData.birthYear < 1000 || formData.birthYear > new Date().getFullYear())) {
      setError("Please provide a valid birth year (1000 to current year).");
      return;
    }

    if (formData.deathYear && (isNaN(formData.deathYear) || formData.deathYear < 1000 || formData.deathYear > new Date().getFullYear())) {
      setError("Please provide a valid death year (1000 to current year).");
      return;
    }

    setSubmitting(true);

    const normalizedSpecialties = formData.specialties
      ? formData.specialties.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const normalizedTags = formData.tags
      ? formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];

    const payload = {
      name: formData.name.trim(),
      biography: formData.biography.trim(),
      legacySummary: formData.legacySummary.trim() || undefined,
      birthYear: formData.birthYear ? parseInt(formData.birthYear) : undefined,
      deathYear: formData.deathYear ? parseInt(formData.deathYear) : undefined,
      photo: formData.photo.trim() || undefined,
      featuredImage: formData.featuredImage.trim() || undefined,
      specialties: normalizedSpecialties,
      tags: normalizedTags,
      socialLinks: {
        website: formData.website.trim() || undefined,
        facebook: formData.facebook.trim() || undefined,
        instagram: formData.instagram.trim() || undefined,
        x: formData.x.trim() || undefined,
        youtube: formData.youtube.trim() || undefined,
      },
    };

    try {
      if (isEditMode) {
        await updateAuthor(id, payload);
      } else {
        await createAuthor(payload);
      }
      navigate("/admin/authors");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save author. Please verify input formats.");
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return <LoadingSpinner message="Loading author details..." />;
  }

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft md:p-8">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-brand-gold/10 pb-4">
        <h1 className="font-display text-2xl font-bold text-brand-green-950">
          {isEditMode ? "Edit Abwaan" : "Create New Abwaan"}
        </h1>
        <Link to="/admin/authors" className="text-xs font-bold text-brand-gold-dark hover:text-brand-green-900 transition">
          ← Back
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800">
          ⚠️ {error}
        </div>
      )}

      {/* Inputs Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="E.g. Maxamed Ibraahim Hadraawi"
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
              required
            />
          </div>

          <div>
            <label htmlFor="birthYear" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
              Birth Year
            </label>
            <input
              type="number"
              id="birthYear"
              name="birthYear"
              value={formData.birthYear}
              onChange={handleChange}
              placeholder="E.g. 1943"
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
            />
          </div>

          <div>
            <label htmlFor="deathYear" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
              Death Year
            </label>
            <input
              type="number"
              id="deathYear"
              name="deathYear"
              value={formData.deathYear}
              onChange={handleChange}
              placeholder="E.g. 2022"
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FileUpload
            label="Profile Photo"
            type="image"
            value={formData.photo}
            onChange={(url) => setFormData((prev) => ({ ...prev, photo: url }))}
            onUploadStart={() => setUploadingActive(true)}
            onUploadEnd={() => setUploadingActive(false)}
          />

          <FileUpload
            label="Featured Image"
            type="image"
            value={formData.featuredImage}
            onChange={(url) => setFormData((prev) => ({ ...prev, featuredImage: url }))}
            onUploadStart={() => setUploadingActive(true)}
            onUploadEnd={() => setUploadingActive(false)}
          />

          <div>
            <label htmlFor="specialties" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
              Specialties (comma separated)
            </label>
            <input
              type="text"
              id="specialties"
              name="specialties"
              value={formData.specialties}
              onChange={handleChange}
              placeholder="E.g. Poetry, Singing, Playwriting"
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
            Search Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="E.g. hadraawi, modern poetry, cultural icon"
            className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
          />
        </div>

        <div>
          <label htmlFor="legacySummary" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
            Legacy Summary
          </label>
          <textarea
            id="legacySummary"
            name="legacySummary"
            value={formData.legacySummary}
            onChange={handleChange}
            rows={4}
            placeholder="Short cultural legacy summary for the profile hero..."
            className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition leading-relaxed"
          />
        </div>

        {/* Nested Social Links */}
        <div className="rounded-2xl border border-brand-gold/15 bg-brand-cream/5 p-4 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-gold-dark">Social Connections (Optional links)</h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="website" className="block text-[10px] font-semibold uppercase tracking-wider text-brand-green-900">
                Website Link
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://hadraawi.org"
                className="mt-1 block w-full rounded-xl border border-brand-gold/30 bg-brand-surface px-3 py-2 text-xs text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="facebook" className="block text-[10px] font-semibold uppercase tracking-wider text-brand-green-900">
                Facebook Link
              </label>
              <input
                type="url"
                id="facebook"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/hadraawi"
                className="mt-1 block w-full rounded-xl border border-brand-gold/30 bg-brand-surface px-3 py-2 text-xs text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="instagram" className="block text-[10px] font-semibold uppercase tracking-wider text-brand-green-900">
                Instagram Link
              </label>
              <input
                type="url"
                id="instagram"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border border-brand-gold/30 bg-brand-surface px-3 py-2 text-xs text-brand-green-950 focus:border-brand-gold-dark focus:outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="x" className="block text-[10px] font-semibold uppercase tracking-wider text-brand-green-900">
                X (Twitter) Link
              </label>
              <input
                type="url"
                id="x"
                name="x"
                value={formData.x}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border border-brand-gold/30 bg-brand-surface px-3 py-2 text-xs text-brand-green-950 focus:border-brand-gold-dark focus:outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="youtube" className="block text-[10px] font-semibold uppercase tracking-wider text-brand-green-900">
                YouTube Link
              </label>
              <input
                type="url"
                id="youtube"
                name="youtube"
                value={formData.youtube}
                onChange={handleChange}
                className="mt-1 block w-full rounded-xl border border-brand-gold/30 bg-brand-surface px-3 py-2 text-xs text-brand-green-950 focus:border-brand-gold-dark focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="biography" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
            Biography *
          </label>
          <textarea
            id="biography"
            name="biography"
            value={formData.biography}
            onChange={handleChange}
            rows={8}
            placeholder="Enter author biography here..."
            className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition leading-relaxed"
            required
          />
        </div>

        {/* Form Submission Button */}
        <button
          type="submit"
          disabled={submitting || uploadingActive}
          className="w-full rounded-xl bg-brand-green-900 py-3 text-sm font-semibold text-brand-cream hover:bg-brand-green-800 focus:outline-none focus:ring-2 focus:ring-brand-gold-dark disabled:bg-brand-green-900/60 transition shadow-soft flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-cream/20 border-t-brand-cream"></span>
              <span>Saving...</span>
            </>
          ) : uploadingActive ? (
            <span>Uploading file...</span>
          ) : (
            <span>Save Abwaan</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default AuthorForm;
