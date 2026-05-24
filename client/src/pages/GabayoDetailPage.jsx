import React from "react";
import { getPoetryByIdentifier } from "../api/services/poetryService";
import ResourceDetailPage from "./ResourceDetailPage";

const config = {
  navLabel: "Gabayo",
  backTo: "/gabayo",
  loadingLabel: "poem",
  fetchItem: getPoetryByIdentifier,
  contentTitle: "Poem",
  getTitle: (poetry) => poetry.title,
  getSubtitle: (poetry) => (poetry.author?.name || poetry.poet ? `Poet: ${poetry.author?.name || poetry.poet}` : ""),
  getDescription: () => "",
  getPrimaryText: (poetry) => poetry.content || "",
  getTags: (poetry) => poetry.tags,
  meta: (poetry) => [
    { label: "Category", value: poetry.category },
    { label: "Poet", value: poetry.author?.name || poetry.poet },
  ],
  renderMedia: (poetry) =>
    poetry.audioRecitation ? (
      <section className="rounded-3xl border border-brand-gold/20 bg-brand-surface p-5 shadow-soft">
        <h2 className="font-display text-xl font-bold text-brand-green-950">Audio Recitation</h2>
        <audio className="mt-4 w-full" src={poetry.audioRecitation} controls preload="metadata" />
      </section>
    ) : null,
};

function GabayoDetailPage() {
  return <ResourceDetailPage config={config} />;
}

export default GabayoDetailPage;
