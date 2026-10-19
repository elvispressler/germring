import { pgTable, text, serial, boolean, timestamp, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const newsletterSubscribersTable = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).notNull().defaultNow(),
  confirmed: boolean("confirmed").notNull().default(false),
  confirmToken: text("confirm_token"),
  signupLocation: text("signup_location").$type<NewsletterSignupLocation>(),
});

export type NewsletterSignupLocation = "home" | "newsletter";

export const newsletterIssuesTable = pgTable("newsletter_issues", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default("sending"),
  sentCount: integer("sent_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const newsletterSignupLimitsTable = pgTable("newsletter_signup_limits", {
  clientKey: text("client_key").primaryKey(),
  count: integer("request_count").notNull(),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
}, table => [
  index("newsletter_signup_limits_reset_at_idx").on(table.resetAt),
]);

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribersTable).omit({ id: true });
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribersTable.$inferSelect;
export type NewsletterIssue = typeof newsletterIssuesTable.$inferSelect;
