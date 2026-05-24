import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getAuthors, deleteAuthor } from "../../api/services/authorService";
import useCollection from "../../hooks/useCollection";
import FilterBar from "../../components/common/FilterBar";
import Pagination from "../../components/common/Pagination";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { LoadingSpinner, ErrorState, EmptyState } from "../../components/common/FeedbackStates";

const SPECIALTIES = ["Poetry", "Singing", "Music Production", "Playwriting", "Patriotism"];

function ManageAuthors() {
  const {
    items: authors,
    meta,
    loading,
    error,
    page,
    setPage,
    search,
    handleSearch,
    category: specialty,
    handleCategory: handleSpecialty,
    sort,
    handleSort,
    refetch,
  } = useCollection(getAuthors);

  // Deletion Modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteTrigger = (author) => {
    setDeleteTarget(author);
    setDeleteError("");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAuthor(deleteTarget._id);
      setDeleteTarget(null);
      refetch(); // Reload collection data
    } catch (err) {
      setDeleteError(err?.response?.data?.message || "Failed to delete artist. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-green-950">Manage Abwaano</h1>
          <p className="mt-1 text-sm text-brand-green-800">
            Register new poets and artists or edit existing profiles in the repository.
          </p>
        </div>
        <Link
          to="/admin/authors/new"
          className="rounded-full bg-brand-green-900 px-5 py-2.5 text-xs font-semibold text-brand-cream hover:bg-brand-green-800 transition shadow-soft self-start sm:self-auto"
        >
          + Create New
        </Link>
      </div>

      {/* Shared Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={handleSearch}
        category={specialty}
        onCategoryChange={handleSpecialty}
        sort={sort}
        onSortChange={handleSort}
        categories={SPECIALTIES}
        placeholder="Search artists..."
        categoryLabel="Specialty"
      />

      {deleteError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800">
          ⚠️ {deleteError}
        </div>
      )}

      {loading && <LoadingSpinner message="Loading artists..." />}

      {error && <ErrorState error={error} />}

      {!loading && !error && authors.length === 0 && (
        <EmptyState message="No artists match your search." />
      )}

      {!loading && !error && authors.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-brand-gold/20 bg-brand-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-gold/20 bg-brand-cream/15 text-xs font-bold uppercase tracking-wider text-brand-green-900">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Specialties</th>
                  <th className="px-6 py-4">Birth Year</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gold/10 text-sm text-brand-green-950">
                {authors.map((author) => (
                  <tr key={author._id} className="hover:bg-brand-cream/5 transition">
                    <td className="px-6 py-4 font-bold">{author.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(author.specialties || []).map((spec) => (
                          <span key={spec} className="inline-flex items-center rounded-full bg-brand-green-50 px-2 py-0.5 text-[10px] font-medium text-brand-green-800 border border-brand-green-100">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{author.birthYear || "N/A"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          to={`/admin/authors/edit/${author._id}`}
                          className="text-xs font-bold text-brand-gold-dark hover:text-brand-green-900 transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteTrigger(author)}
                          className="text-xs font-bold text-red-600 hover:text-red-800 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deleteTarget?.name}
        loading={deleting}
      />
    </div>
  );
}

export default ManageAuthors;
