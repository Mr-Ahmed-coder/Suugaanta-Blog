import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorState, LoadingSpinner } from "../components/common/FeedbackStates";
import CommentSection from "../components/comments/CommentSection";
import useResourceDetail from "../hooks/useResourceDetail";

const formatDate = (date) => {
  if (!date) return null;
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

const getSummary = (text = "") => {
  const cleanText = text.replace(/\s+/g, " ").trim();
  return cleanText.length > 155 ? `${cleanText.slice(0, 152)}...` : cleanText;
};

function MetaItem({ label, value }) {
  if (!value) return null;

  return (
    <div className="rounded-2xl border border-brand-gold/15 bg-brand-surface p-4 shadow-soft">
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold-dark">{label}</dt>
      <dd className="mt-2 text-sm font-semibold text-brand-green-950">{value}</dd>
    </div>
  );
}

function TagList({ tags }) {
  if (!tags?.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-brand-green-50 px-3 py-1 text-xs font-semibold text-brand-green-800 ring-1 ring-brand-green-100"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}

function ResourceDetailPage({ config }) {
  const { slug } = useParams();
  const { item, loading, error } = useResourceDetail(config.fetchItem, slug);

  useEffect(() => {
    if (!item) return;

    const title = config.getTitle(item);
    const description = getSummary(config.getDescription(item));

    document.title = `${title} | Suugaanta Soomaliyeed`;

    const upsertMeta = (selector, attribute, value) => {
      let element = document.head.querySelector(selector);

      if (!element) {
        element = document.createElement("meta");
        const [name, content] = attribute;
        element.setAttribute(name, content);
        document.head.appendChild(element);
      }

      element.setAttribute("content", value);
    };

    if (description) {
      upsertMeta('meta[name="description"]', ["name", "description"], description);
      upsertMeta('meta[property="og:description"]', ["property", "og:description"], description);
    }

    upsertMeta('meta[property="og:title"]', ["property", "og:title"], `${title} | Suugaanta Soomaliyeed`);
    upsertMeta('meta[property="og:type"]', ["property", "og:type"], "article");

    const image = config.getImage?.(item);
    if (image) {
      upsertMeta('meta[property="og:image"]', ["property", "og:image"], image);
    }
  }, [config, item]);

  if (loading) {
    return <LoadingSpinner message={`Loading ${config.loadingLabel}...`} />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!item) {
    return <ErrorState error="This archive item could not be found." />;
  }

  const title = config.getTitle(item);
  const image = config.getImage?.(item);
  const primaryText = config.getPrimaryText(item);
  const publishedDate = formatDate(item.createdAt);

  return (
    <article className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={config.backTo}
          className="rounded-full border border-brand-gold/30 bg-brand-surface px-4 py-2 text-sm font-semibold text-brand-green-900 shadow-soft transition hover:bg-brand-green-50"
        >
          Back to {config.navLabel}
        </Link>
        {publishedDate && (
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green-700">
            Added {publishedDate}
          </span>
        )}
      </div>

      <header className="overflow-hidden rounded-3xl border border-brand-gold/25 bg-brand-surface shadow-soft">
        {image && (
          <div className="h-72 bg-brand-green-900 sm:h-96">
            <img src={image} alt={title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="p-6 sm:p-8 lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold-dark">
            {config.navLabel}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-brand-green-950 sm:text-5xl">
            {title}
          </h1>
          {config.getSubtitle(item) && (
            <p className="mt-4 text-lg font-semibold text-brand-green-800">{config.getSubtitle(item)}</p>
          )}
          {config.getDescription(item) && (
            <p className="mt-5 max-w-4xl text-base leading-8 text-brand-green-800/80">
              {config.getDescription(item)}
            </p>
          )}
        </div>
      </header>

      {config.renderMedia?.(item)}

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {config.meta(item).map((entry) => (
          <MetaItem key={entry.label} label={entry.label} value={entry.value} />
        ))}
      </dl>

      <TagList tags={config.getTags?.(item)} />

      {primaryText && (
        <section className="rounded-3xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft sm:p-8">
          <h2 className="font-display text-2xl font-bold text-brand-green-950">{config.contentTitle}</h2>
          <div className="mt-5 whitespace-pre-line text-base leading-8 text-brand-green-900">
            {primaryText}
          </div>
        </section>
      )}

      {config.renderExtra?.(item)}

      {config.resourceType && (
        <CommentSection
          resourceType={config.resourceType}
          resourceId={item._id}
          title={`${config.navLabel} Discussion`}
        />
      )}
    </article>
  );
}

export default ResourceDetailPage;
