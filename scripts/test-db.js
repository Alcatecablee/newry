import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../shared/schema-sqlite.js";

const sqlite = new Database("./data/neurolint.db");
const db = drizzle(sqlite, { schema });

console.log("🧪 Testing SQLite database connection...");

try {
  // Test basic query
  const result = db.select().from(schema.users).limit(1).all();
  console.log("✅ Database connection successful!");
  console.log(`📊 Current users count: ${result.length}`);

  // Add a test user if none exist
  if (result.length === 0) {
    console.log("📝 Adding test user...");

    const testUser = {
      id: "test-user-1",
      clerkId: "test-clerk-123",
      email: "test@neurolint.dev",
      fullName: "Test User",
      planType: "free",
      monthlyTransformationsUsed: 0,
      monthlyLimit: 25,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    };

    db.insert(schema.users).values(testUser).run();
    console.log("✅ Test user created!");
  }

  // Test transformation logging
  console.log("📝 Adding test transformation...");
  const testTransformation = {
    id: "test-transform-" + Date.now(),
    userId: result.length > 0 ? result[0].id : "test-user-1",
    fileName: "TestComponent.tsx",
    originalCodeLength: 150,
    transformedCodeLength: 200,
    layersUsed: JSON.stringify([1, 2, 3]),
    changesCount: 5,
    executionTimeMs: 250,
    success: 1,
    isGuest: 0,
    createdAt: Math.floor(Date.now() / 1000),
  };

  db.insert(schema.transformations).values(testTransformation).run();
  console.log("✅ Test transformation logged!");

  // Query all data
  const users = db.select().from(schema.users).all();
  const transformations = db.select().from(schema.transformations).all();

  console.log(`\n📊 Database Summary:`);
  console.log(`   Users: ${users.length}`);
  console.log(`   Transformations: ${transformations.length}`);

  console.log("\n🎉 Database is working correctly!");
} catch (error) {
  console.error("❌ Database test failed:", error);
} finally {
  sqlite.close();
}
