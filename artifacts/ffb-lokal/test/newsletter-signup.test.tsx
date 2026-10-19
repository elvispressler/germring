import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomeNewsletterBox } from "../src/pages/Home";
import { Newsletter } from "../src/pages/Newsletter";
import { NewsletterConfirm } from "../src/pages/NewsletterConfirm";

vi.mock("../src/components/newsletter/NewsletterArchive", () => ({
  NewsletterArchive: () => null,
}));

const neutralMessage =
  "Wenn eine Anmeldung möglich ist, erhältst du in Kürze eine E-Mail mit weiteren Informationen. Bitte prüfe auch deinen Spam-Ordner.";
const emailAddress = "leserin@example.de";
const analyticsTrack = vi.fn();

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

const signupForms = [
  ["Startseite", HomeNewsletterBox],
  ["Newsletter-Seite", Newsletter],
] as const;

describe.each(signupForms)("%s Newsletter-Anmeldung", (_name, Form) => {
  const location = _name === "Startseite" ? "home" : "newsletter";

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    analyticsTrack.mockClear();
    Object.defineProperty(window, "umami", {
      configurable: true,
      value: { track: analyticsTrack },
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(window, "umami");
  });

  it("zeigt nach der Anmeldung den neutralen Hinweis und erlaubt genau eine erneute Anforderung", async () => {
    const fetchMock = vi.mocked(fetch);
    const resendResponse = deferred<Response>();
    fetchMock
      .mockResolvedValueOnce({ status: 202 } as Response)
      .mockImplementationOnce(() => resendResponse.promise);

    render(<Form />);

    fireEvent.change(screen.getByPlaceholderText("Deine E-Mail-Adresse"), {
      target: { value: emailAddress },
    });
    fireEvent.click(screen.getByRole("button", { name: "Abonnieren" }));

    expect(await screen.findByText(neutralMessage)).toBeTruthy();
    await waitFor(() => {
      expect(analyticsTrack).toHaveBeenCalledWith("newsletter_signup_outcome", {
        location,
        outcome: "accepted",
      });
    });
    expect(document.body.textContent).not.toMatch(
      /(?:bereits|schon) angemeldet|adresse.*(?:nicht gefunden|existiert bereits)/i,
    );
    expect(screen.queryByText(emailAddress)).toBeNull();

    const resendButton = screen.getByRole("button", {
      name: "Keine E-Mail erhalten? Erneut anfordern",
    }) as HTMLButtonElement;
    fireEvent.click(resendButton);

    expect(resendButton.disabled).toBe(true);
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailAddress,
        ...(location === "home" ? { location: "home" } : { location: "newsletter" }),
      }),
    });
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/newsletter/resend-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailAddress }),
    });

    fireEvent.click(resendButton);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      resendResponse.resolve({ status: 202 } as Response);
      await resendResponse.promise;
    });

    await waitFor(() => expect(resendButton.disabled).toBe(false));
    expect(screen.getByText(neutralMessage)).toBeTruthy();
    expect(analyticsTrack).toHaveBeenCalledWith("newsletter_resend_outcome", {
      location,
      outcome: "accepted",
    });
    expect(document.body.textContent).not.toMatch(
      /(?:bereits|schon) angemeldet|adresse.*(?:nicht gefunden|existiert bereits)/i,
    );
  });

  it("erfasst fehlgeschlagene Anfragen nur mit festen Ergebniswerten", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce({
        status: 500,
        json: async () => ({ error: emailAddress }),
      } as Response)
      .mockResolvedValueOnce({ status: 202 } as Response)
      .mockResolvedValueOnce({ status: 503 } as Response);

    render(<Form />);
    fireEvent.change(screen.getByPlaceholderText("Deine E-Mail-Adresse"), {
      target: { value: emailAddress },
    });
    fireEvent.click(screen.getByRole("button", { name: "Abonnieren" }));
    await screen.findByText(
      _name === "Startseite" ? /Etwas ist schiefgelaufen/ : emailAddress,
    );
    await waitFor(() => {
      expect(analyticsTrack).toHaveBeenCalledWith("newsletter_signup_outcome", {
        location,
        outcome: "failed",
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "Abonnieren" }));
    expect(await screen.findByText(neutralMessage)).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Keine E-Mail erhalten? Erneut anfordern",
      }),
    );
    await screen.findByText(
      _name === "Startseite"
        ? /Etwas ist schiefgelaufen/
        : /Anfrage konnte nicht abgeschlossen werden/,
    );

    expect(analyticsTrack.mock.calls).toEqual([
      ["newsletter_signup_outcome", { location, outcome: "failed" }],
      ["newsletter_signup_outcome", { location, outcome: "accepted" }],
      ["newsletter_resend_outcome", { location, outcome: "failed" }],
    ]);
    expect(JSON.stringify(analyticsTrack.mock.calls)).not.toContain(emailAddress);
  });
});

describe("Newsletter-Bestätigung", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    analyticsTrack.mockClear();
    Object.defineProperty(window, "umami", {
      configurable: true,
      value: { track: analyticsTrack },
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(window, "umami");
    window.history.replaceState({}, "", "/");
    Reflect.deleteProperty(window, "__newsletterConfirmToken");
  });

  it("entfernt den Token aus der URL und zählt nur eine erfolgreiche Bestätigung", async () => {
    const token = "private-confirm-token";
    const email = "private@example.de";
    window.history.replaceState({}, "", `/newsletter/confirm?token=${token}`);
    const fetchMock = vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ location: "home", token, email }),
    } as Response);

    render(<NewsletterConfirm />);

    expect(await screen.findByText("Du bist dabei!")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/newsletter/confirm?token=${encodeURIComponent(token)}`,
    );
    expect(window.location.href).not.toContain(token);
    expect(analyticsTrack).toHaveBeenCalledExactlyOnceWith(
      "newsletter_confirmation_completed",
      { location: "home" },
    );
    expect(JSON.stringify(analyticsTrack.mock.calls)).not.toContain(token);
    expect(JSON.stringify(analyticsTrack.mock.calls)).not.toContain(email);
  });

  it("zählt keine ungültigen Bestätigungslinks als Abschluss", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);

    render(<NewsletterConfirm />);

    expect(await screen.findByText("Link ungültig")).toBeTruthy();
    expect(analyticsTrack).not.toHaveBeenCalled();
  });
});