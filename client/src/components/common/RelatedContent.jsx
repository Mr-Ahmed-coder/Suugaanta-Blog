import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRelatedContent } from "../../api/services/relatedService";
import { ErrorState, LoadingSpinner } from "./FeedbackStates";

const emptyRelated = {
  relatedAuthors: [],
  relatedSongs: [],
  relatedPoetry: [],
  relatedHistory: [],
};

const excerpt = (text = "", max = 130) => {
  const cleanText = String(text || "").replace(/\s+/g, " ").trim();
  return cleanText.length > max ? `${cleanText.slice(0, max - 3)}...` : cleanText;
};

const sections = [
  {
    key: "relatedAuthors",
    title: "Related Authors",
    label: "Abwaan",
    path: (item) => `/abwaano/${item.slug || item._id}`,
    titleFor: (item) => item.name,
    descriptionFor: (item) => item.legacySummary || item.biography || item.specialties?.join(", "),
    metaFor: (item) => item.specialties?.join(", "),
  },
  {
    key: "relatedSongs",
    title: "Related Songs",
    label: "Hees",
    path: (item) => `/heeso/${item.slug || item._id}`,
    titleFor: (item) => item.title,
    descriptionFor: (item) => item.description || item.lyrics,
    metaFor: (item) => item.writer?.name || item.author?.name || item.artist || item.performer || item.category,
  },
  {
    key: "relatedPoetry",
    title: "Related Poetry",
    label: "Gabay",
    path: (item) => `/gabayo/${item.slug || item._id}`,
    titleFor: (item) => item.title,
    descriptionFor: (item) => item.content,
    metaFor: (item) => item.author?.name || item.poet || item.category,
  },
  {
    key: "relatedHistory",
    title: "Related History",
    label: "Taariikh",
    path: (item) => `/taariikho/${item.slug || item._id}`,
    titleFor: (item) => item.title,
    descriptionFor: (item) => item.content,
    metaFor: (item) => item.category,
  },
];

function RelatedCard({ item, config }) {
  const title = config.titleFor(item);
  const meta = config.metaFor(item);
  const description = config.descriptionFor(item);

  return (
    <Link
      to={config.path(item)}
      className="block rounded-2xl border border-brand-gold/15 bg-brand-surface p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-gold/40 hover:bg-brand-cream/30"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-brand-gold/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-gold-dark">
          {config.label}
        </span>
        {meta && <span className="text-xs font-semibold text-brand-green-700/75">{meta}</span>}
      </div>
      <h3 className="mt-3 font-display text-lg font-bold text-brand-green-950">{title}</h3>
      {description && <p className="mt-2 text-sm leading-6 text-brand-green-800/75">{excerpt(description)}</p>}
    </Link>
  );
}

function RelatedSection({ config, items }) {
  if (!items?.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-xl font-bold text-brand-green-950">{config.title}</h3>
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-gold-dark">
          {items.length} found
        </span>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <RelatedCard key={item._id} item={item} config={config} />
        ))}
      </div>
    </section>
  );
}

function RelatedContent({ resourceType, resourceId }) {
  const [related, setRelated] = useState(emptyRelated);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!resourceType || !resourceId) return;

    let isMounted = true;

    async function loadRelatedContent() {
      setLoading(true);
      setError("");

      try {
        const response = await getRelatedContent(resourceType, resourceId, { limit: 4 });
        if (isMounted) {
          setRelated({ ...emptyRelated, ...(response.data || {}) });
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Related content could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRelatedContent();

    return () => {
      isMounted = false;
    };
  }, [resourceType, resourceId]);

  const hasRelated = sections.some((section) => related[section.key]?.length > 0);

  if (loading) {
    return (
      <section className="rounded-3xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft sm:p-8">
        <LoadingSpinner message="Finding related archive content..." />
      </section>
    );
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!hasRelated) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft sm:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold-dark">Continue Exploring</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-brand-green-950">Related Archive Content</h2>
      </div>
      <div className="mt-6 space-y-8">
        {sections.map((section) => (
          <RelatedSection key={section.key} config={section} items={related[section.key]} />
        ))}
      </div>
    </section>
  );
}

export default RelatedContent;
