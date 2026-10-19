import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AnchorHTMLAttributes } from "react";
import type { Article } from "@workspace/api-client-react";
import { ArticleCard } from "../src/components/ui/ArticleCard";

vi.mock("wouter", () => ({
  Link: ({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const baseArticle = {
  id: 42,
  title: "Solarenergie im Landkreis",
  categorySlug: "energie",
  categoryName: "Energie & Erneuerbare",
  excerpt: "Ein lokales Beispiel.",
  author: "Redaktion",
  publishedAt: "2026-10-09T12:00:00.000Z",
  readingMinutes: 3,
  imageUrl: "https://example.com/bild.jpg",
  imageCredit: "Max Mustermann",
  imageLicense: "CC BY 4.0",
  imageSourcePageUrl: "https://commons.wikimedia.org/wiki/File:Example.jpg",
  imageSourceUrl: "https://upload.wikimedia.org/example.jpg",
  content: "Artikeltext.",
  tags: [],
} as Article;

afterEach(() => {
  cleanup();
});

describe("Bildnachweise in Artikelkarten", () => {
  it.each(["feature", "sidebar", "vertical"] as const)(
    "zeigt Urheber, Lizenz und eine barrierefrei benannte Quelle im %s-Layout",
    (layout) => {
      render(<ArticleCard article={baseArticle} layout={layout} />);

      const attribution = screen.getByTestId(`image-attribution-${baseArticle.id}`);
      expect(attribution.textContent).toContain("Max Mustermann");
      expect(attribution.textContent).toContain("CC BY 4.0");
      const sourceLink = screen.getByRole("link", {
        name: "Bildquelle zu „Solarenergie im Landkreis“ (öffnet in neuem Tab)",
      });
      expect(sourceLink.getAttribute("href")).toBe(baseArticle.imageSourcePageUrl);
      expect(sourceLink.getAttribute("target")).toBe("_blank");
      expect(sourceLink.getAttribute("rel")).toBe("noopener noreferrer");
      expect(
        screen.getAllByRole("link").some((link) => link.getAttribute("href") === `/artikel/${baseArticle.id}`),
      ).toBe(true);
    },
  );

  it("zeigt vorhandene Angaben ohne erfundene Credits und nutzt die Datei-URL als Quellenlink-Fallback", () => {
    const article = {
      ...baseArticle,
      imageCredit: null,
      imageLicense: null,
      imageSourcePageUrl: null,
    } as Article;

    render(<ArticleCard article={article} layout="vertical" />);

    expect(screen.queryByText("Bildnachweis:")).toBeNull();
    expect(screen.queryByText("Max Mustermann")).toBeNull();
    expect(screen.getByRole("link", {
      name: "Bildquelle zu „Solarenergie im Landkreis“ (öffnet in neuem Tab)",
    }).getAttribute("href")).toBe(baseArticle.imageSourceUrl);
  });

  it("zeigt keine Bildnachweis-Zeile ohne gespeicherte Angaben", () => {
    const article = {
      ...baseArticle,
      imageCredit: null,
      imageLicense: null,
      imageSourcePageUrl: null,
      imageSourceUrl: null,
    } as Article;

    render(<ArticleCard article={article} layout="vertical" />);

    expect(screen.queryByTestId(`image-attribution-${article.id}`)).toBeNull();
    expect(screen.queryByRole("link", { name: /Bildquelle/ })).toBeNull();
  });
});
