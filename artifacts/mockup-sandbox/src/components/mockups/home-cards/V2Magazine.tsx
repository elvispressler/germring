const ARTICLES = [
  {
    id: 1,
    category: "Energie & Erneuerbare",
    date: "14. Juni 2025",
    title: "Solarausbau im Landkreis FFB: 2.800 neue Anlagen in 18 Monaten",
    excerpt: "Der Ausbau von Photovoltaik-Anlagen auf privaten und kommunalen Dächern nimmt im Landkreis Fürstenfeldbruck Fahrt auf.",
    readingMinutes: 5,
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: 2,
    category: "Kommunalpolitik",
    date: "10. Juni 2025",
    title: "Kreistag FFB beschließt kommunalen Wärmeplan bis 2027",
    excerpt: "Mit 42 zu 18 Stimmen hat der Kreistag den Rahmenplan für klimaneutrale Wärmeversorgung verabschiedet.",
    readingMinutes: 4,
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: 3,
    category: "Praxis & Zukunft",
    date: "7. Juni 2025",
    title: "Wärmepumpe oder Pellets? Was sich für Bestandsbauten wirklich lohnt",
    excerpt: "Eine Analyse der tatsächlichen Betriebskosten für typische Einfamilienhäuser im Landkreis FFB.",
    readingMinutes: 7,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Energie & Erneuerbare": "#059669",
  "Kommunalpolitik":       "#0369a1",
  "Praxis & Zukunft":      "#7c3aed",
};

export function V2Magazine() {
  const [featured, ...rest] = ARTICLES;

  return (
    <div
      className="min-h-screen p-10 font-sans"
      style={{
        background: "linear-gradient(135deg, hsl(160,45%,80%) 0%, hsl(160,32%,89%) 40%, #ffffff 72%)",
        fontFamily: "'Public Sans', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Public+Sans:wght@400;500;600&display=swap');
        .font-serif { font-family: 'Merriweather', Georgia, serif; }
      `}</style>

      {/* Sektion-Header mit Akzentlinie */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-1">
          <span className="block w-8 h-0.5 bg-emerald-600 rounded" />
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Energie & Erneuerbare</span>
        </div>
        <div className="flex items-baseline justify-between pb-4 border-b-2 border-foreground/10">
          <h2 className="text-3xl font-serif font-bold">Aktuelle Berichte</h2>
          <span className="text-sm font-medium text-primary">Alle Artikel →</span>
        </div>
      </div>

      {/* Magazine-Layout: großes Feature + 2 Seitenleisten-Artikel */}
      <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6 mb-14">

        {/* Feature-Karte — nimmt 2 Spalten */}
        <article className="col-span-2 group relative rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm hover:shadow-xl hover:shadow-emerald-900/10 transition-all duration-300">
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={featured.imageUrl}
              alt={featured.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)" }} />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span
                className="inline-block text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3"
                style={{ background: CATEGORY_COLORS[featured.category] + "cc" }}
              >
                {featured.category}
              </span>
              <h3 className="font-serif font-bold text-2xl text-white leading-tight mb-1">{featured.title}</h3>
              <p className="text-white/75 text-sm line-clamp-2">{featured.excerpt}</p>
            </div>
          </div>
          <div className="flex items-center justify-between px-6 py-3 border-t border-border/30 bg-card/80">
            <span className="text-xs text-muted-foreground">{featured.date} · {featured.readingMinutes} Min. Lesezeit</span>
            <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">Lesen →</span>
          </div>
        </article>

        {/* Seitenleiste — 2 kleinere Artikel gestapelt */}
        <div className="flex flex-col gap-4">
          {rest.map((a) => (
            <article key={a.id} className="group flex flex-col rounded-xl overflow-hidden border border-border/40 bg-card shadow-sm hover:shadow-lg hover:shadow-emerald-900/8 transition-all duration-300 flex-1">
              <div className="relative overflow-hidden aspect-video">
                <img
                  src={a.imageUrl}
                  alt={a.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <span
                  className="absolute top-2 left-2 text-white text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: CATEGORY_COLORS[a.category] + "cc" }}
                >
                  {a.category}
                </span>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-serif font-bold text-sm leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-3">{a.title}</h3>
                <span className="text-xs text-muted-foreground mt-auto">{a.date} · {a.readingMinutes} Min.</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Beschlüsse — Nummern-Stil */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-1">
          <span className="block w-8 h-0.5 bg-sky-600 rounded" />
          <span className="text-xs font-semibold uppercase tracking-widest text-sky-700">Kommunalpolitik</span>
        </div>
        <div className="flex items-baseline justify-between pb-4 border-b-2 border-foreground/10">
          <h2 className="text-3xl font-serif font-bold">Beschlüsse & Einordnung</h2>
          <span className="text-sm font-medium text-primary">Alle →</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-2 gap-8">
        {ARTICLES.slice(0, 2).map((a, i) => (
          <article key={a.id} className="group flex gap-4 items-start">
            <span className="font-serif font-black text-5xl text-muted-foreground/15 leading-none select-none shrink-0 translate-y-1">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <span
                className="inline-block text-white text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2"
                style={{ background: CATEGORY_COLORS[a.category] }}
              >
                {a.category}
              </span>
              <h3 className="font-serif font-bold text-lg leading-snug mb-1.5 group-hover:text-primary transition-colors line-clamp-2">{a.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{a.excerpt}</p>
              <span className="text-xs text-muted-foreground">{a.date} · {a.readingMinutes} Min. Lesezeit</span>
            </div>
          </article>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-12 opacity-60">V2 · Magazine-Grid — Feature-Karte + Sidebar, Kategorie-Farbakzente</p>
    </div>
  );
}
