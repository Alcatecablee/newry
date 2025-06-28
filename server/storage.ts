import { db, isPostgres } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Import schemas - use SQLite by default since that's our local setup
import * as pgSchema from "../shared/schema.js";
import * as sqliteSchema from "../shared/schema-sqlite.js";

// Use appropriate schema based on database type
const schema = isPostgres ? pgSchema : sqliteSchema;
const {
  users,
  transformations,
  payments,
  teams,
  teamMembers,
  teamProjects,
  teamActivities,
} = schema;

// Export types from the appropriate schema
export type User = typeof schema.User;
export type InsertUser = typeof schema.InsertUser;
export type Transformation = typeof schema.Transformation;
export type Team = typeof schema.Team;
export type TeamMember = typeof schema.TeamMember;
export type TeamProject = typeof schema.TeamProject;
export type TeamActivity = typeof schema.TeamActivity;
export type InsertTeam = typeof schema.InsertTeam;
export type InsertTeamMember = typeof schema.InsertTeamMember;
export type InsertTeamProject = typeof schema.InsertTeamProject;

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByClerkId(clerkId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  incrementUsage(clerkId: string): Promise<boolean>;
  createTransformation(
    transformation: Omit<Transformation, "id" | "createdAt">,
  ): Promise<Transformation>;

  // Team methods
  createTeam(team: InsertTeam): Promise<Team>;
  getTeam(id: string): Promise<Team | undefined>;
  getUserTeams(userId: string): Promise<Team[]>;
  addTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  getTeamMembers(teamId: string): Promise<TeamMember[]>;
  createTeamProject(project: InsertTeamProject): Promise<TeamProject>;
  getTeamProjects(teamId: string): Promise<TeamProject[]>;
  getTeamActivities(teamId: string, limit?: number): Promise<TeamActivity[]>;
  logTeamActivity(
    activity: Omit<TeamActivity, "id" | "createdAt">,
  ): Promise<TeamActivity>;
}

export class DatabaseStorage implements IStorage {
  private inMemoryTeams: Team[] = [];
  private inMemoryMembers: TeamMember[] = [];
  private inMemoryProjects: TeamProject[] = [];
  private inMemoryActivities: TeamActivity[] = [];

  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
  async getUser(id: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0];
  }

  async getUserByClerkId(clerkId: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userWithId = {
      ...insertUser,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isPostgres) {
      const result = await db.insert(users).values(userWithId).returning();
      return result[0];
    } else {
      // For SQLite, we need to insert and then select
      await db.insert(users).values({
        ...userWithId,
        createdAt: Math.floor(userWithId.createdAt.getTime() / 1000),
        updatedAt: Math.floor(userWithId.updatedAt.getTime() / 1000),
      });
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, userWithId.id))
        .limit(1);
      return result[0];
    }
  }

  async incrementUsage(clerkId: string): Promise<boolean> {
    try {
      const user = await this.getUserByClerkId(clerkId);
      if (!user) return false;

      const currentUsage = user.monthlyTransformationsUsed || 0;
      const limit = user.monthlyLimit || 10;

      if (currentUsage >= limit) {
        return false;
      }

      await db
        .update(users)
        .set({
          monthlyTransformationsUsed: currentUsage + 1,
          updatedAt: isPostgres ? new Date() : Math.floor(Date.now() / 1000),
        })
        .where(eq(users.clerkId, clerkId));

      return true;
    } catch (error) {
      return false;
    }
  }

  async createTransformation(
    transformation: Omit<Transformation, "id" | "createdAt">,
  ): Promise<Transformation> {
    const transformationWithId = {
      ...transformation,
      id: this.generateId(),
      createdAt: isPostgres ? new Date() : Math.floor(Date.now() / 1000),
      layersUsed: isPostgres
        ? transformation.layersUsed
        : JSON.stringify(transformation.layersUsed),
    };

    if (isPostgres) {
      const result = await db
        .insert(transformations)
        .values(transformationWithId)
        .returning();
      return result[0];
    } else {
      await db.insert(transformations).values(transformationWithId);
      const result = await db
        .select()
        .from(transformations)
        .where(eq(transformations.id, transformationWithId.id))
        .limit(1);
      return result[0];
    }
  }

  // Team methods implementation
  async createTeam(team: InsertTeam): Promise<Team> {
    if (db) {
      const teamWithId = {
        ...team,
        id: this.generateId(),
        planType: "team",
        monthlyLimit: 1000,
        createdAt: isPostgres ? new Date() : Math.floor(Date.now() / 1000),
        updatedAt: isPostgres ? new Date() : Math.floor(Date.now() / 1000),
      };

      if (isPostgres) {
        const result = await db.insert(teams).values(teamWithId).returning();
        return result[0];
      } else {
        // For SQLite, insert and then select
        await db.insert(teams).values(teamWithId);
        const result = await db
          .select()
          .from(teams)
          .where(eq(teams.id, teamWithId.id))
          .limit(1);
        return result[0];
      }
    } else {
      // In-memory fallback
      const newTeam: Team = {
        id: this.generateId(),
        name: team.name,
        description: team.description ? String(team.description) : null,
        ownerId: team.ownerId,
        planType: "team",
        monthlyLimit: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.inMemoryTeams.push(newTeam);
      return newTeam;
    }
  }

  async getTeam(id: string): Promise<Team | undefined> {
    if (db) {
      const result = await db
        .select()
        .from(teams)
        .where(eq(teams.id, id))
        .limit(1);
      return result[0];
    } else {
      return this.inMemoryTeams.find((t) => t.id === id);
    }
  }

  async getUserTeams(userId: string): Promise<Team[]> {
    if (db) {
      const result = await db
        .select({
          team: teams,
        })
        .from(teams)
        .leftJoin(teamMembers, eq(teams.id, teamMembers.teamId))
        .where(eq(teamMembers.userId, userId));

      return result.map((r: any) => r.team);
    } else {
      const userMemberships = this.inMemoryMembers.filter(
        (m) => m.userId === userId,
      );
      return this.inMemoryTeams.filter(
        (t) =>
          userMemberships.some((m) => m.teamId === t.id) ||
          t.ownerId === userId,
      );
    }
  }

  async addTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    if (db) {
      const memberWithId = {
        ...member,
        id: this.generateId(),
        role: member.role || "developer",
        joinedAt: isPostgres ? new Date() : Math.floor(Date.now() / 1000),
      };

      if (isPostgres) {
        const result = await db
          .insert(teamMembers)
          .values(memberWithId)
          .returning();
        return result[0];
      } else {
        // For SQLite, insert and then select
        await db.insert(teamMembers).values(memberWithId);
        const result = await db
          .select()
          .from(teamMembers)
          .where(eq(teamMembers.id, memberWithId.id))
          .limit(1);
        return result[0];
      }
    } else {
      const newMember: TeamMember = {
        id: this.generateId(),
        teamId: member.teamId,
        userId: member.userId,
        role: member.role ? String(member.role) : "developer",
        joinedAt: new Date(),
      };
      this.inMemoryMembers.push(newMember);
      return newMember;
    }
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    if (db) {
      const result = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.teamId, teamId));
      return result;
    } else {
      return this.inMemoryMembers.filter((m) => m.teamId === teamId);
    }
  }

  async createTeamProject(project: InsertTeamProject): Promise<TeamProject> {
    if (db) {
      const result = await db.insert(teamProjects).values(project).returning();
      return result[0];
    } else {
      const newProject: TeamProject = {
        id: this.generateId(),
        teamId: project.teamId,
        name: project.name,
        repository: project.repository ? String(project.repository) : null,
        healthScore: 0,
        totalIssues: 0,
        fixedIssues: 0,
        lastScan: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.inMemoryProjects.push(newProject);
      return newProject;
    }
  }

  async getTeamProjects(teamId: string): Promise<TeamProject[]> {
    if (db) {
      const result = await db
        .select()
        .from(teamProjects)
        .where(eq(teamProjects.teamId, teamId));
      return result;
    } else {
      return this.inMemoryProjects.filter((p) => p.teamId === teamId);
    }
  }

  async getTeamActivities(
    teamId: string,
    limit: number = 50,
  ): Promise<TeamActivity[]> {
    if (db) {
      const result = await db
        .select()
        .from(teamActivities)
        .where(eq(teamActivities.teamId, teamId))
        .orderBy(desc(teamActivities.createdAt))
        .limit(limit);
      return result;
    } else {
      return this.inMemoryActivities
        .filter((a) => a.teamId === teamId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    }
  }

  async logTeamActivity(
    activity: Omit<TeamActivity, "id" | "createdAt">,
  ): Promise<TeamActivity> {
    if (db) {
      const result = await db
        .insert(teamActivities)
        .values(activity)
        .returning();
      return result[0];
    } else {
      const newActivity: TeamActivity = {
        id: this.generateId(),
        teamId: activity.teamId,
        userId: activity.userId,
        action: activity.action,
        project: activity.project || null,
        details: activity.details || null,
        type: activity.type || "scan",
        createdAt: new Date(),
      };
      this.inMemoryActivities.push(newActivity);
      return newActivity;
    }
  }
}

export const storage = new DatabaseStorage();
