import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getPoetryByIdentifier, createPoetry, updatePoetry } from "../../api/services/poetryService";
import { getAuthors } from "../../api/services/authorService";
import { LoadingSpinner } from "../../components/common/FeedbackStates";
import FileUpload from "../components/FileUpload";

const CATEGORIES = ["Jacayl", "Waddani", "Taariikh", "Guubaabo", "Falsafad"];

function PoetryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    poet: "",
    category: "Jacayl",
    content: "",
    audioRecitation: "",
    tags: "",
  });

  const [fetching, setFetching] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [authorSearch, setAuthorSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingActive, setUploadingActive] = useState(false);
  const [error, setError] = useState("");

  // Load existing details if in Edit Mode
  useEffect(() => {
    async function loadAuthors() {
      try {
        const response = await getAuthors({ limit: 100, sort: "newest" });
        setAuthors(response.data || []);
      } catch (err) {
        setAuthors([]);
      }
    }

    loadAuthors();
  }, []);

  useEffect(() => {
    if (!isEditMode) return;

    async function loadPoetryData() {
      setFetching(true);
      setError("");
      try {
        const response = await getPoetryByIdentifier(id);
        const poetry = response.data;
        setFormData({
          title: poetry.title || "",
          author: poetry.author?._id || poetry.author || "",
          poet: poetry.poet || "",
          category: poetry.category || "Jacayl",
          content: poetry.content || "",
          audioRecitation: poetry.audioRecitation || "",
          tags: poetry.tags ? poetry.tags.join(", ") : "",
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load poetry data. Please try again.");
      } finally {
        setFetching(false);
      }
    }
    loadPoetryData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Front-end validations
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Title and Poetry Content are required fields.");
      return;
    }

    if (formData.content.trim().length < 10) {
      setError("Poetry content must be at least 10 characters long.");
      return;
    }

    setSubmitting(true);

    const normalizedTags = formData.tags
      ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const selectedAuthor = authors.find((author) => author._id === formData.author);

    const payload = {
      ...formData,
      author: formData.author || undefined,
      poet: formData.poet.trim() || selectedAuthor?.name || undefined,
      tags: normalizedTags,
    };

    try {
      if (isEditMode) {
        await updatePoetry(id, payload);
      } else {
        await createPoetry(payload);
      }
      navigate("/admin/poetry");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save poem. Please verify input formats.");
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return <LoadingSpinner message="Loading poetry details..." />;
  }

  const filteredAuthors = authors.filter((author) =>
    author.name.toLowerCase().includes(authorSearch.trim().toLowerCase())
  );

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft md:p-8">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-brand-gold/10 pb-4">
        <h1 className="font-display text-2xl font-bold text-brand-green-950">
          {isEditMode ? "Edit Gabay" : "Create New Gabay"}
        </h1>
        <Link to="/admin/poetry" className="text-xs font-bold text-brand-gold-dark hover:text-brand-green-900 transition">
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
            <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="E.g. Hooyo"
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
              required
            />
          </div>

          <div>
            <label htmlFor="poet" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
              Attribution Label
            </label>
            <input
              type="text"
              id="poet"
              name="poet"
              value={formData.poet}
              onChange={handleChange}
              placeholder="Anonymous, Traditional, disputed, or display name"
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="author" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
              Canonical Author
            </label>
            <input
              type="search"
              value={authorSearch}
              onChange={(event) => setAuthorSearch(event.target.value)}
              placeholder="Search existing authors..."
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-surface px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
            />
            <select
              id="author"
              name="author"
              value={formData.author}
              onChange={(event) => {
                const selectedAuthor = authors.find((author) => author._id === event.target.value);
                setFormData((prev) => ({
                  ...prev,
                  author: event.target.value,
                  poet: selectedAuthor?.name || "",
                }));
              }}
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
            >
              <option value="">No canonical author</option>
              {filteredAuthors.map((author) => (
                <option key={author._id} value={author._id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <FileUpload
            label="Audio File"
            type="audio"
            value={formData.audioRecitation}
            onChange={(url) => setFormData((prev) => ({ ...prev, audioRecitation: url }))}
            onUploadStart={() => setUploadingActive(true)}
            onUploadEnd={() => setUploadingActive(false)}
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="E.g. hooyo, jacayl, amaan"
            className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
            Poetry Verses *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={10}
            placeholder="Enter poetry verses here..."
            className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition font-serif leading-relaxed text-center"
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
            <span>Save Gabay</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default PoetryForm;
