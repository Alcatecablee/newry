import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").unique().notNull(),
  fullName: text("full_name"),
  passwordHash: text("password_hash").notNull(),
  planType: text("plan_type").default("free"),
  monthlyTransformationsUsed: integer("monthly_transformations_used").default(
    0,
  ),
  monthlyLimit: integer("monthly_limit").default(25),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const transformations = sqliteTable("transformations", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  fileName: text("file_name"),
  originalCodeLength: integer("original_code_length"),
  transformedCodeLength: integer("transformed_code_length"),
  layersUsed: text("layers_used"), // JSON string for SQLite
  changesCount: integer("changes_count").default(0),
  executionTimeMs: integer("execution_time_ms"),
  success: integer("success", { mode: "boolean" }).default(true),
  errorMessage: text("error_message"),
  isGuest: integer("is_guest", { mode: "boolean" }).default(false),
  guestSessionId: text("guest_session_id"),
  createdAt: integer("created_at", { mode: "timestamp" }),
});

export const usageAnalytics = sqliteTable("usage_analytics", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  date: integer("date", { mode: "timestamp" }),
  transformationsCount: integer("transformations_count").default(0),
  totalExecutionTimeMs: integer("total_execution_time_ms").default(0),
});

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  paypalPaymentId: text("paypal_payment_id").unique().notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").default("USD"),
  status: text("status").default("pending"),
  paymentType: text("payment_type").default("subscription"),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const teams = sqliteTable("teams", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: text("owner_id").references(() => users.id, { onDelete: "cascade" }),
  planType: text("plan_type").default("team"),
  monthlyLimit: integer("monthly_limit").default(1000),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const teamMembers = sqliteTable("team_members", {
  id: text("id").primaryKey(),
  teamId: text("team_id").references(() => teams.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  role: text("role").default("developer"), // owner, admin, developer, auditor
  joinedAt: integer("joined_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const teamProjects = sqliteTable("team_projects", {
  id: text("id").primaryKey(),
  teamId: text("team_id").references(() => teams.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  repository: text("repository"),
  healthScore: integer("health_score").default(0),
  totalIssues: integer("total_issues").default(0),
  fixedIssues: integer("fixed_issues").default(0),
  lastScan: integer("last_scan", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const teamActivities = sqliteTable("team_activities", {
  id: text("id").primaryKey(),
  teamId: text("team_id").references(() => teams.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  project: text("project"),
  details: text("details"), // JSON string for SQLite
  type: text("type").default("scan"), // fix, scan, config, error
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export const insertUserSchema = createInsertSchema(users).pick({
  clerkId: true,
  email: true,
  fullName: true,
});

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
  description: true,
  ownerId: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).pick({
  teamId: true,
  userId: true,
  role: true,
});

export const insertTeamProjectSchema = createInsertSchema(teamProjects).pick({
  teamId: true,
  name: true,
  repository: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type InsertTeamProject = z.infer<typeof insertTeamProjectSchema>;

export type User = typeof users.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type TeamProject = typeof teamProjects.$inferSelect;
export type TeamActivity = typeof teamActivities.$inferSelect;
export type Transformation = typeof transformations.$inferSelect;
export type UsageAnalytic = typeof usageAnalytics.$inferSelect;
export type Payment = typeof payments.$inferSelect;
