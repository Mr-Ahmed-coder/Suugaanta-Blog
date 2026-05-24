import React from "react";
import { getSongByIdentifier } from "../api/services/songService";
import ResourceDetailPage from "./ResourceDetailPage";

const config = {
  navLabel: "Heeso",
  backTo: "/heeso",
  loadingLabel: "song",
  fetchItem: getSongByIdentifier,
  contentTitle: "Lyrics",
  getTitle: (song) => song.title,
  getSubtitle: (song) => (song.writer?.name || song.author?.name || song.artist || song.performer ? `Artist: ${song.writer?.name || song.author?.name || song.artist || song.performer}` : ""),
  getDescription: (song) => song.description || "",
  getPrimaryText: (song) => song.lyrics || "",
  getImage: (song) => song.thumbnail,
  getTags: (song) => song.tags,
  meta: (song) => [
    { label: "Category", value: song.category },
    { label: "Writer", value: song.writer?.name || song.author?.name },
    { label: "Composer", value: song.composer?.name },
    { label: "Artist", value: song.artist || song.performer },
    { label: "Year", value: song.year },
  ],
  renderMedia: (song) =>
    song.audioUrl ? (
      <section className="rounded-3xl border border-brand-gold/20 bg-brand-surface p-5 shadow-soft">
        <h2 className="font-display text-xl font-bold text-brand-green-950">Audio</h2>
        <audio className="mt-4 w-full" src={song.audioUrl} controls preload="metadata" />
      </section>
    ) : null,
};

function HeesoDetailPage() {
  return <ResourceDetailPage config={config} />;
}

export default HeesoDetailPage;
