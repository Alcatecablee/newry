import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  uuid,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  supabaseId: text("supabase_id").unique().notNull(),
  email: text("email").unique().notNull(),
  fullName: text("full_name"),
  planType: text("plan_type").default("free"),
  monthlyTransformationsUsed: integer("monthly_transformations_used").default(
    0,
  ),
  monthlyLimit: integer("monthly_limit").default(10),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transformations = pgTable("transformations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  fileName: text("file_name"),
  originalCodeLength: integer("original_code_length"),
  transformedCodeLength: integer("transformed_code_length"),
  layersUsed: integer("layers_used").array(),
  changesCount: integer("changes_count").default(0),
  executionTimeMs: integer("execution_time_ms"),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  isGuest: boolean("is_guest").default(false),
  guestSessionId: text("guest_session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usageAnalytics = pgTable("usage_analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").defaultNow().notNull(),
  transformationsCount: integer("transformations_count").default(0),
  totalExecutionTimeMs: integer("total_execution_time_ms").default(0),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  paypalPaymentId: text("paypal_payment_id").unique().notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").default("USD"),
  status: text("status").default("pending"),
  paymentType: text("payment_type").default("subscription"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "cascade" }),
  planType: text("plan_type").default("team"),
  monthlyLimit: integer("monthly_limit").default(1000),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  role: text("role").default("developer"), // owner, admin, developer, auditor
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const teamProjects = pgTable("team_projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  repository: text("repository"),
  healthScore: integer("health_score").default(0),
  totalIssues: integer("total_issues").default(0),
  fixedIssues: integer("fixed_issues").default(0),
  lastScan: timestamp("last_scan"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teamActivities = pgTable("team_activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  project: text("project"),
  details: jsonb("details"),
  type: text("type").default("scan"), // fix, scan, config, error
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
