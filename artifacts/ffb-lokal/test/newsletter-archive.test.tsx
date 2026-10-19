import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NewsletterArchive } from "../src/components/newsletter/NewsletterArchive";

function makeResponse(data: unknown, ok = true) {
  return {
    ok,
    json: async () => data,
  } as Response;
}

function makeIssue(id: number, subject: string) {
  return {
    id,
    subject,
    content: `Inhalt der Ausgabe ${id}.`,
    sentAt: null,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe("Newsletter-Archiv", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("lädt das Archiv nach einem anfänglichen Fehler erneut und verwendet den neuen Folgeseiten-Cursor", async () => {
    const fetchMock = vi.mocked(fetch);
    const cursor = "retry/cursor ?";
    fetchMock
      .mockRejectedValueOnce(new Error("Netzwerkfehler"))
      .mockResolvedValueOnce(makeResponse({
        issues: [makeIssue(1, "Erneut geladene Ausgabe")],
        nextCursor: cursor,
      }))
      .mockResolvedValueOnce(makeResponse({
        issues: [makeIssue(2, "Nachgeladene Ausgabe")],
        nextCursor: null,
      }));

    render(<NewsletterArchive />);

    fireEvent.click(await screen.findByRole("button", { name: "Erneut versuchen" }));

    await screen.findByText("Erneut geladene Ausgabe");
    fireEvent.click(await screen.findByRole("button", { name: "Weitere Ausgaben laden" }));

    await screen.findByText("Nachgeladene Ausgabe");
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/newsletter/archive");
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      `/api/newsletter/archive?cursor=${encodeURIComponent(cursor)}`,
    );
  });

  it("erlaubt einen weiteren Versuch, wenn auch der erneute Abruf fehlschlägt", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockRejectedValueOnce(new Error("Erster Netzwerkausfall"))
      .mockResolvedValueOnce(makeResponse({ issues: [], nextCursor: null }, false))
      .mockResolvedValueOnce(makeResponse({
        issues: [makeIssue(1, "Ausgabe nach erneutem Versuch")],
        nextCursor: null,
      }));

    render(<NewsletterArchive />);

    fireEvent.click(await screen.findByRole("button", { name: "Erneut versuchen" }));
    fireEvent.click(await screen.findByRole("button", { name: "Erneut versuchen" }));

    await screen.findByText("Ausgabe nach erneutem Versuch");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("zeigt bei einer ungültigen Ausgabe einen verständlichen Fehler statt abzustürzen", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(makeResponse({
      issues: [{
        ...makeIssue(1, "Beschädigte Ausgabe"),
        sentAt: "kein gültiges Versanddatum",
      }],
      nextCursor: null,
    }));

    render(<NewsletterArchive />);

    const error = await screen.findByRole("status");
    expect(error.textContent).toContain(
      "Die Archivdaten konnten nicht geladen werden. Bitte versuche es erneut.",
    );
    expect(screen.getByRole("button", { name: "Erneut versuchen" })).toBeTruthy();
    expect(screen.queryByText("Beschädigte Ausgabe")).toBeNull();
  });

  it("weist ungültige Seitendaten zurück", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(makeResponse({
      issues: [],
      nextCursor: 42,
    }));

    render(<NewsletterArchive />);

    const error = await screen.findByRole("status");
    expect(error.textContent).toContain("Die Archivdaten konnten nicht geladen werden.");
    expect(screen.getByRole("button", { name: "Erneut versuchen" })).toBeTruthy();
  });

  it("lädt die nächste Seite mit dem aktuellen Cursor und hängt ihre Ausgaben an", async () => {
    const fetchMock = vi.mocked(fetch);
    const cursor = "cursor/2 ?";
    fetchMock
      .mockResolvedValueOnce(makeResponse({
        issues: [makeIssue(1, "Erste Ausgabe")],
        nextCursor: cursor,
      }))
      .mockResolvedValueOnce(makeResponse({
        issues: [makeIssue(2, "Zweite Ausgabe")],
        nextCursor: "cursor-3",
      }));

    render(<NewsletterArchive />);

    await screen.findByText("Erste Ausgabe");
    fireEvent.click(screen.getByRole("button", { name: "Weitere Ausgaben laden" }));

    await screen.findByText("Zweite Ausgabe");
    expect(screen.getByText("Erste Ausgabe")).toBeTruthy();
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `/api/newsletter/archive?cursor=${encodeURIComponent(cursor)}`,
    );
  });

  it("startet bei schnellen Klicks dieselbe Folgeseite nur einmal und lädt danach weiter", async () => {
    const fetchMock = vi.mocked(fetch);
    const cursor = "cursor-2";
    const followingCursor = "cursor-3";
    const pendingPage = deferred<Response>();
    let loadMoreButton: HTMLButtonElement;
    fetchMock
      .mockResolvedValueOnce(makeResponse({
        issues: [makeIssue(1, "Erste Ausgabe")],
        nextCursor: cursor,
      }))
      .mockImplementationOnce(() => {
        fireEvent.click(loadMoreButton);
        fireEvent.click(loadMoreButton);
        return pendingPage.promise;
      })
      .mockResolvedValueOnce(makeResponse({
        issues: [makeIssue(3, "Dritte Ausgabe")],
        nextCursor: null,
      }));

    render(<NewsletterArchive />);

    await screen.findByText("Erste Ausgabe");
    loadMoreButton = screen.getByTestId("button-load-more-newsletters") as HTMLButtonElement;
    fireEvent.click(loadMoreButton);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `/api/newsletter/archive?cursor=${encodeURIComponent(cursor)}`,
    );
    expect((loadMoreButton as HTMLButtonElement).disabled).toBe(true);

    await act(async () => {
      pendingPage.resolve(makeResponse({
        issues: [makeIssue(2, "Zweite Ausgabe")],
        nextCursor: followingCursor,
      }));
      await pendingPage.promise;
    });

    await screen.findByText("Zweite Ausgabe");
    const nextButton = await screen.findByRole("button", { name: "Weitere Ausgaben laden" });
    fireEvent.click(nextButton);

    await screen.findByText("Dritte Ausgabe");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      `/api/newsletter/archive?cursor=${encodeURIComponent(followingCursor)}`,
    );
  });

  it("entfernt den Button, wenn die API keinen weiteren Cursor zurückgibt", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(makeResponse({
        issues: [makeIssue(1, "Erste Ausgabe")],
        nextCursor: "cursor-2",
      }))
      .mockResolvedValueOnce(makeResponse({
        issues: [makeIssue(2, "Letzte Ausgabe")],
        nextCursor: null,
      }));

    render(<NewsletterArchive />);

    await screen.findByText("Erste Ausgabe");
    fireEvent.click(screen.getByRole("button", { name: "Weitere Ausgaben laden" }));

    await screen.findByText("Letzte Ausgabe");
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Weitere Ausgaben laden" })).toBeNull();
    });
  });

  it("behält sichtbare Ausgaben nach einer ungültigen Folgeseite und ermöglicht den erneuten Versuch", async () => {
    const fetchMock = vi.mocked(fetch);
    const cursor = "cursor-2";
    fetchMock
      .mockResolvedValueOnce(makeResponse({
        issues: [makeIssue(1, "Erste Ausgabe")],
        nextCursor: cursor,
      }))
      .mockResolvedValueOnce(makeResponse({
        issues: [{ ...makeIssue(2, "Beschädigte Ausgabe"), sentAt: "kein Datum" }],
        nextCursor: "cursor-3",
      }))
      .mockResolvedValueOnce(makeResponse({
        issues: [makeIssue(2, "Nachgeladene Ausgabe")],
        nextCursor: null,
      }));

    render(<NewsletterArchive />);

    await screen.findByText("Erste Ausgabe");
    fireEvent.click(screen.getByRole("button", { name: "Weitere Ausgaben laden" }));

    const retryButton = await screen.findByRole("button", { name: "Erneut versuchen" });
    expect(screen.getByText("Erste Ausgabe")).toBeTruthy();
    expect(screen.queryByText("Beschädigte Ausgabe")).toBeNull();
    expect(screen.queryByText("Nachgeladene Ausgabe")).toBeNull();

    fireEvent.click(retryButton);

    await screen.findByText("Nachgeladene Ausgabe");
    expect(screen.getByText("Erste Ausgabe")).toBeTruthy();
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `/api/newsletter/archive?cursor=${encodeURIComponent(cursor)}`,
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      `/api/newsletter/archive?cursor=${encodeURIComponent(cursor)}`,
    );
  });
});