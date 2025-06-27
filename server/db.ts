import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";

// Use SQLite for development if no DATABASE_URL is set
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn("No DATABASE_URL found, using in-memory storage for teams functionality");
}

let db: any;

if (DATABASE_URL) {
  const client = postgres(DATABASE_URL);
  db = drizzle(client, { schema });
} else {
  // Use in-memory mock for development
  db = null;
}

export { db };