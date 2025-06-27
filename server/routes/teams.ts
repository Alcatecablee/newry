import { Request, Response, Router } from "express";
import { storage } from "../storage";
import { insertTeamSchema, insertTeamMemberSchema, insertTeamProjectSchema } from "@shared/schema";

const router = Router();

// Get user's teams
router.get('/api/teams', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: "User ID required" });
    }

    const teams = await storage.getUserTeams(userId);
    res.json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

// Create a team
router.post('/api/teams', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: "User ID required" });
    }

    const validation = insertTeamSchema.safeParse({ ...req.body, ownerId: userId });
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid team data", details: validation.error.errors });
    }

    const team = await storage.createTeam(validation.data);
    
    // Add creator as owner
    await storage.addTeamMember({
      teamId: team.id,
      userId: userId,
      role: "owner"
    });

    res.status(201).json({ team });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: "Failed to create team" });
  }
});

// Get team details
router.get('/api/teams/:teamId', async (req: Request, res: Response) => {
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
      activities 
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: "Failed to fetch team" });
  }
});

// Add team member
router.post('/api/teams/:teamId/members', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const validation = insertTeamMemberSchema.safeParse({ ...req.body, teamId });
    
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid member data", details: validation.error.errors });
    }

    const member = await storage.addTeamMember(validation.data);
    
    // Log activity
    await storage.logTeamActivity({
      teamId,
      userId: validation.data.userId,
      action: "Member added",
      type: "config"
    });

    res.status(201).json({ member });
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ error: "Failed to add team member" });
  }
});

// Create team project
router.post('/api/teams/:teamId/projects', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const userId = req.headers['x-user-id'] as string;
    
    const validation = insertTeamProjectSchema.safeParse({ ...req.body, teamId });
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid project data", details: validation.error.errors });
    }

    const project = await storage.createTeamProject(validation.data);
    
    // Log activity
    if (userId) {
      await storage.logTeamActivity({
        teamId,
        userId,
        action: "Project created",
        project: project.name,
        type: "config"
      });
    }

    res.status(201).json({ project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Get team analytics/stats
router.get('/api/teams/:teamId/analytics', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    
    // Mock analytics data for now - would calculate from real data
    const analytics = {
      codeQuality: { current: 85, previous: 78, change: 7, trend: "up" },
      velocity: { current: 42, previous: 38, change: 4, trend: "up" },
      collaboration: { current: 76, previous: 72, change: 4, trend: "up" },
      bugRate: { current: 12, previous: 18, change: -6, trend: "down" },
      techDebt: { current: 23, previous: 31, change: -8, trend: "down" },
      innovation: { current: 67, previous: 61, change: 6, trend: "up" }
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;