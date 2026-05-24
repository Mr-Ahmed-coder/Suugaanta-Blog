import React from "react";
import { getAuthorByIdentifier } from "../api/services/authorService";
import ResourceDetailPage from "./ResourceDetailPage";

const excerpt = (text = "") => {
  const cleanText = text.replace(/\s+/g, " ").trim();
  return cleanText.length > 260 ? `${cleanText.slice(0, 257)}...` : cleanText;
};

const config = {
  navLabel: "Abwaano",
  backTo: "/abwaano",
  loadingLabel: "profile",
  fetchItem: getAuthorByIdentifier,
  contentTitle: "Biography",
  getTitle: (author) => author.name,
  getSubtitle: (author) => (author.birthYear ? `Born: ${author.birthYear}` : ""),
  getDescription: (author) => excerpt(author.biography),
  getPrimaryText: (author) => author.biography || "",
  getImage: (author) => author.photo,
  getTags: (author) => author.specialties,
  meta: (author) => [
    { label: "Birth Year", value: author.birthYear },
    { label: "Specialties", value: author.specialties?.join(", ") },
  ],
  renderExtra: (author) => {
    const links = Object.entries(author.socialLinks || {}).filter(([, url]) => Boolean(url));

    if (!links.length) return null;

    return (
      <section className="rounded-3xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft sm:p-8">
        <h2 className="font-display text-2xl font-bold text-brand-green-950">Links</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {links.map(([platform, url]) => (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-brand-gold/30 px-4 py-2 text-sm font-semibold capitalize text-brand-green-900 transition hover:bg-brand-green-50"
            >
              {platform}
            </a>
          ))}
        </div>
      </section>
    );
  },
};

function AbwaanoDetailPage() {
  return <ResourceDetailPage config={config} />;
}

export default AbwaanoDetailPage;
