import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db, isPostgres } from "./db";

import { cliRoutes } from "./routes/cli";
import { apiDocsRoutes } from "./routes/api-docs";
import teamRoutes from "./routes/teams";
import supabaseTestRoutes from "./routes/supabase-test";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: db ? (isPostgres ? "postgresql" : "sqlite") : "none",
    });
  });

  // Database test endpoint
  app.get("/api/db/test", async (req, res) => {
    try {
      if (!db) {
        return res.status(500).json({
          error: "Database not initialized",
          status: "disconnected",
        });
      }

      // Test database connection with a simple query
      let testResult;
      if (isPostgres) {
        testResult = await db.execute("SELECT 1");
      } else {
        // For SQLite, test by counting users table
        const schema = await import("../shared/schema-sqlite.js");
        testResult = await db.select().from(schema.users).limit(1);
      }

      res.json({
        status: "connected",
        type: isPostgres ? "postgresql" : "sqlite",
        timestamp: new Date().toISOString(),
        test_successful: true,
      });
    } catch (error: any) {
      console.error("Database test failed:", error);
      res.status(500).json({
        error: "Database connection failed",
        message: error.message,
        status: "error",
      });
    }
  });

  // Save environment variables endpoint
  app.post("/api/admin/save-env", async (req, res) => {
    try {
      const { envVars } = req.body;
      const fs = await import("fs");
      const path = await import("path");

      // Read current .env file
      const envPath = path.join(process.cwd(), ".env");
      let envContent = "";

      try {
        envContent = fs.readFileSync(envPath, "utf8");
      } catch (error) {
        // .env file doesn't exist, create new content
        envContent = "";
      }

      // Update or add environment variables
      const envLines = envContent.split("\n");
      const updatedVars = { ...envVars };

      // Update existing variables
      for (let i = 0; i < envLines.length; i++) {
        const line = envLines[i].trim();
        if (line && !line.startsWith("#")) {
          const [key] = line.split("=");
          if (key && updatedVars[key] !== undefined) {
            envLines[i] = `${key}=${updatedVars[key]}`;
            delete updatedVars[key];
          }
        }
      }

      // Add new variables
      Object.entries(updatedVars).forEach(([key, value]) => {
        if (value) {
          envLines.push(`${key}=${value}`);
        }
      });

      // Write back to .env file
      fs.writeFileSync(envPath, envLines.join("\n"));

      res.json({
        success: true,
        message: "Environment variables saved successfully",
        restart_required: true,
      });
    } catch (error: any) {
      console.error("Failed to save env vars:", error);
      res.status(500).json({
        error: "Failed to save environment variables",
        message: error.message,
      });
    }
  });

  // Debug endpoint to check sample data
  app.get("/api/debug/sample-data", async (req, res) => {
    try {
      if (!db) {
        return res.json({ error: "Database not initialized" });
      }

      const schema = await import("../shared/schema-sqlite.js");

      // Get sample user
      const users = await db.select().from(schema.users).limit(5);

      // Get sample teams
      const teams = await db.select().from(schema.teams).limit(5);

      // Get sample team members
      const members = await db.select().from(schema.teamMembers).limit(5);

      res.json({
        users: users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.fullName,
        })),
        teams: teams.map((t) => ({
          id: t.id,
          name: t.name,
          ownerId: t.ownerId,
        })),
        members: members.map((m) => ({
          id: m.id,
          teamId: m.teamId,
          userId: m.userId,
          role: m.role,
        })),
        message:
          "Sample data available. Use test@example.com / password123 to login",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Database info endpoint
  app.get("/api/db/info", async (req, res) => {
    try {
      if (!db) {
        return res.json({
          status: "disconnected",
          type: "none",
          location: "in-memory",
        });
      }

      const dbType = isPostgres ? "postgresql" : "sqlite";
      const location = isPostgres ? "remote" : "./data/neurolint.db";

      // Get table counts
      let stats = {};
      try {
        if (isPostgres) {
          // PostgreSQL stats would go here
          stats = { message: "PostgreSQL connected" };
        } else {
          // SQLite stats
          const schema = await import("../shared/schema-sqlite.js");
          const userCount = await db.select().from(schema.users).all();
          const transformationCount = await db
            .select()
            .from(schema.transformations)
            .all();

          stats = {
            users: userCount.length,
            transformations: transformationCount.length,
            tables_initialized: true,
          };
        }
      } catch (statError) {
        stats = { error: "Could not retrieve stats" };
      }

      res.json({
        status: "connected",
        type: dbType,
        location,
        stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        error: "Database info failed",
        message: error.message,
      });
    }
  });

  // Register team routes
  app.use(teamRoutes);

  // Register Supabase test routes
  app.use(supabaseTestRoutes);

  // Register CLI routes
  app.use(cliRoutes);

  // Register API documentation routes
  app.use(apiDocsRoutes);
  // User management routes
  app.get("/api/user/:supabaseId", async (req, res) => {
    try {
      const user = await storage.getUserBySupabaseId(req.params.supabaseId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const { supabaseId, email, fullName } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserBySupabaseId(supabaseId);
      if (existingUser) {
        return res.json(existingUser);
      }

      const user = await storage.createUser({ supabaseId, email, fullName });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // PayPal subscription route (replacing Supabase Edge Function)
  app.post("/api/create-paypal-subscription", async (req, res) => {
    try {
      const { plan_type, amount, user_id } = req.body;

      const paypalClientId = process.env.PAYPAL_CLIENT_ID;
      const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
      const paypalEnvironment = process.env.PAYPAL_ENVIRONMENT || "sandbox";

      if (!paypalClientId || !paypalClientSecret) {
        return res
          .status(500)
          .json({ error: "PayPal credentials not configured" });
      }

      const paypalBaseUrl =
        paypalEnvironment === "production"
          ? "https://api.paypal.com"
          : "https://api.sandbox.paypal.com";

      // Get PayPal access token
      const authResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
      });

      const authData = await authResponse.json();

      // Create subscription
      const subscriptionData = {
        plan_id: `neurolint-${plan_type}`,
        application_context: {
          brand_name: "NeuroLint",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${req.get("origin")}/billing?success=true`,
          cancel_url: `${req.get("origin")}/billing?cancelled=true`,
        },
        subscriber: {
          name: {
            given_name: "User",
            surname: "Name",
          },
        },
      };

      const subscriptionResponse = await fetch(
        `${paypalBaseUrl}/v1/billing/subscriptions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authData.access_token}`,
          },
          body: JSON.stringify(subscriptionData),
        },
      );

      const subscription = await subscriptionResponse.json();

      res.json({
        subscription_id: subscription.id,
        approve_link: subscription.links?.find(
          (link: any) => link.rel === "approve",
        )?.href,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user usage statistics
  app.get("/api/auth/usage", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: "No authorization token provided" });
      }

      // For now, return mock data since we're using Supabase auth
      // TODO: Get actual user data from Supabase and calculate real usage stats
      const mockUsageStats = {
        totalTransformations: 42,
        successfulTransformations: 40,
        totalExecutionTime: 2400, // in milliseconds
        successRate: 95.2,
      };

      res.json(mockUsageStats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch usage statistics" });
    }
  });

  // Get current user profile from Supabase auth
  app.get("/api/auth/user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: "No authorization token provided" });
      }

      // Extract user ID from Supabase token
      // For now, return mock user data matching Supabase user structure
      const mockUser = {
        id: "supabase-user-id",
        email: "user@example.com",
        user_metadata: {
          full_name: "Test User",
          avatar_url: null,
        },
        app_metadata: {
          plan_type: "free",
          monthly_transformations_used: 5,
          monthly_limit: 25,
        },
      };

      res.json(mockUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  // Create or update user in our database when they sign up/sign in with Supabase
  app.post("/api/auth/sync-user", async (req, res) => {
    try {
      const { id, email, user_metadata } = req.body;

      if (!id || !email) {
        return res
          .status(400)
          .json({ error: "User ID and email are required" });
      }

      // Check if user already exists in our database using clerkId field for Supabase ID
      let user = await storage.getUserByClerkId(id);

      if (!user) {
        try {
          // Create new user in our database
          user = await storage.createUser({
            clerkId: id, // Using clerkId field for Supabase user ID for now
            email,
            fullName: user_metadata?.full_name || email.split("@")[0],
          });
        } catch (createError) {
          console.error("Error creating user:", createError);
          // If user creation fails due to duplicate, try to get the existing user
          user = await storage.getUserByClerkId(id);
          if (!user) {
            throw createError;
          }
        }
      }

      res.json(user);
    } catch (error) {
      console.error("Failed to sync user:", error);
      res
        .status(500)
        .json({ error: "Failed to sync user", details: error.message });
    }
  });

  // Transformation usage tracking
  app.post("/api/increment-usage", async (req, res) => {
    try {
      const { clerkId } = req.body;
      const success = await storage.incrementUsage(clerkId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to increment usage" });
    }
  });

  // Track transformations
  app.post("/api/transformations", async (req, res) => {
    try {
      const transformation = await storage.createTransformation(req.body);
      res.json(transformation);
    } catch (error) {
      res.status(500).json({ error: "Failed to save transformation" });
    }
  });

  // Record payments
  app.post("/api/payments", async (req, res) => {
    try {
      const {
        userId,
        paypalPaymentId,
        amountCents,
        currency,
        status,
        paymentType,
        description,
      } = req.body;

      // This would typically integrate with your payment storage
      // For now, just return success
      res.json({ success: true, id: paypalPaymentId });
    } catch (error) {
      res.status(500).json({ error: "Failed to record payment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
