import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getHistory, deleteHistory } from "../../api/services/historyService";
import useCollection from "../../hooks/useCollection";
import FilterBar from "../../components/common/FilterBar";
import Pagination from "../../components/common/Pagination";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { LoadingSpinner, ErrorState, EmptyState } from "../../components/common/FeedbackStates";

const CATEGORIES = ["Pre-Colonial", "Colonial Era", "Independence", "Modern Era", "Arts & Culture"];

function ManageHistory() {
  const {
    items: articles,
    meta,
    loading,
    error,
    page,
    setPage,
    search,
    handleSearch,
    category,
    handleCategory,
    sort,
    handleSort,
    refetch,
  } = useCollection(getHistory);

  // Deletion Modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteTrigger = (article) => {
    setDeleteTarget(article);
    setDeleteError("");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteHistory(deleteTarget._id);
      setDeleteTarget(null);
      refetch(); // Reload collection data
    } catch (err) {
      setDeleteError(err?.response?.data?.message || "Failed to delete article. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-green-950">Manage Taariikho</h1>
          <p className="mt-1 text-sm text-brand-green-800">
            Create, update, or remove historical articles and chronicles.
          </p>
        </div>
        <Link
          to="/admin/history/new"
          className="rounded-full bg-brand-green-900 px-5 py-2.5 text-xs font-semibold text-brand-cream hover:bg-brand-green-800 transition shadow-soft self-start sm:self-auto"
        >
          + Create New
        </Link>
      </div>

      {/* Shared Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={handleSearch}
        category={category}
        onCategoryChange={handleCategory}
        sort={sort}
        onSortChange={handleSort}
        categories={CATEGORIES}
        placeholder="Search historical articles..."
      />

      {deleteError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800">
          ⚠️ {deleteError}
        </div>
      )}

      {loading && <LoadingSpinner message="Loading history..." />}

      {error && <ErrorState error={error} />}

      {!loading && !error && articles.length === 0 && (
        <EmptyState message="No historical articles match your search." />
      )}

      {!loading && !error && articles.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-brand-gold/20 bg-brand-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-gold/20 bg-brand-cream/15 text-xs font-bold uppercase tracking-wider text-brand-green-900">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gold/10 text-sm text-brand-green-950">
                {articles.map((article) => (
                  <tr key={article._id} className="hover:bg-brand-cream/5 transition">
                    <td className="px-6 py-4 font-bold">{article.title}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-brand-green-50 px-2 py-0.5 text-xs font-medium text-brand-green-800 border border-brand-green-100">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          to={`/admin/history/edit/${article._id}`}
                          className="text-xs font-bold text-brand-gold-dark hover:text-brand-green-950 transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteTrigger(article)}
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
        itemName={deleteTarget?.title}
        loading={deleting}
      />
    </div>
  );
}

export default ManageHistory;
