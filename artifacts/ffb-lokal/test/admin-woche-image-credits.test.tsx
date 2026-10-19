import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminWochePage } from "../src/pages/AdminWoche";

const { adminFetchMock } = vi.hoisted(() => ({
  adminFetchMock: vi.fn(),
}));

vi.mock("../src/lib/adminFetch", () => ({
  adminFetch: adminFetchMock,
  AdminAuthError: class AdminAuthError extends Error {},
  readApiError: vi.fn(async (_response: Response, fallback: string) => fallback),
}));

vi.mock("../src/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const generatedArticle = {
  rubrik: "Energie & Erneuerbare",
  rubrikId: 1,
  titel: "Solarstrom im Landkreis",
  slug: "solarstrom-im-landkreis",
  teaser: "Ein lokaler Überblick.",
  inhalt: "Der Artikeltext.",
  tags: [],
  sources: [],
  readingMinutes: 3,
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  adminFetchMock.mockReset();
});

describe("Bildnachweise der Bildvorschläge in der Wochenredaktion", () => {
  it("zeigt vorhandene und fehlende Credits, lässt Vorschläge auswählbar und behält lange Credits vollständig", async () => {
    const longCredit = `Bildnachweis-ohne-Trennzeichen-${"Urhebername".repeat(30)}`;
    const candidates = [
      {
        title: "Motiv mit Credit",
        imageUrl: "https://commons.wikimedia.org/wiki/File:mit-credit.jpg",
        previewUrl: "https://commons.wikimedia.org/thumb/mit-credit.jpg",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:mit-credit.jpg",
        license: "CC0",
        credit: "© Bildstelle FFB",
      },
      {
        title: "Motiv ohne Credit",
        imageUrl: "https://commons.wikimedia.org/wiki/File:ohne-credit.jpg",
        previewUrl: "https://commons.wikimedia.org/thumb/ohne-credit.jpg",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:ohne-credit.jpg",
        license: "CC0",
        credit: "   ",
      },
      {
        title: "Motiv mit langem Credit",
        imageUrl: "https://commons.wikimedia.org/wiki/File:mit-langem-credit.jpg",
        previewUrl: "https://commons.wikimedia.org/thumb/mit-langem-credit.jpg",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:mit-langem-credit.jpg",
        license: "CC0",
        credit: longCredit,
      },
    ];

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/api/woche/status")) {
        return Response.json({
          recentArticles: [],
          subscriberCount: 0,
          lastPublishedAt: null,
        });
      }
      if (url.startsWith("/api/articles?limit=100&offset=0")) {
        return Response.json([]);
      }
      throw new Error(`Unerwarteter Abruf im UI-Test: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    adminFetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ draft: null }),
      })
      .mockResolvedValueOnce(
        new Response(`data: ${JSON.stringify({ article: generatedArticle })}\n\ndata: {"done":true}\n\n`),
      )
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ candidates }),
      });

    render(<AdminWochePage />);

    fireEvent.click(await screen.findByRole("button", { name: /Artikel generieren/ }));
    await screen.findByText("Solarstrom im Landkreis");
    fireEvent.click(screen.getByRole("button", { name: /1 Artikel veröffentlichen/ }));

    const missingCredit = await screen.findByText(/Kein Credit in den Metadaten hinterlegt/);
    expect(screen.getByText("Motiv ohne Credit")).toBeTruthy();
    expect(screen.getByText(/© Bildstelle FFB/).textContent).toContain("© Bildstelle FFB");

    const longCreditDetails = screen.getByText((_content, element) =>
      element?.tagName === "P" && element.textContent?.includes(longCredit) === true,
    );
    expect(longCreditDetails.textContent).toContain(longCredit);
    expect(longCreditDetails.className).toContain("[overflow-wrap:anywhere]");
    expect(longCreditDetails.className).not.toMatch(/truncate|line-clamp|overflow-hidden/);

    const missingCreditDetails = missingCredit.closest("p");
    expect(missingCreditDetails?.textContent).toContain("Kein Credit in den Metadaten hinterlegt");
    const selectionButtons = screen.getAllByRole("button", { name: "Foto auswählen" });
    expect(selectionButtons).toHaveLength(3);
    fireEvent.click(selectionButtons[1]);

    expect(screen.getAllByRole("button", { name: "Ausgewählt" })).toHaveLength(1);
    expect(screen.getByText("Motiv ohne Credit").parentElement?.parentElement?.textContent)
      .toContain("Ausgewählt");
  });
});
