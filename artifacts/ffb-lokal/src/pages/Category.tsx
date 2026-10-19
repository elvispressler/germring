import { useParams } from "wouter";
import { useListArticles, useListCategories, getListArticlesQueryKey } from "@workspace/api-client-react";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { LogoLoader } from "@/components/ui/LogoLoader";
import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";

export function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: categories } = useListCategories();
  const { data: articles, isLoading } = useListArticles(
    { categorySlug: slug, limit: 20 },
    { query: { queryKey: getListArticlesQueryKey({ categorySlug: slug, limit: 20 }) } }
  );

  const category = categories?.find((c) => c.slug === slug);

  const catDescriptions: Record<string, string> = {
    "energie-erneuerbare": "Alle Artikel über Solarenergie, Windkraft, Wärmepumpen und erneuerbare Energien im Landkreis Fürstenfeldbruck.",
    "kommunalpolitik": "Berichte aus dem Kreistag, den Gemeinderäten und der Kommunalpolitik im Landkreis FFB.",
    "zahlen-daten": "Fakten, Statistiken und Daten zur Energiewende und Klimaschutz im Landkreis Fürstenfeldbruck.",
    "praxis-zukunft": "Tipps, Förderprogramme und Zukunftsprojekte für Bürger im Landkreis FFB.",
  };

  usePageMeta({
    title: category?.name ?? slug,
    description: category?.description ?? catDescriptions[slug] ?? `Alle Artikel aus der Rubrik ${category?.name ?? slug} auf germring.de.`,
    path: `/kategorie/${slug}`,
  });

  return (
    <div className="min-h-screen">
      <div className="bg-muted/30 border-b py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <nav className="text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">Startseite</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{category?.name ?? slug}</span>
          </nav>
          <h1 className="text-4xl font-serif font-bold mb-2">
            {category?.name ?? slug}
          </h1>
          {category?.description && (
            <p className="text-muted-foreground text-lg mt-2 max-w-2xl">{category.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-4">
            {articles?.length ?? 0} {articles?.length === 1 ? "Artikel" : "Artikel"}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-5xl py-12">
        {isLoading ? (
          <LogoLoader className="min-h-[48vh]" label="Artikel werden geladen" />
        ) : articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} data-testid={`card-article-${article.id}`} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg">Noch keine Artikel in dieser Rubrik.</p>
            <Link href="/" className="text-primary hover:underline mt-4 inline-block text-sm">
              Zurück zur Startseite
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
