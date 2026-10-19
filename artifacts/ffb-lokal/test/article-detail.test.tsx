import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ArticleDetailPage } from "../src/pages/ArticleDetail";

const { article } = vi.hoisted(() => ({
  article: {
    id: 42,
    title: "Langer Bildnachweis im Artikel",
    categorySlug: "energie",
    categoryName: "Energie",
    excerpt: "Ein Artikel mit einem langen Bildnachweis.",
    author: "Redaktion",
    publishedAt: "2026-10-09T12:00:00.000Z",
    readingMinutes: 3,
    imageUrl: "https://example.com/bild.jpg",
    imageCredit: `Fotografie ${"UntrennbarerUrhebernachweis".repeat(12)}`,
    imageLicense: "CC BY 4.0",
    imageSourcePageUrl: "https://example.com/bildquelle",
    imageSourceUrl: null,
    content: "Artikeltext.",
    tags: [],
  },
}));

vi.mock("@workspace/api-client-react", () => ({
  useGetArticle: () => ({ data: article, isLoading: false }),
  useListArticles: () => ({ data: [] }),
  getGetArticleQueryKey: () => [],
  getListArticlesQueryKey: () => [],
}));

vi.mock("wouter", () => ({
  useParams: () => ({ id: "42" }),
}));

vi.mock("../src/hooks/usePageMeta", () => ({
  usePageMeta: () => undefined,
}));

vi.mock("../src/components/ui/SponsorBox", () => ({
  SponsorBox: () => null,
}));

vi.mock("../src/components/ui/ArticleCard", () => ({
  ArticleCard: () => null,
}));

afterEach(() => {
  cleanup();
});

describe("Bildnachweis auf der Artikelseite", () => {
  it("bricht lange Credits auch ohne Trennstellen um und lässt Lizenz und Bildquelle erreichbar", () => {
    render(<ArticleDetailPage />);

    const credit = screen.getByTestId("text-image-credit");
    expect(credit.textContent).toBe(`${article.imageCredit} · ${article.imageLicense}`);
    expect(credit.classList.contains("min-w-0")).toBe(true);
    expect(credit.classList.contains("flex-1")).toBe(true);
    expect(credit.className).toContain("[overflow-wrap:anywhere]");

    const sourceLink = screen.getByRole("link", { name: "Bildquelle" });
    expect(sourceLink.getAttribute("href")).toBe(article.imageSourcePageUrl);
  });
});
