import { setExtraHeaders } from "@workspace/api-client-react";

export const ADMIN_AUTH_EXPIRED_EVENT = "admin-auth-expired";
let adminCredential: string | null = null;

export function setAdminCredential(value: string | null): void {
  adminCredential = value;
  setExtraHeaders(value ? { "x-admin-pin": value } : {});
}

export class AdminAuthError extends Error {
  readonly name = "AdminAuthError";

  constructor(message = "Die Admin-Sitzung ist abgelaufen. Bitte erneut anmelden.") {
    super(message);
  }
}

function expireAdminSession(): void {
  setAdminCredential(null);
  window.dispatchEvent(new CustomEvent(ADMIN_AUTH_EXPIRED_EVENT));
}

export async function adminFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const pin = adminCredential;
  if (!pin) {
    expireAdminSession();
    throw new AdminAuthError();
  }

  const headers = new Headers(init.headers);
  headers.set("x-admin-pin", pin);

  const response = await fetch(input, { ...init, headers });
  if (response.status === 401) {
    expireAdminSession();
    throw new AdminAuthError();
  }

  return response;
}

export async function readApiError(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = await response.clone().json() as { error?: unknown; message?: unknown };
    if (typeof data.error === "string" && data.error.trim()) return data.error;
    if (typeof data.message === "string" && data.message.trim()) return data.message;
  } catch {
    try {
      const text = await response.text();
      if (text.trim()) return text.trim();
    } catch {
      // Ignore parse errors and use the safe fallback.
    }
  }
  return fallback;
}