import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTeams, useTeam, useTeamAnalytics } from "@/hooks/useTeams";
import {
  Users,
  TrendingUp,
  Shield,
  Clock,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  Activity,
  Settings,
  Filter,
  Download,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Developer" | "Auditor";
  avatar: string;
  fixesThisWeek: number;
  lastActive: string;
}

interface Project {
  id: string;
  name: string;
  repository: string;
  healthScore: number;
  lastScan: string;
  totalIssues: number;
  fixedIssues: number;
  contributors: string[];
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  project: string;
  timestamp: string;
  type: "fix" | "scan" | "config" | "error";
}

const TeamDashboard = () => {
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("7d");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("demo-team");

  // Fetch real team data
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: teamData, isLoading: teamLoading } = useTeam(selectedTeamId);
  const { data: analytics, isLoading: analyticsLoading } = useTeamAnalytics(selectedTeamId);

  if (teamsLoading || teamLoading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="text-white text-lg">Loading team dashboard...</div>
      </div>
    );
  }

  // Get real team members from API
  const teamMembers = teamData?.members?.map(member => ({
    id: member.id,
    name: member.userId, // Would need user lookup for real name
    email: `${member.userId}@company.com`,
    role: member.role,
    avatar: "/avatars/default.jpg",
    fixesThisWeek: Math.floor(Math.random() * 30), // Would come from real analytics
    lastActive: "Recently",
  })) || [];
      fixedIssues: 42,
      contributors: ["1", "2", "3"],
    },
    {
      id: "2",
      name: "API Service",
      repository: "company/api-service",
      healthScore: 87,
      lastScan: "6 hours ago",
      totalIssues: 23,
      fixedIssues: 20,
      contributors: ["2", "3"],
    },
  ];

  const recentActivity: ActivityItem[] = [
    {
      id: "1",
      user: "Alex Kim",
      action: "Fixed 8 missing key props",
      project: "Frontend App",
      timestamp: "2 hours ago",
      type: "fix",
    },
    {
      id: "2",
      user: "Sarah Chen",
      action: "Updated team lint rules",
      project: "All Projects",
      timestamp: "4 hours ago",
      type: "config",
    },
    {
      id: "3",
      user: "Mike Rodriguez",
      action: "Scanned codebase",
      project: "API Service",
      timestamp: "6 hours ago",
      type: "scan",
    },
  ];

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 75) return "text-yellow-400";
    return "text-red-400";
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Owner":
        return "bg-purple-900 text-purple-200";
      case "Admin":
        return "bg-blue-900 text-blue-200";
      case "Developer":
        return "bg-green-900 text-green-200";
      case "Auditor":
        return "bg-gray-700 text-gray-200";
      default:
        return "bg-zinc-900 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Team Dashboard
            </h1>
            <p className="text-zinc-400">
              Monitor code quality and team productivity across all projects
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="primary" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Team Settings
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">
                    Code Quality
                  </p>
                  <p className="text-3xl font-bold text-white">{analytics?.codeQuality.current || 0}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {analytics?.codeQuality.change > 0 ? '↑' : '↓'} {Math.abs(analytics?.codeQuality.change || 0)}% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">
                    Fixed Issues
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {teamData?.projects.reduce((sum, p) => sum + p.fixedIssues, 0) || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Across {teamData?.projects.length || 0} projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Open Issues</p>
                  <p className="text-3xl font-bold text-white">
                    {teamData?.projects.reduce((sum, p) => sum + (p.totalIssues - p.fixedIssues), 0) || 0}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Needs attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Team Members</p>
                  <p className="text-3xl font-bold text-white">
                    {teamData?.members.length || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-400 mt-2">Active members</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-zinc-900 border-zinc-800er">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Projects
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Team
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 bg-zinc-900 rounded-lg"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            activity.type === "fix"
                              ? "bg-white"
                              : activity.type === "scan"
                                ? "bg-gray-300"
                                : activity.type === "config"
                                  ? "bg-gray-400"
                                  : "bg-gray-500"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-white text-sm">
                            <span className="font-medium">{activity.user}</span>{" "}
                            {activity.action}
                          </p>
                          <p className="text-zinc-400 text-xs">
                            {activity.project} • {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Project Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Project Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamData?.projects.length === 0 ? (
                      <div className="text-center p-8 text-gray-400">
                        <p>No projects found. Create a project to get started.</p>
                      </div>
                    ) : (
                      teamData?.projects.map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <GitBranch className="w-4 h-4 text-zinc-400" />
                              <span className="text-white font-medium">
                                {project.name}
                              </span>
                            </div>
                            <p className="text-zinc-400 text-xs mt-1">
                              {project.repository || 'No repository'} • Last scan {project.lastScan ? new Date(project.lastScan).toLocaleDateString() : 'Never'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">
                              {project.healthScore}%
                            </div>
                            <p className="text-zinc-400 text-xs">
                              {project.fixedIssues}/{project.totalIssues} issues fixed
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamData?.members.length === 0 ? (
                    <div className="text-center p-8 text-gray-400">
                      <p>No team members found.</p>
                    </div>
                  ) : (
                    teamData?.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-zinc-900er text-white">
                            {member.userId.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium">
                            User {member.userId}
                          </p>
                          <p className="text-zinc-400 text-sm">
                            Member ID: {member.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getRoleBadgeStyle(member.role)}>
                          {member.role}
                        </Badge>
                        <div className="text-right">
                          <p className="text-zinc-400 text-xs">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Activity Feed</CardTitle>
                  <div className="flex items-center gap-2">
                    <select className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm text-white">
                      <option>All Projects</option>
                      {projects.map((p) => (
                        <option key={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <select className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm text-white">
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 3 months</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...recentActivity, ...recentActivity].map(
                    (activity, index) => (
                      <div
                        key={`${activity.id}-${index}`}
                        className="flex items-start gap-3 p-3 hover:bg-zinc-900 rounded-lg transition-colors"
                      >
                        <div
                          className={`w-3 h-3 rounded-full mt-1.5 ${
                            activity.type === "fix"
                              ? "bg-white"
                              : activity.type === "scan"
                                ? "bg-gray-300"
                                : activity.type === "config"
                                  ? "bg-gray-400"
                                  : "bg-gray-500"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-white">
                            <span className="font-medium">{activity.user}</span>{" "}
                            {activity.action}
                          </p>
                          <p className="text-zinc-400 text-sm">
                            {activity.project} • {activity.timestamp}
                          </p>
                        </div>
                        <Clock className="w-4 h-4 text-zinc-400 mt-1" />
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fix Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-zinc-900 rounded-lg">
                    <p className="text-zinc-400">
                      Chart showing success rates over time
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { issue: "Missing key props", count: 24, trend: "down" },
                      { issue: "HTML entities", count: 18, trend: "up" },
                      { issue: "Missing imports", count: 15, trend: "down" },
                      { issue: "var declarations", count: 12, trend: "down" },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg"
                      >
                        <span className="text-white">{item.issue}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400">
                            {item.count}
                          </span>
                          <TrendingUp
                            className={`w-4 h-4 ${item.trend === "down" ? "text-white rotate-180" : "text-gray-400"}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeamDashboard;