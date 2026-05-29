import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import CommentForm from "./CommentForm";

const formatCommentDate = (date) => {
  if (!date) return "";

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

function CommentCard({ comment, onUpdate, onDelete, actionLoading }) {
  const { user, isEditor } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const isOwner = user?._id === comment.user?._id;
  const canEdit = isOwner;
  const canDelete = isOwner || isEditor;

  const handleUpdate = async (content) => {
    await onUpdate(comment._id, content);
    setIsEditing(false);
  };

  return (
    <article className="rounded-2xl border border-brand-gold/15 bg-brand-surface p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-brand-green-950">{comment.user?.name || "Archive visitor"}</p>
          <p className="mt-1 text-xs font-medium text-brand-green-700/70">
            {formatCommentDate(comment.updatedAt || comment.createdAt)}
            {comment.updatedAt && comment.updatedAt !== comment.createdAt ? " · Edited" : ""}
          </p>
        </div>

        {canDelete && (
          <div className="flex items-center gap-2">
            {canEdit && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-xs font-semibold text-brand-gold-dark transition hover:text-brand-green-950"
              >
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={() => onDelete(comment._id)}
              disabled={actionLoading}
              className="text-xs font-semibold text-red-700 transition hover:text-red-900 disabled:opacity-60"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="mt-4">
          <CommentForm
            initialValue={comment.content}
            submitLabel="Save Changes"
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            loading={actionLoading}
          />
        </div>
      ) : (
        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-brand-green-900">{comment.content}</p>
      )}
    </article>
  );
}

export default CommentCard;
