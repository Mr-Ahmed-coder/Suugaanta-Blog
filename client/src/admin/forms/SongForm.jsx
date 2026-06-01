import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getSongByIdentifier, createSong, updateSong } from "../../api/services/songService";
import { getAuthors } from "../../api/services/authorService";
import { LoadingSpinner } from "../../components/common/FeedbackStates";
import FileUpload from "../components/FileUpload";

const CATEGORIES = ["Waddani", "Jacayl", "Qaraami", "Dhaanto", "Baraanbur"];

function SongForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    writer: "",
    composer: "",
    relatedAuthors: [],
    artist: "",
    performer: "",
    category: "Waddani",
    year: "",
    description: "",
    lyrics: "",
    audioUrl: "",
    thumbnail: "",
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

    async function loadSongData() {
      setFetching(true);
      setError("");
      try {
        const response = await getSongByIdentifier(id);
        const song = response.data;
        setFormData({
          title: song.title || "",
          author: song.author?._id || song.author || "",
          writer: song.writer?._id || song.writer || song.author?._id || song.author || "",
          composer: song.composer?._id || song.composer || "",
          relatedAuthors: song.relatedAuthors
            ? song.relatedAuthors.map((author) => author._id || author)
            : [],
          artist: song.artist || "",
          performer: song.performer || "",
          category: song.category || "Waddani",
          year: song.year || "",
          description: song.description || "",
          lyrics: song.lyrics || "",
          audioUrl: song.audioUrl || "",
          thumbnail: song.thumbnail || "",
          tags: song.tags ? song.tags.join(", ") : "",
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load Maqal data. Please try again.");
      } finally {
        setFetching(false);
      }
    }
    loadSongData();
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
    if (!formData.title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!formData.audioUrl.trim()) {
      setError("Please upload an audio file first.");
      return;
    }

    if (formData.year && (isNaN(formData.year) || formData.year < 1800 || formData.year > new Date().getFullYear())) {
      setError("Please provide a valid year (1800 to current year).");
      return;
    }

    setSubmitting(true);

    // Normalize tags into array
    const normalizedTags = formData.tags
      ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const payload = {
      ...formData,
      author: undefined,
      writer: formData.writer || undefined,
      composer: formData.composer || undefined,
      relatedAuthors: formData.relatedAuthors,
      artist: formData.artist.trim() || undefined,
      year: formData.year ? parseInt(formData.year) : undefined,
      tags: normalizedTags,
    };

    try {
      if (isEditMode) {
        await updateSong(id, payload);
      } else {
        await createSong(payload);
      }
      navigate("/admin/songs");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save Maqal. Please verify input formats.");
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return <LoadingSpinner message="Loading Maqal details..." />;
  }

  const filteredAuthors = authors.filter((author) =>
    author.name.toLowerCase().includes(authorSearch.trim().toLowerCase())
  );

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft md:p-8">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-brand-gold/10 pb-4">
        <h1 className="font-display text-2xl font-bold text-brand-green-950">
          {isEditMode ? "Edit Maqal" : "Create New Maqal"}
        </h1>
        <Link to="/admin/songs" className="text-xs font-bold text-brand-gold-dark hover:text-brand-green-900 transition">
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
              placeholder="E.g. Baladweyn"
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
              required
            />
          </div>

          <div>
            <label htmlFor="artist" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
              Display Artist
            </label>
            <input
              type="text"
              id="artist"
              name="artist"
              value={formData.artist}
              onChange={handleChange}
              placeholder="Public artist, group, or ensemble name"
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="writer" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
              Writer
            </label>
            <input
              type="search"
              value={authorSearch}
              onChange={(event) => setAuthorSearch(event.target.value)}
              placeholder="Search existing authors..."
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-surface px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
            />
            <select
              id="writer"
              name="writer"
              value={formData.writer}
              onChange={(event) => {
                setFormData((prev) => ({
                  ...prev,
                  writer: event.target.value,
                }));
              }}
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
            >
              <option value="">No writer selected</option>
              {filteredAuthors.map((author) => (
                <option key={author._id} value={author._id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="composer" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
              Composer
            </label>
            <select
              id="composer"
              name="composer"
              value={formData.composer}
              onChange={handleChange}
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
            >
              <option value="">No composer selected</option>
              {filteredAuthors.map((author) => (
                <option key={author._id} value={author._id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="relatedAuthors" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
            Related Authors
          </label>
          <select
            id="relatedAuthors"
            name="relatedAuthors"
            multiple
            value={formData.relatedAuthors}
            onChange={handleRelatedAuthorsChange}
            className="mt-2 block min-h-28 w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
          >
            {filteredAuthors.map((author) => (
              <option key={author._id} value={author._id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
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

          <div>
            <label htmlFor="year" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
              Year
            </label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="E.g. 1974"
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
            />
          </div>

          <div>
            <label htmlFor="performer" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
              Performer
            </label>
            <input
              type="text"
              id="performer"
              name="performer"
              value={formData.performer}
              onChange={handleChange}
              placeholder="Optional performer if different"
              className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FileUpload
            label="Audio File *"
            type="audio"
            value={formData.audioUrl}
            onChange={(url) => setFormData((prev) => ({ ...prev, audioUrl: url }))}
            onUploadStart={() => setUploadingActive(true)}
            onUploadEnd={() => setUploadingActive(false)}
          />

          <FileUpload
            label="Cover Image"
            type="image"
            value={formData.thumbnail}
            onChange={(url) => setFormData((prev) => ({ ...prev, thumbnail: url }))}
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
            placeholder="E.g. waddani, dervish, classic"
            className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Enter Maqal description..."
            className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition"
          />
        </div>

        <div>
          <label htmlFor="lyrics" className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
            Lyrics
          </label>
          <textarea
            id="lyrics"
            name="lyrics"
            value={formData.lyrics}
            onChange={handleChange}
            rows={6}
            placeholder="Enter Maqal lyrics..."
            className="mt-2 block w-full rounded-xl border border-brand-gold/30 bg-brand-cream/5 px-4 py-2.5 text-sm text-brand-green-950 placeholder:text-brand-green-700/30 focus:border-brand-gold-dark focus:bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-gold-dark transition font-serif leading-relaxed"
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
            <span>Save Maqal</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default SongForm;
