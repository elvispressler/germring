import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const adminAuthTable = pgTable("admin_auth", {
  id: text("id").primaryKey(),
  passwordHash: text("password_hash"),
  resetTokenHash: text("reset_token_hash"),
  resetExpiresAt: timestamp("reset_expires_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});