import { pgTable, text, integer, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

export const filesTable = pgTable("files", {
  id: serial("id").primaryKey(),
  fileId: text("file_id").notNull().unique(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  name: text("name").notNull(),
  size: integer("size").notNull(),
  type: text("type").notNull(),
  objectPath: text("object_path").notNull(),
  status: text("status").notNull().default("pending"),
  description: text("description").notNull().default(""),
  tags: text("tags").array().notNull().default([]),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertFileSchema = createInsertSchema(filesTable).omit({ id: true, uploadedAt: true, updatedAt: true });
export type InsertFile = z.infer<typeof insertFileSchema>;
export type FileRecord = typeof filesTable.$inferSelect;
