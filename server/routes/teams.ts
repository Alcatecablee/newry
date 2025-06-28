import { Request, Response, Router } from "express";
import { storage } from "../storage";
import {
  insertTeamSchema,
  insertTeamMemberSchema,
  insertTeamProjectSchema,
} from "@shared/schema";

const router = Router();

// Get user's teams
router.get("/api/teams", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({ error: "User ID required" });
    }

    const teams = await storage.getUserTeams(userId);
    res.json({ teams });
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

// Create a team
router.post("/api/teams", async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({ error: "User ID required" });
    }

    const validation = insertTeamSchema.safeParse({
      ...req.body,
      ownerId: userId,
    });
    if (!validation.success) {
      return res
        .status(400)
        .json({ error: "Invalid team data", details: validation.error.errors });
    }

    const team = await storage.createTeam(validation.data);

    // Add creator as owner
    await storage.addTeamMember({
      teamId: team.id,
      userId: userId,
      role: "owner",
    });

    res.status(201).json({ team });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ error: "Failed to create team" });
  }
});

// Get team details
router.get("/api/teams/:teamId", async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const team = await storage.getTeam(teamId);

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const members = await storage.getTeamMembers(teamId);
    const projects = await storage.getTeamProjects(teamId);
    const activities = await storage.getTeamActivities(teamId, 20);

    res.json({
      team,
      members,
      projects,
      activities,
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({ error: "Failed to fetch team" });
  }
});

// Add team member
router.post(
  "/api/teams/:teamId/members",
  async (req: Request, res: Response) => {
    try {
      const { teamId } = req.params;
      const validation = insertTeamMemberSchema.safeParse({
        ...req.body,
        teamId,
      });

      if (!validation.success) {
        return res
          .status(400)
          .json({
            error: "Invalid member data",
            details: validation.error.errors,
          });
      }

      const member = await storage.addTeamMember(validation.data);

      // Log activity
      await storage.logTeamActivity({
        teamId,
        userId: validation.data.userId,
        action: "Member added",
        type: "config",
      });

      res.status(201).json({ member });
    } catch (error) {
      console.error("Error adding team member:", error);
      res.status(500).json({ error: "Failed to add team member" });
    }
  },
);

// Create team project
router.post(
  "/api/teams/:teamId/projects",
  async (req: Request, res: Response) => {
    try {
      const { teamId } = req.params;
      const userId = req.headers["x-user-id"] as string;

      const validation = insertTeamProjectSchema.safeParse({
        ...req.body,
        teamId,
      });
      if (!validation.success) {
        return res
          .status(400)
          .json({
            error: "Invalid project data",
            details: validation.error.errors,
          });
      }

      const project = await storage.createTeamProject(validation.data);

      // Log activity
      if (userId) {
        await storage.logTeamActivity({
          teamId,
          userId,
          action: "Project created",
          project: project.name,
          type: "config",
        });
      }

      res.status(201).json({ project });
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  },
);

// Get team analytics/stats
router.get(
  "/api/teams/:teamId/analytics",
  async (req: Request, res: Response) => {
    try {
      const { teamId } = req.params;

      // Calculate real analytics from database
      const teamTransformations = await db
        .select()
        .from(transformations)
        .innerJoin(users, eq(transformations.userId, users.id))
        .innerJoin(teamMembers, eq(users.id, teamMembers.userId))
        .where(eq(teamMembers.teamId, teamId));

      const totalTransformations = teamTransformations.length;
      const successfulTransformations = teamTransformations.filter(
        (t) => t.transformations.success,
      ).length;
      const successRate =
        totalTransformations > 0
          ? Math.round((successfulTransformations / totalTransformations) * 100)
          : 0;

      const analytics = {
        codeQuality: {
          current: successRate,
          previous: 0,
          change: 0,
          trend: "stable",
        },
        velocity: {
          current: totalTransformations,
          previous: 0,
          change: 0,
          trend: "stable",
        },
        collaboration: { current: 0, previous: 0, change: 0, trend: "stable" },
        bugRate: {
          current: 100 - successRate,
          previous: 0,
          change: 0,
          trend: "stable",
        },
        techDebt: { current: 0, previous: 0, change: 0, trend: "stable" },
        innovation: {
          current: successRate,
          previous: 0,
          change: 0,
          trend: "stable",
        },
      };

      res.json({ analytics });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  },
);

export default router;
