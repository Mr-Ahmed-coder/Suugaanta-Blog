function PageHero({ eyebrow, title, description }) {
  return (
    <section className="rounded-3xl border border-brand-gold/30 bg-brand-surface px-6 py-10 shadow-soft sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold-dark">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl text-brand-green-950 sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-brand-green-800 sm:text-lg">{description}</p>
    </section>
  );
}

export default PageHero;
