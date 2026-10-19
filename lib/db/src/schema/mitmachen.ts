import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mitmachenIdeenTable = pgTable("mitmachen_ideen", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // energie | kommunal | praxis | zahlen | sonstiges
  message: text("message").notNull(),
  authorName: text("author_name"),      // optional — null = anonym
  authorEmail: text("author_email").notNull(), // privat, nie öffentlich
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("pending"), // pending | approved | rejected
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewNote: text("review_note"),
});

export const insertMitmachenIdeeSchema = createInsertSchema(mitmachenIdeenTable).omit({ id: true, createdAt: true });
export type InsertMitmachenIdee = z.infer<typeof insertMitmachenIdeeSchema>;
export type MitmachenIdee = typeof mitmachenIdeenTable.$inferSelect;
