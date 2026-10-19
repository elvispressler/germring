import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminWochePage } from "../src/pages/AdminWoche";

const { adminFetchMock } = vi.hoisted(() => ({ adminFetchMock: vi.fn() }));
vi.mock("../src/lib/adminFetch", () => ({
  adminFetch: adminFetchMock,
  AdminAuthError: class AdminAuthError extends Error {},
  readApiError: vi.fn(async (_response: Response, fallback: string) => fallback),
}));
vi.mock("../src/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const articles = [1, 2, 3, 4].map(id => ({
  rubrik: `Rubrik ${id}`,
  rubrikId: id,
  titel: `Generierter Artikel ${id}`,
  slug: `artikel-${id}`,
  teaser: `Teaser ${id}`,
  inhalt: `Inhalt ${id}`,
  tags: [],
  sources: [],
  readingMinutes: 1,
}));

function events(ids: number[], complete = true) {
  const messages = ids.map(id => ({ article: articles[id - 1] }));
  return new Response(
    messages.map(message => `data: ${JSON.stringify(message)}\n\n`).join("")
      + (complete ? 'data: {"done":true}\n\n' : ""),
  );
}

function setup(generation: (body: { categoryIds: number[] }) => Response) {
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({
    recentArticles: [], subscriberCount: 0, lastPublishedAt: null,
  })));
  adminFetchMock.mockImplementation(async (url: string, options?: RequestInit) => {
    if (url.endsWith("/newsletter-entwurf/latest")) return Response.json({ draft: null });
    if (url.endsWith("/artikel-generieren")) return generation(JSON.parse(String(options?.body)));
    throw new Error(`Unerwarteter Abruf: ${url}`);
  });
}

async function startGeneration() {
  render(<AdminWochePage />);
  const button = await screen.findByRole("button", { name: /Artikel generieren/ });
  await waitFor(() => expect(button.hasAttribute("disabled")).toBe(false));
  fireEvent.click(button);
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  adminFetchMock.mockReset();
});

describe("Vier Artikel im Wochenassistenten", () => {
  it("fordert alle vier Rubriken an und zeigt alle vier fertigen Artikel", async () => {
    setup(body => {
      expect(body.categoryIds).toEqual([1, 2, 3, 4]);
      return events([1, 2, 3, 4]);
    });
    await startGeneration();
    for (const id of [1, 2, 3, 4]) await screen.findByText(`Generierter Artikel ${id}`);
    expect(screen.queryByText("Die Generierung war nicht vollständig.")).toBeNull();
  });

  it("meldet einen abgebrochenen Stream als Teilresultat und holt nur die fehlenden Rubriken nach", async () => {
    let calls = 0;
    setup(body => {
      if (++calls === 1) return events([1], false);
      expect(body.categoryIds).toEqual([2, 3, 4]);
      return events([2, 3, 4]);
    });
    await startGeneration();
    await screen.findByText("Generierter Artikel 1");
    await screen.findByText(/Fertig: 1 von 4/);
    fireEvent.click(screen.getByRole("button", { name: /Fehlende Artikel erneut versuchen/ }));
    for (const id of [1, 2, 3, 4]) await screen.findByText(`Generierter Artikel ${id}`);
    await waitFor(() => expect(screen.queryByText("Die Generierung war nicht vollständig.")).toBeNull());
  });

  it("akzeptiert auch mit Abschlussbestätigung nicht nur einen von vier Artikeln", async () => {
    setup(() => events([1]));
    await startGeneration();
    await screen.findByText(/Fertig: 1 von 4/);
    expect(screen.getByRole("button", { name: /Fehlende Artikel erneut versuchen/ })).toBeTruthy();
  });
});
