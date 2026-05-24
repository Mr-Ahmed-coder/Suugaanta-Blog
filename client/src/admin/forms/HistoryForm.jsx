import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getHistoryByIdentifier, createHistory, updateHistory } from "../../api/services/historyService";
import { getAuthors } from "../../api/services/authorService";
import { LoadingSpinner } from "../../components/common/FeedbackStates";
import FileUpload from "../components/FileUpload";

const CATEGORIES = ["Pre-Colonial", "Colonial Era", "Independence", "Modern Era", "Arts & Culture"];

function HistoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    category: "Pre-Colonial",
    coverImage: "",
    content: "",
    tags: "",
    references: "",
    relatedAuthors: [],
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

    async function loadHistoryData() {
      setFetching(true);
      setError("");
      try {
        const response = await getHistoryByIdentifier(id);
        const article = response.data;
        setFormData({
          title: article.title || "",
          category: article.category || "Pre-Colonial",
          coverImage: article.coverImage || "",
          content: article.content || "",
          tags: article.tags ? article.tags.join(", ") : "",
          references: article.references ? article.references.join(", ") : "",
          relatedAuthors: article.relatedAuthors
            ? article.relatedAuthors.map((author) => author._id || author)
            : [],
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load history article data. Please try again.");
      } finally {
        setFetching(false);
      }
    }
    loadHistoryData();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRelatedAuthorsChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((option) => option.value);
    setFormData((prev) => ({ ...prev, relatedAuthors: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Front-end validations
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Title and Article Content are required fields.");
      return;
    }

    if (formData.content.trim().length < 20) {
      setError("Article content must be at least 20 characters long.");
      return;
    }

    setSubmitting(true);

    const normalizedTags = formData.tags
      ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const normalizedReferences = formData.references
      ? formData.references.split(",").map((r) => r.trim()).filter(Boolean)
      : [];

    const payload = {
      ...formData,
      tags: normalizedTags,
      references: normalizedReferences,
      relatedAuthors: formData.relatedAuthors,
    };

    try {
      if (isEditMode) {
        await updateHistory(id, payload);
      } else {
        await createHistory(payload);
      }
      navigate("/admin/history");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save article. Please verify input formats.");
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return <LoadingSpinner message="Loading history details..." />;
  }

  const filteredAuthors = authors.filter((author) =>
    author.name.toLowerCase().includes(authorSearch.trim().toLowerCase())
  );

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft md:p-8">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-brand-gold/10 pb-4">
        <h1 className="font-display text-2xl font-bold text-brand-green-950">
          {isEditMode ? "Edit Taariikh" : "Create New Taariikh"}
        </h1>
        <Link to="/admin/history" className="text-xs font-bold text-brand-gold-dark hover:text-brand-green-900 transition">
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
              placeholder="E.g. Halgankii Daraawiishta"
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
              required
            />
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
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FileUpload
            label="Cover Image"
            type="image"
            value={formData.coverImage}
            onChange={(url) => setFormData((prev) => ({ ...prev, coverImage: url }))}
            onUploadStart={() => setUploadingActive(true)}
            onUploadEnd={() => setUploadingActive(false)}
          />

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
              placeholder="E.g. dervish, history, dhow"
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
            />
          </div>
        </div>

        <div>
          <label htmlFor="relatedAuthors" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
            Related Authors
          </label>
          <input
            type="search"
            value={authorSearch}
            onChange={(event) => setAuthorSearch(event.target.value)}
            placeholder="Search existing authors..."
            className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-surface px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
          />
          <select
            id="relatedAuthors"
            name="relatedAuthors"
            multiple
            value={formData.relatedAuthors}
            onChange={handleRelatedAuthorsChange}
            className="mt-2 block min-h-32 w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
          >
            {filteredAuthors.map((author) => (
              <option key={author._id} value={author._id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="references" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
            References (comma separated)
          </label>
          <input
            type="text"
            id="references"
            name="references"
            value={formData.references}
            onChange={handleChange}
            placeholder="E.g. Museum Archives, Oral Narratives"
            className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
            Article Content *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={10}
            placeholder="Enter historical article content here..."
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
            <span>Save Taariikh</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default HistoryForm;
