import { drizzle } from "drizzle-orm/postgres-js";
import { drizzle as drizzleSQLite } from "drizzle-orm/better-sqlite3";
import postgres from "postgres";
import Database from "better-sqlite3";
import * as schema from "../shared/schema";
import * as schemaSqlite from "../shared/schema-sqlite";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

// Use SQLite for development if no DATABASE_URL is set
const DATABASE_URL = process.env.DATABASE_URL;
const SQLITE_PATH = process.env.SQLITE_PATH || "./data/neurolint.db";

let db: any;
let isPostgres = false;

if (DATABASE_URL) {
  // PostgreSQL connection
  console.log("🗄️  Connecting to PostgreSQL database");
  const client = postgres(DATABASE_URL);
  db = drizzle(client, { schema });
  isPostgres = true;
} else {
  // SQLite connection for local development
  console.log("🗄️  Using local SQLite database");

  // Ensure data directory exists
  const dataDir = join(process.cwd(), "data");
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  const sqlite = new Database(SQLITE_PATH);

  // Enable foreign keys
  sqlite.pragma("foreign_keys = ON");

  db = drizzleSQLite(sqlite, { schema: schemaSqlite });

  // Create tables if they don't exist
  (async () => {
    await initializeTables(sqlite);
  })();
}

async function createSampleData(sqlite: Database.Database) {
  try {
    // Check if sample data already exists
    const existingUsers = sqlite
      .prepare("SELECT COUNT(*) as count FROM users")
      .get() as { count: number };

    if (existingUsers.count === 0) {
      console.log("🔧 Creating sample data...");

      // Note: Sample user creation removed - authentication now handled by Supabase
      const userId = "sample-user-123";
      const now = Math.floor(Date.now() / 1000);

      // Create sample team
      const teamId = "sample-team-123";
      sqlite
        .prepare(
          `
        INSERT INTO teams (id, name, description, owner_id, plan_type, monthly_limit, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        )
        .run(
          teamId,
          "Sample Team",
          "A sample team for testing",
          userId,
          "team",
          1000,
          now,
          now,
        );

      // Add user to team
      const memberId = "sample-member-123";
      sqlite
        .prepare(
          `
        INSERT INTO team_members (id, team_id, user_id, role, joined_at)
        VALUES (?, ?, ?, ?, ?)
      `,
        )
        .run(memberId, teamId, userId, "owner", now);

      // Create sample project
      const projectId = "sample-project-123";
      sqlite
        .prepare(
          `
        INSERT INTO team_projects (id, team_id, name, repository, health_score, total_issues, fixed_issues, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        )
        .run(
          projectId,
          teamId,
          "Sample Project",
          "https://github.com/example/repo",
          85,
          10,
          8,
          now,
          now,
        );

      console.log("✅ Sample data created successfully");
      console.log("   📧 Authentication: Sign up with Supabase");
    }
  } catch (error) {
    console.error("❌ Error creating sample data:", error);
  }
}

async function initializeTables(sqlite: Database.Database) {
  try {
    // Drop and recreate users table with password field
    sqlite.exec(`DROP TABLE IF EXISTS users;`);
    sqlite.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        clerk_id TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        password_hash TEXT NOT NULL,
        plan_type TEXT DEFAULT 'free',
        monthly_transformations_used INTEGER DEFAULT 0,
        monthly_limit INTEGER DEFAULT 25,
        created_at INTEGER,
        updated_at INTEGER
      );
    `);

    // Create transformations table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS transformations (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        file_name TEXT,
        original_code_length INTEGER,
        transformed_code_length INTEGER,
        layers_used TEXT,
        changes_count INTEGER DEFAULT 0,
        execution_time_ms INTEGER,
        success INTEGER DEFAULT 1,
        error_message TEXT,
        is_guest INTEGER DEFAULT 0,
        guest_session_id TEXT,
        created_at INTEGER
      );
    `);

    // Create usage_analytics table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS usage_analytics (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        date INTEGER,
        transformations_count INTEGER DEFAULT 0,
        total_execution_time_ms INTEGER DEFAULT 0
      );
    `);

    // Create payments table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        paypal_payment_id TEXT UNIQUE NOT NULL,
        amount_cents INTEGER NOT NULL,
        currency TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'pending',
        payment_type TEXT DEFAULT 'subscription',
        description TEXT,
        created_at INTEGER,
        updated_at INTEGER
      );
    `);

    // Create teams table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        owner_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        plan_type TEXT DEFAULT 'team',
        monthly_limit INTEGER DEFAULT 1000,
        created_at INTEGER,
        updated_at INTEGER
      );
    `);

    // Create team_members table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'developer',
        joined_at INTEGER
      );
    `);

    // Create team_projects table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS team_projects (
        id TEXT PRIMARY KEY,
        team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        repository TEXT,
        health_score INTEGER DEFAULT 0,
        total_issues INTEGER DEFAULT 0,
        fixed_issues INTEGER DEFAULT 0,
        last_scan INTEGER,
        created_at INTEGER,
        updated_at INTEGER
      );
    `);

    // Create team_activities table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS team_activities (
        id TEXT PRIMARY KEY,
        team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        action TEXT NOT NULL,
        project TEXT,
        details TEXT,
        type TEXT DEFAULT 'scan',
        created_at INTEGER
      );
    `);

    console.log("✅ SQLite database tables initialized");

    // Create sample data for testing
    await createSampleData(sqlite);
  } catch (error) {
    console.error("❌ Error initializing SQLite tables:", error);
  }
}

export { db, isPostgres };
