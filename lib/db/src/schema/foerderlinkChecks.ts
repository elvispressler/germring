import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const foerderlinkChecksTable = pgTable("foerderlink_checks", {
  sourceId: text("source_id").primaryKey(),
  programId: text("program_id").notNull(),
  programTitle: text("program_title").notNull(),
  label: text("label").notNull(),
  href: text("href").notNull(),
  lastCheckedAt: timestamp("last_checked_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  status: integer("status"),
  finalUrl: text("final_url"),
  redirectCount: integer("redirect_count").notNull().default(0),
  contentHash: text("content_hash"),
  contentType: text("content_type"),
  contentLength: integer("content_length"),
  pageTitle: text("page_title"),
  visibleText: text("visible_text"),
  contentCheckedAt: timestamp("content_checked_at", { withTimezone: true }),
  previousVisibleText: text("previous_visible_text"),
  previousContentCheckedAt: timestamp("previous_content_checked_at", {
    withTimezone: true,
  }),
  error: text("error"),
});
