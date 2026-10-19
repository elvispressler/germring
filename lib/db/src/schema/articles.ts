import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories.ts";

export const articleSourceSchema = z.object({
  label: z.string(),
  url: z.string().nullish(),
});
export type ArticleSource = z.infer<typeof articleSourceSchema>;

export const articlesTable = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id),
  author: text("author").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  imageUrl: text("image_url"),
  imageSourceUrl: text("image_source_url"),
  imageSourcePageUrl: text("image_source_page_url"),
  imageLicense: text("image_license"),
  imageCredit: text("image_credit"),
  featured: boolean("featured").notNull().default(false),
  readingMinutes: integer("reading_minutes").notNull().default(3),
  tags: text("tags").array().notNull().default([]),
  sources: jsonb("sources").$type<ArticleSource[]>().notNull().default([]),
});

export const insertArticleSchema = createInsertSchema(articlesTable, {
  tags: z.array(z.string()).optional().default([]),
}).omit({ id: true });
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articlesTable.$inferSelect;
