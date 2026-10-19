type AnalyticsData = Record<string, string | number | boolean>;
export type NewsletterLocation = "home" | "newsletter";
export type NewsletterConfirmationLocation = NewsletterLocation | "unknown";
type NewsletterOutcome = "accepted" | "failed";

declare global {
  interface Window {
    umami?: {
      track(name: string, data?: AnalyticsData): void;
    };
    __newsletterConfirmToken?: string;
  }
}

export function trackEvent(name: string, data?: AnalyticsData): void {
  if (typeof window === "undefined") return;

  try {
    if (data === undefined) {
      window.umami?.track(name);
    } else {
      window.umami?.track(name, data);
    }
  } catch {
    // Analytics must never break the app.
  }
}

export function trackNewsletterSignupOutcome(
  location: NewsletterLocation,
  outcome: NewsletterOutcome,
): void {
  trackEvent("newsletter_signup_outcome", { location, outcome });
}

export function trackNewsletterResendOutcome(
  location: NewsletterLocation,
  outcome: NewsletterOutcome,
): void {
  trackEvent("newsletter_resend_outcome", { location, outcome });
}

export function trackNewsletterConfirmationCompleted(
  location: NewsletterConfirmationLocation,
): void {
  trackEvent("newsletter_confirmation_completed", { location });
}