import React from "react";
import { getHistoryByIdentifier } from "../api/services/historyService";
import ResourceDetailPage from "./ResourceDetailPage";

const excerpt = (text = "") => {
  const cleanText = text.replace(/\s+/g, " ").trim();
  return cleanText.length > 260 ? `${cleanText.slice(0, 257)}...` : cleanText;
};

const config = {
  resourceType: "history",
  navLabel: "Taariikho",
  backTo: "/taariikho",
  loadingLabel: "article",
  fetchItem: getHistoryByIdentifier,
  contentTitle: "Article",
  getTitle: (article) => article.title,
  getSubtitle: () => "",
  getDescription: (article) => excerpt(article.content),
  getPrimaryText: (article) => article.content || "",
  getImage: (article) => article.coverImage,
  getTags: (article) => article.tags,
  meta: (article) => [{ label: "Category", value: article.category }],
  renderExtra: (article) =>
    article.references?.length ? (
      <section className="rounded-3xl border border-brand-gold/20 bg-brand-surface p-6 shadow-soft sm:p-8">
        <h2 className="font-display text-2xl font-bold text-brand-green-950">References</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-brand-green-800">
          {article.references.map((reference) => (
            <li key={reference}>{reference}</li>
          ))}
        </ul>
      </section>
    ) : null,
};

function TaariikhoDetailPage() {
  return <ResourceDetailPage config={config} />;
}

export default TaariikhoDetailPage;
