import { useState, useEffect, type ReactNode } from "react";
import {
  ADMIN_AUTH_EXPIRED_EVENT,
  setAdminCredential,
} from "@/lib/adminFetch";
import { LogoLoader } from "@/components/ui/LogoLoader";

const VERIFY_URL = "/api/admin/verify";

interface AdminGateProps {
  children: ReactNode;
}

export function AdminGate({ children }: AdminGateProps) {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const resetToken = new URLSearchParams(window.location.search).get("reset");

  useEffect(() => setLoading(false), []);

  useEffect(() => {
    const handleExpired = () => {
      setAuthed(false);
      setPin("");
      setShowPassword(false);
      setError("Deine Admin-Sitzung ist abgelaufen. Bitte erneut anmelden.");
    };
    window.addEventListener(ADMIN_AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(ADMIN_AUTH_EXPIRED_EVENT, handleExpired);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedPin = pin.trim();
    if (!normalizedPin) {
      setError("Bitte eine PIN eingeben.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: normalizedPin }),
      });
      if (res.ok) {
        setAdminCredential(normalizedPin);
        setAuthed(true);
      } else {
        const data = await res.json().catch(() => null) as { error?: string } | null;
        setError(data?.error ?? "PIN konnte nicht geprüft werden. Bitte erneut versuchen.");
        setPin("");
      }
    } catch {
      setError("Verbindungsfehler. Bitte Seite neu laden.");
    } finally {
      setSubmitting(false);
    }
  }

  async function requestReset() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/password-reset/request", { method: "POST" });
      const data = await res.json() as { message?: string };
      if (!res.ok) throw new Error();
      setResetRequested(true);
      setError(data.message ?? "Falls eine Admin-Adresse hinterlegt ist, wurde ein Link versendet.");
    } catch {
      setError("Der Reset-Link konnte gerade nicht angefordert werden.");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmReset(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, password: newPassword }),
      });
      const data = await res.json().catch(() => null) as { error?: string } | null;
      if (!res.ok) {
        setError(data?.error ?? "Das Passwort konnte nicht geändert werden.");
        return;
      }
      window.history.replaceState({}, "", "/admin");
      setNewPassword("");
      setError("Das Passwort wurde geändert. Du kannst dich jetzt anmelden.");
    } catch {
      setError("Verbindungsfehler. Bitte erneut versuchen.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LogoLoader className="min-h-[60vh]" label="Admin-Bereich wird geladen" />;
  }

  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/20">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border bg-card shadow-sm p-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">g</span>
            </div>
            <div>
              <p className="font-bold text-sm leading-none">germring.de</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Redaktions-Zugang</p>
            </div>
          </div>

          <h1 className="text-xl font-serif font-bold mb-1">
            {resetToken ? "Neues Passwort festlegen" : "Admin-Bereich"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {resetToken ? "Wähle ein sicheres Passwort mit mindestens 10 Zeichen." : "Bitte Passwort eingeben, um fortzufahren."}
          </p>

          <form
            onSubmit={resetToken ? confirmReset : handleSubmit}
            autoComplete="off"
            className="space-y-4"
          >
            <div>
              <label htmlFor="pin" className="block text-sm font-medium mb-1.5">
                {resetToken ? "Neues Passwort" : "Passwort"}
              </label>
              <div className="relative">
                <input
                  id="pin"
                  name={resetToken ? "new-admin-password" : "germring-admin-access"}
                  type={resetToken || !showPassword ? "password" : "text"}
                  autoComplete="new-password"
                  value={resetToken ? newPassword : pin}
                  onChange={(e) => resetToken ? setNewPassword(e.target.value) : setPin(e.target.value)}
                  placeholder={resetToken ? "Mindestens 10 Zeichen" : ""}
                  className="w-full rounded-lg border bg-background px-3.5 py-2.5 pr-20 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
                {!resetToken && (
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Passwort verbergen" : "Passwort im Klartext anzeigen"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-3 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
                  >
                    {showPassword ? "Verbergen" : "Anzeigen"}
                  </button>
                )}
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || (resetToken ? newPassword.length < 10 : !pin)}
              className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Bitte warten …" : resetToken ? "Passwort speichern" : "Anmelden"}
            </button>
          </form>
          {!resetToken && (
            <button
              type="button"
              onClick={requestReset}
              disabled={submitting || resetRequested}
              className="mt-4 w-full text-sm text-primary hover:underline disabled:opacity-50"
            >
              Passwort vergessen?
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
