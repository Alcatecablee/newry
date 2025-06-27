import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Team {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  planType: string;
  monthlyLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: string;
  joinedAt: string;
}

export interface TeamProject {
  id: string;
  teamId: string;
  name: string;
  repository: string | null;
  healthScore: number;
  totalIssues: number;
  fixedIssues: number;
  lastScan: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamActivity {
  id: string;
  teamId: string;
  userId: string;
  action: string;
  project: string | null;
  details: string | null;
  type: string;
  createdAt: string;
}

export interface TeamAnalytics {
  codeQuality: { current: number; previous: number; change: number; trend: string };
  velocity: { current: number; previous: number; change: number; trend: string };
  collaboration: { current: number; previous: number; change: number; trend: string };
  bugRate: { current: number; previous: number; change: number; trend: string };
  techDebt: { current: number; previous: number; change: number; trend: string };
  innovation: { current: number; previous: number; change: number; trend: string };
}

const MOCK_USER_ID = "user-123"; // In real app, this would come from auth

export function useTeams() {
  return useQuery({
    queryKey: ['/api/teams'],
    queryFn: async () => {
      const response = await fetch('/api/teams', {
        headers: {
          'x-user-id': MOCK_USER_ID
        }
      });
      if (!response.ok) throw new Error('Failed to fetch teams');
      const data = await response.json();
      return data.teams as Team[];
    }
  });
}

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ['/api/teams', teamId],
    queryFn: async () => {
      const response = await fetch(`/api/teams/${teamId}`, {
        headers: {
          'x-user-id': MOCK_USER_ID
        }
      });
      if (!response.ok) throw new Error('Failed to fetch team');
      return await response.json() as {
        team: Team;
        members: TeamMember[];
        projects: TeamProject[];
        activities: TeamActivity[];
      };
    },
    enabled: !!teamId
  });
}

export function useTeamAnalytics(teamId: string) {
  return useQuery({
    queryKey: ['/api/teams', teamId, 'analytics'],
    queryFn: async () => {
      const response = await fetch(`/api/teams/${teamId}/analytics`, {
        headers: {
          'x-user-id': MOCK_USER_ID
        }
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      return data.analytics as TeamAnalytics;
    },
    enabled: !!teamId
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (team: { name: string; description?: string }) => {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': MOCK_USER_ID
        },
        body: JSON.stringify(team)
      });
      if (!response.ok) throw new Error('Failed to create team');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
    }
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ teamId, project }: { teamId: string; project: { name: string; repository?: string } }) => {
      const response = await fetch(`/api/teams/${teamId}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': MOCK_USER_ID
        },
        body: JSON.stringify(project)
      });
      if (!response.ok) throw new Error('Failed to create project');
      return await response.json();
    },
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams', teamId] });
    }
  });
}