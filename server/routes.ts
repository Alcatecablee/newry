import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db, isPostgres } from "./db";

import { cliRoutes } from "./routes/cli";
import { apiDocsRoutes } from "./routes/api-docs";

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
        const schema = require("../shared/schema-sqlite");
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
          const schema = require("../shared/schema-sqlite");
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

  // Register CLI routes
  app.use(cliRoutes);

  // Register API documentation routes
  app.use(apiDocsRoutes);
  // User management routes
  app.get("/api/user/:clerkId", async (req, res) => {
    try {
      const user = await storage.getUserByClerkId(req.params.clerkId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/user", async (req, res) => {
    try {
      const { clerkId, email, fullName } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByClerkId(clerkId);
      if (existingUser) {
        return res.json(existingUser);
      }

      const user = await storage.createUser({ clerkId, email, fullName });
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
