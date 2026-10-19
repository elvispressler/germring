import { getFundingLinkCheckItems } from "@workspace/foerderlink-sources";
import { logger } from "./logger.js";
import { sendFundingLinkAlertEmail } from "./resend.js";
import {
  FOERDERLINK_CHECK_INITIAL_DELAY_MS,
  getFoerderlinkCheckIntervalHours,
  getFoerderlinkCheckIntervalMs,
} from "./foerderlink-schedule.js";
import { runFundingLinkCheck } from "../routes/foerderlinks.js";

let schedulerStarted = false;
let checkInProgress = false;

function siteUrl(): string {
  const configured = process.env.FOERDERLINK_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const domain = process.env.REPLIT_DOMAINS?.split(",")[0]?.trim();
  return domain ? `https://${domain}` : "https://germring.de";
}

async function runScheduledFundingLinkCheck(): Promise<void> {
  if (checkInProgress) {
    logger.warn("Scheduled funding link check skipped because one is in progress");
    return;
  }

  checkInProgress = true;
  try {
    const run = await runFundingLinkCheck(
      getFundingLinkCheckItems(siteUrl(), "/"),
    );
    const alerts = run.results.filter(
      (result) =>
        Boolean(result.error) ||
        result.redirectWarning ||
        result.changedSinceLastCheck,
    );

    if (alerts.length > 0) {
      try {
        await sendFundingLinkAlertEmail(alerts, run.checkedAt);
      } catch (error) {
        logger.error(
          { err: error, alertCount: alerts.length },
          "Funding link alert email failed",
        );
      }
    }

    logger.info(
      {
        total: run.total,
        errors: run.summary.errors,
        redirects: run.summary.redirects,
        changed: run.summary.changed,
        alerts: alerts.length,
      },
      "Scheduled funding link check completed",
    );
  } catch (error) {
    logger.error({ err: error }, "Scheduled funding link check failed");
  } finally {
    checkInProgress = false;
  }
}

/**
 * Runs once shortly after server startup and then on a fixed weekly interval
 * by default. The interval can be changed with
 * FOERDERLINK_CHECK_INTERVAL_HOURS; FOERDERLINK_SITE_URL controls the
 * canonical URL used for relative sources.
 */
export function startFoerderlinkScheduler(): void {
  if (schedulerStarted) return;
  schedulerStarted = true;

  const intervalHours = getFoerderlinkCheckIntervalHours();
  const interval = setInterval(() => {
    void runScheduledFundingLinkCheck();
  }, getFoerderlinkCheckIntervalMs());
  interval.unref?.();

  const initialRun = setTimeout(() => {
    void runScheduledFundingLinkCheck();
  }, FOERDERLINK_CHECK_INITIAL_DELAY_MS);
  initialRun.unref?.();

  logger.info(
    { intervalHours, initialDelayMs: FOERDERLINK_CHECK_INITIAL_DELAY_MS },
    "Funding link scheduler started",
  );
}