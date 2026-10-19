import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories.ts";

export const sponsorsTable = pgTable("sponsors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  website: text("website"),
  tagline: text("tagline"),
  ctaLabel: text("cta_label").notNull().default("Mehr erfahren"),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  active: boolean("active").notNull().default(true),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull().defaultNow(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
});

export const insertSponsorSchema = createInsertSchema(sponsorsTable).omit({ id: true });
export type InsertSponsor = z.infer<typeof insertSponsorSchema>;
export type Sponsor = typeof sponsorsTable.$inferSelect;
