import React, { useEffect, useState } from "react";
import {
  createComment,
  deleteComment,
  getCommentsByResource,
  updateComment,
} from "../../api/services/commentService";
import { useAuth } from "../../context/AuthContext";
import { ErrorState, LoadingSpinner } from "../common/FeedbackStates";
import CommentCard from "./CommentCard";
import CommentForm from "./CommentForm";

function CommentSection({ resourceType, resourceId, title = "Cultural Discussion" }) {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadComments = async () => {
    if (!resourceType || !resourceId) return;

    setLoading(true);
    setError("");

    try {
      const response = await getCommentsByResource(resourceType, resourceId);
      setComments(response.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Comments could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [resourceType, resourceId]);

  const handleCreate = async (content) => {
    setActionLoading(true);
    setError("");

    try {
      const response = await createComment({ content, resourceType, resourceId });
      setComments((current) => [response.data, ...current]);
    } catch (err) {
      setError(err?.response?.data?.message || "Comment could not be added.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (commentId, content) => {
    setActionLoading(true);
    setError("");

    try {
      const response = await updateComment(commentId, { content });
      setComments((current) => current.map((comment) => (comment._id === commentId ? response.data : comment)));
    } catch (err) {
      setError(err?.response?.data?.message || "Comment could not be updated.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    setActionLoading(true);
    setError("");

    try {
      await deleteComment(commentId);
      setComments((current) => current.filter((comment) => comment._id !== commentId));
    } catch (err) {
      setError(err?.response?.data?.message || "Comment could not be deleted.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold-dark">Community Reflection</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-brand-green-950">{title}</h2>
        </div>
        <span className="rounded-full border border-brand-gold/25 px-3 py-1 text-xs font-semibold text-brand-green-800">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      <p className="mt-3 max-w-3xl text-sm leading-6 text-brand-green-800/75">
        Share respectful notes, context, memories, or cultural reflections that help this archive grow with care.
      </p>

      <div className="mt-6 rounded-2xl border border-brand-gold/15 bg-brand-cream/10 p-4">
        {isAuthenticated ? (
          <CommentForm onSubmit={handleCreate} loading={actionLoading} />
        ) : (
          <p className="text-sm font-medium text-brand-green-800">Please login to join the discussion.</p>
        )}
      </div>

      {error && <div className="mt-5"><ErrorState error={error} /></div>}

      {loading ? (
        <LoadingSpinner message="Loading comments..." />
      ) : comments.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-brand-gold/10 bg-brand-cream/10 p-6 text-center">
          <p className="text-sm font-medium text-brand-green-800">No reflections have been added yet.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {comments.map((comment) => (
            <CommentCard
              key={comment._id}
              comment={comment}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default CommentSection;
