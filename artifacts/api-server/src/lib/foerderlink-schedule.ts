export const DEFAULT_FOERDERLINK_CHECK_INTERVAL_HOURS = 7 * 24;
export const FOERDERLINK_CHECK_INITIAL_DELAY_MS = 30_000;

export function getFoerderlinkCheckIntervalHours(): number {
  const configured = Number(process.env.FOERDERLINK_CHECK_INTERVAL_HOURS);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_FOERDERLINK_CHECK_INTERVAL_HOURS;
}

export function getFoerderlinkCheckIntervalMs(): number {
  return getFoerderlinkCheckIntervalHours() * 60 * 60 * 1000;
}