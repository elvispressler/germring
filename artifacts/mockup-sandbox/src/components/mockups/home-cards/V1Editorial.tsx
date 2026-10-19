import { Badge } from "@/components/ui/badge";

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

function ArticleCardV1({ article, featured = false }: { article: typeof ARTICLES[0]; featured?: boolean }) {
  return (
    <article
      className="group flex flex-col h-full rounded-2xl overflow-hidden border border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:shadow-emerald-900/10 hover:-translate-y-0.5"
    >
      <div className={`relative overflow-hidden bg-muted shrink-0 ${featured ? "aspect-[16/7]" : "aspect-video"}`}>
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 left-3">
          <span className="inline-block bg-white/95 text-foreground text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            {article.category}
          </span>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-5">
        <span className="text-xs text-muted-foreground mb-2">{article.date}</span>
        <h3 className={`font-serif font-bold leading-snug mb-2.5 group-hover:text-primary transition-colors ${featured ? "text-xl" : "text-lg"} line-clamp-3`}>
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-3">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <span className="text-xs text-muted-foreground">{article.readingMinutes} Min. Lesezeit</span>
          <span className="text-xs font-semibold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Lesen →
          </span>
        </div>
      </div>
    </article>
  );
}

export function V1Editorial() {
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

      {/* Sektion-Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-baseline justify-between pb-4 border-b border-border/60">
          <h2 className="text-3xl font-serif font-bold">Energie & Erneuerbare</h2>
          <span className="text-sm font-medium text-primary">Alle Artikel →</span>
        </div>
      </div>

      {/* Grid: 3 gleiche Karten */}
      <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6 mb-14">
        {ARTICLES.map((a) => (
          <ArticleCardV1 key={a.id} article={a} />
        ))}
      </div>

      {/* Beschlüsse horizontal */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-baseline justify-between pb-4 border-b border-border/60">
          <h2 className="text-3xl font-serif font-bold">Beschlüsse & Einordnung</h2>
          <span className="text-sm font-medium text-primary">Kommunalpolitik →</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-2 gap-10">
        {ARTICLES.slice(0, 2).map((a) => (
          <article key={a.id} className="group flex gap-5 items-start rounded-xl p-4 -mx-4 hover:bg-card/60 transition-colors">
            <div className="w-1/3 shrink-0 overflow-hidden rounded-lg aspect-video bg-muted">
              <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="flex-1">
              <span className="text-xs text-muted-foreground block mb-1">{a.category} · {a.date}</span>
              <h3 className="font-serif font-bold text-lg leading-snug mb-1.5 group-hover:text-primary transition-colors line-clamp-2">{a.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>
              <span className="text-xs text-muted-foreground mt-2 block">{a.readingMinutes} Min. Lesezeit</span>
            </div>
          </article>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-10 opacity-60">V1 · Editorial — Karten mit Hover-Effekten, Badge im Bild</p>
    </div>
  );
}
