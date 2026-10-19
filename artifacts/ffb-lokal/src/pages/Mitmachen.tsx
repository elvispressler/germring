import { useState, useEffect } from "react";
import { Link } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────

type Idee = {
  id: number;
  title: string;
  category: string;
  message: string;
  authorName: string | null;
  createdAt: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "energie",   label: "Energie & Erneuerbare", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  { value: "kommunal",  label: "Kommunalpolitik",        color: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" },
  { value: "praxis",    label: "Praxis & Zukunft",       color: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300" },
  { value: "zahlen",    label: "Zahlen & Daten",         color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  { value: "sonstiges", label: "Sonstiges",              color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
];

const FEEDBACK_TYPEN = [
  { value: "👍 Gut so",          label: "👍 Gut so" },
  { value: "🤔 Verbesserung",    label: "🤔 Verbesserungsvorschlag" },
  { value: "💡 Idee",            label: "💡 Allgemeine Idee" },
  { value: "❓ Frage",           label: "❓ Frage" },
];

function getCategoryMeta(value: string) {
  return CATEGORIES.find(c => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
}

// ─── Ideenboard ───────────────────────────────────────────────────────────────

function Ideenboard({ ideen, loading }: { ideen: Idee[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-xl p-5 bg-card animate-pulse h-44" />
        ))}
      </div>
    );
  }

  if (ideen.length === 0) {
    return (
      <div className="text-center py-16 border rounded-xl bg-muted/30">
        <p className="text-3xl mb-3">💡</p>
        <p className="text-muted-foreground text-sm">Noch keine Ideen eingereicht — sei die erste Person!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {ideen.map(idee => {
        const cat = getCategoryMeta(idee.category);
        return (
          <div key={idee.id} className="border rounded-xl p-5 bg-card flex flex-col gap-3 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat.color}`}>{cat.label}</span>
              <span className="text-xs text-muted-foreground shrink-0">{formatDate(idee.createdAt)}</span>
            </div>
            <h3 className="font-semibold text-sm leading-snug">{idee.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 flex-1">{idee.message}</p>
            <p className="text-xs text-muted-foreground border-t pt-3">
              Von <span className="font-medium text-foreground">{idee.authorName || "Anonym"}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Idee-Formular ────────────────────────────────────────────────────────────

function IdeeForm() {
  const [form, setForm] = useState({ title: "", category: "", message: "", authorName: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/mitmachen/idee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Unbekannter Fehler"); return; }
      setDone(true);
      setForm({ title: "", category: "", message: "", authorName: "", email: "" });
    } catch {
      setError("Netzwerkfehler — bitte prüfe deine Verbindung.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 p-8 text-center">
        <p className="text-2xl mb-2">✅</p>
        <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">Idee eingereicht!</p>
        <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-4">Danke! Deine Idee wird jetzt redaktionell geprüft und erst nach Freigabe im Board veröffentlicht.</p>
        <button
          onClick={() => setDone(false)}
          className="text-sm underline text-emerald-700 dark:text-emerald-400 hover:no-underline"
        >
          Weitere Idee einreichen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Titel */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Kurztitel der Idee <span className="text-destructive">*</span></label>
        <input
          type="text"
          required
          maxLength={120}
          placeholder={'z. B. "Solardach-Kataster für alle Gemeinden"'}
          value={form.title}
          onChange={e => set("title", e.target.value)}
          className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Bereich */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Bereich <span className="text-destructive">*</span></label>
        <select
          required
          value={form.category}
          onChange={e => set("category", e.target.value)}
          className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Bitte wählen …</option>
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Beschreibung */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Beschreibung <span className="text-destructive">*</span></label>
        <textarea
          required
          rows={4}
          maxLength={1500}
          placeholder="Was genau schwebt dir vor? Was wäre der Mehrwert für den Landkreis?"
          value={form.message}
          onChange={e => set("message", e.target.value)}
          className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">{form.message.length}/1500</p>
      </div>

      {/* Name + E-Mail */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Name <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input
            type="text"
            maxLength={80}
            placeholder="Dein Name oder leer lassen"
            value={form.authorName}
            onChange={e => set("authorName", e.target.value)}
            className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">E-Mail <span className="text-destructive">*</span></label>
          <input
            type="email"
            required
            placeholder="fuer@rueckmeldung.de"
            value={form.email}
            onChange={e => set("email", e.target.value)}
            className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Deine E-Mail-Adresse wird nicht veröffentlicht — nur für unsere interne Rückmeldung.
      </p>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
      >
        {loading ? "Wird eingereicht …" : "Idee einreichen →"}
      </button>
    </form>
  );
}

// ─── Meinung-Formular ─────────────────────────────────────────────────────────

function MeinungForm() {
  const [form, setForm] = useState({ typ: "", message: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/mitmachen/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Unbekannter Fehler"); return; }
      setDone(true);
      setForm({ typ: "", message: "", email: "" });
    } catch {
      setError("Netzwerkfehler — bitte prüfe deine Verbindung.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 p-6 text-center">
        <p className="text-2xl mb-2">✅</p>
        <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">Danke für dein Feedback!</p>
        <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-4">Wir melden uns wenn nötig per E-Mail.</p>
        <button onClick={() => setDone(false)} className="text-sm underline text-emerald-700 dark:text-emerald-400 hover:no-underline">
          Weitere Meinung senden
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Typ */}
      <div>
        <label className="block text-sm font-medium mb-2">Art des Feedbacks <span className="text-destructive">*</span></label>
        <div className="flex flex-wrap gap-2">
          {FEEDBACK_TYPEN.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => set("typ", t.value)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                form.typ === t.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Nachricht */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Deine Meinung <span className="text-destructive">*</span></label>
        <textarea
          required
          rows={3}
          maxLength={800}
          placeholder="Was denkst du über germring.de? Was fehlt, was gefällt dir?"
          value={form.message}
          onChange={e => set("message", e.target.value)}
          className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* E-Mail */}
      <div>
        <label className="block text-sm font-medium mb-1.5">E-Mail <span className="text-destructive">*</span></label>
        <input
          type="email"
          required
          placeholder="fuer@rueckmeldung.de"
          value={form.email}
          onChange={e => set("email", e.target.value)}
          className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <p className="text-xs text-muted-foreground mt-1">Nur für eventuelle Rückfragen — wird nicht veröffentlicht.</p>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-foreground text-background rounded-lg py-2.5 text-sm font-semibold hover:bg-foreground/90 disabled:opacity-60 transition-colors"
      >
        {loading ? "Wird gesendet …" : "Feedback senden →"}
      </button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function MitmachenPage() {
  const [ideen, setIdeen] = useState<Idee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/mitmachen/ideen")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setIdeen(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <div className="relative bg-muted/30 border-b py-14 overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-primary/5" />
          <div className="absolute top-6 left-1/3 w-36 h-36 rounded-full border border-primary/10" />
          <div className="absolute -bottom-14 right-1/4 w-52 h-52 rounded-full bg-primary/[0.03]" />
        </div>
        <div className="relative container mx-auto px-4 lg:px-8 max-w-5xl">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-3">Gemeinschaft</p>
          <h1 className="text-4xl font-serif font-bold mb-3">Mitmachen & Mitgestalten</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            germring.de lebt von eurer Beteiligung. Schlagt Themen vor, teilt eure Meinung — wir lesen alles und melden uns.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-5xl mt-12 space-y-16">

        {/* ── Ideenboard ── */}
        <section id="ideenboard">
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-serif font-bold">Ideenboard</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {loading ? "Ideen werden geladen …" : ideen.length === 0 ? "Noch keine Ideen — starte das Board!" : `${ideen.length} Idee${ideen.length === 1 ? "" : "n"} aus der Community`}
              </p>
            </div>
            <a
              href="#idee-einreichen"
              className="shrink-0 text-sm font-medium text-primary hover:underline"
            >
              + Idee einreichen
            </a>
          </div>
          <Ideenboard ideen={ideen} loading={loading} />
        </section>

        {/* ── Idee einreichen ── */}
        <section id="idee-einreichen">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Info-Spalte */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-serif font-bold mb-3">Idee einreichen</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Fehlt ein Thema? Hättest du gerne eine Daten-Visualisierung zu einem bestimmten Bereich?
                Schlag es vor — gute Ideen setzen wir zeitnah um.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                 <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span>Redaktionelle Prüfung vor Veröffentlichung</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span>Wir melden uns bei guten Ideen per E-Mail</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span>Kein Account nötig</li>
              </ul>
            </div>
            {/* Formular */}
            <div className="lg:col-span-3 border rounded-xl p-6 bg-card">
              <IdeeForm />
            </div>
          </div>
        </section>

        {/* ── Meinung zur Seite ── */}
        <section id="meinung" className="border-t pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Info-Spalte */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-serif font-bold mb-3">Meinung zur Seite</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Was gefällt dir? Was fehlt? Was nervt? Direktes Feedback hilft uns,
                germring.de besser zu machen — jede Rückmeldung wird gelesen.
              </p>
              <p className="text-xs text-muted-foreground">
                Feedback zur Seite erscheint nicht öffentlich — es geht direkt an die Redaktion.
              </p>
            </div>
            {/* Formular */}
            <div className="lg:col-span-3 border rounded-xl p-6 bg-card">
              <MeinungForm />
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <div className="border-t pt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>Lieber direkt schreiben? <a href="mailto:redaktion@germring.de" className="text-primary hover:underline">redaktion@germring.de</a></p>
          <Link href="/partner" className="text-primary hover:underline">Werbepartner werden →</Link>
        </div>

      </div>
    </div>
  );
}
