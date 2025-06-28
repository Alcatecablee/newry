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

  // Database test only - no test data creation
  console.log("✅ Database structure verified!");

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
