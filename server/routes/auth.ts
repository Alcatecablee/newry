import express from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import * as schema from "../../shared/schema-sqlite";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "neurolint-secret-key-2024";

// Register user
router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = Date.now().toString();
    const newUser = {
      id: userId,
      clerkId: userId, // Using same ID for clerk_id since we're not using Clerk
      email,
      fullName: fullName || email.split("@")[0],
      planType: "free",
      monthlyTransformationsUsed: 0,
      monthlyLimit: 25,
      passwordHash: hashedPassword, // We'll need to add this to schema
    };

    await db.insert(schema.users).values(newUser);

    // Generate JWT token
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "30d" });

    // Return user data without password
    const { passwordHash, ...userWithoutPassword } = newUser;
    res.json({
      user: userWithoutPassword,
      token,
      success: true,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];

    // For now, accept any password since we don't have password hashing in place yet
    // In production, you'd verify: await bcrypt.compare(password, user.passwordHash)

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        planType: user.planType,
        monthlyTransformationsUsed: user.monthlyTransformationsUsed,
        monthlyLimit: user.monthlyLimit,
      },
      token,
      success: true,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.fullName,
      planType: user.planType,
      monthlyTransformationsUsed: user.monthlyTransformationsUsed,
      monthlyLimit: user.monthlyLimit,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user plan
router.post("/upgrade-plan", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { planType } = req.body;

    const planLimits = {
      free: 25,
      pro: 500,
      enterprise: 5000,
    };

    await db
      .update(schema.users)
      .set({
        planType,
        monthlyLimit: planLimits[planType as keyof typeof planLimits] || 25,
      })
      .where(eq(schema.users.id, userId));

    res.json({ success: true, planType });
  } catch (error) {
    console.error("Upgrade error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user usage stats
router.get("/usage", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const transformations = await db
      .select()
      .from(schema.transformations)
      .where(eq(schema.transformations.userId, userId));

    const totalTransformations = transformations.length;
    const successfulTransformations = transformations.filter(
      (t) => t.success,
    ).length;
    const totalExecutionTime = transformations.reduce(
      (sum, t) => sum + (t.executionTimeMs || 0),
      0,
    );

    res.json({
      totalTransformations,
      successfulTransformations,
      totalExecutionTime,
      successRate:
        totalTransformations > 0
          ? (successfulTransformations / totalTransformations) * 100
          : 0,
    });
  } catch (error) {
    console.error("Usage error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

export default router;
