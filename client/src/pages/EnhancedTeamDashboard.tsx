import { useState, useEffect } from "react";
import {
  useTeams,
  useTeam,
  useTeamAnalytics,
  useCreateTeam,
  useCreateProject,
} from "@/hooks/useTeams";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  Zap,
  Target,
  Award,
  Flame,
  Eye,
  MessageSquare,
  GitMerge,
  Star,
  Sparkles,
  Bot,
  Rocket,
  Trophy,
  Crown,
  Heart,
  ThumbsUp,
  Code2,
  Lightbulb,
  Timer,
  BarChart3,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "Owner" | "Admin" | "Developer" | "Auditor";
  skillLevel: "Junior" | "Mid" | "Senior" | "Lead";
  specialties: string[];
  stats: {
    fixesThisWeek: number;
    codeQualityScore: number;
    collaborationScore: number;
    innovationPoints: number;
    mentorshipHours: number;
    streak: number;
  };
  currentActivity: {
    status: "coding" | "reviewing" | "mentoring" | "offline";
    currentFile?: string;
    lastSeen: string;
    activeSession?: string;
  };
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt: string;
  points: number;
}

interface AIInsight {
  id: string;
  type: "optimization" | "risk" | "opportunity" | "prediction";
  title: string;
  description: string;
  confidence: number;
  impact: "low" | "medium" | "high" | "critical";
  actionable: boolean;
  relatedProjects: string[];
  estimatedTimeToFix: string;
  potentialSavings: string;
}

interface LiveSession {
  id: string;
  type: "pair-programming" | "code-review" | "mentoring" | "planning";
  participants: string[];
  repository: string;
  file: string;
  startedAt: string;
  status: "active" | "paused" | "ending";
}

const EnhancedTeamDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("week");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [liveMode, setLiveMode] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("demo-team");

  // Fetch teams data
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: teamData, isLoading: teamLoading } = useTeam(selectedTeamId);
  const { data: analytics, isLoading: analyticsLoading } =
    useTeamAnalytics(selectedTeamId);
  const createTeam = useCreateTeam();
  const createProject = useCreateProject();

  // Removed automatic team/project creation to prevent infinite loops
  // Teams and projects should be created manually by users

  if (teamsLoading || teamLoading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="text-white text-lg">Loading team data...</div>
      </div>
    );
  }

  // Get real team members from API
  const teamMembers =
    teamData?.members?.map((member) => ({
      id: member.id,
      name: member.userId, // Would need user lookup for real name
      email: `${member.userId}@company.com`,
      avatar: "/avatars/default.jpg",
      role: member.role,
      skillLevel:
        member.role === "owner"
          ? "Lead"
          : member.role === "admin"
            ? "Senior"
            : "Mid",
      specialties: ["React", "TypeScript"], // Would come from user profile
      stats: {
        fixesThisWeek: 0,
        codeQualityScore: 0,
        collaborationScore: 0,
        innovationPoints: 0,
        mentorshipHours: 0,
        streak: 0,
      },
      currentActivity: {
        status: "idle",
        currentFile: null,
        lastSeen: "Recently",
        activeSession: null,
      },
      achievements: [],
    })) || [];

  const getActivityIcon = (status: string) => {
    switch (status) {
      case "coding":
        return <Code2 className="w-3 h-3 text-white" />;
      case "reviewing":
        return <Eye className="w-3 h-3 text-white" />;
      case "mentoring":
        return <Heart className="w-3 h-3 text-white" />;
      default:
        return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "Lead":
        return "bg-zinc-900er text-white";
      case "Senior":
        return "bg-zinc-900 text-white";
      case "Mid":
        return "bg-zinc-900 text-gray-300";
      default:
        return "bg-black text-gray-400";
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "optimization":
        return "border-zinc-800er bg-zinc-900/50";
      case "risk":
        return "border-zinc-800er bg-zinc-900/50";
      case "opportunity":
        return "border-zinc-800er bg-zinc-900/50";
      case "prediction":
        return "border-zinc-800er bg-zinc-900/50";
      default:
        return "border-zinc-800 bg-zinc-900";
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Live Status */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  Team Command Center
                </h1>
                {teams && teams.length > 0 ? (
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="bg-zinc-800 text-white px-3 py-1 rounded border border-zinc-600 text-sm"
                  >
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  !teamsLoading && (
                    <Button
                      size="sm"
                      onClick={() => {
                        createTeam.mutate({
                          name: "My Team",
                          description: "My development team",
                        });
                      }}
                      disabled={createTeam.isPending}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      {createTeam.isPending ? "Creating..." : "Create Team"}
                    </Button>
                  )
                )}
              </div>
              <div className="flex items-center gap-4 text-zinc-400">
                <div
                  className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors"
                  onClick={() => {
                    setLiveMode(!liveMode);
                    console.log(
                      `Live Mode ${!liveMode ? "enabled" : "disabled"}`,
                    );
                  }}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${liveMode ? "bg-white animate-pulse" : "bg-gray-400"}`}
                  />
                  <span>Live Mode {liveMode ? "ON" : "OFF"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{teamData?.members.length || 0} team members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>{teamData?.projects.length || 0} active projects</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // AI Assistant functionality
                console.log("AI Assistant clicked");
                // Could open AI chat modal or navigate to AI page
              }}
            >
              <Bot className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Start collaborative session
                console.log("Start Session clicked");
                // Could redirect to live collaboration page
                window.location.href = "/team/live-sessions";
              }}
            >
              <Rocket className="w-4 h-4 mr-2" />
              Start Session
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                // Navigate to team settings
                console.log("Team Settings clicked");
                window.location.href = "/team/settings";
              }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Team Settings
            </Button>
          </div>
        </div>

        {/* Enhanced Metrics with Gamification */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800er">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Code Quality</p>
                  <p className="text-3xl font-bold text-white">
                    {analytics?.codeQuality.current || 0}%
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {analytics?.codeQuality.change > 0 ? "+" : ""}
                {analytics?.codeQuality.change || 0}% from last period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800er">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Team Velocity</p>
                  <p className="text-3xl font-bold text-white">
                    {analytics?.velocity.current || 0}%
                  </p>
                </div>
                <Bot className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {analytics?.velocity.change > 0 ? "+" : ""}
                {analytics?.velocity.change || 0}% this period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800er">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Innovation Score</p>
                  <p className="text-3xl font-bold text-white">
                    {analytics?.innovation.current || 0}%
                  </p>
                </div>
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {analytics?.innovation.change > 0 ? "+" : ""}
                {analytics?.innovation.change || 0}% change
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800er">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Collaboration</p>
                  <p className="text-3xl font-bold text-white">
                    {analytics?.collaboration.current || 0}%
                  </p>
                </div>
                <Heart className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {analytics?.collaboration.change > 0 ? "+" : ""}
                {analytics?.collaboration.change || 0}% change
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800er">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Bug Rate</p>
                  <p className="text-3xl font-bold text-white">
                    {analytics?.bugRate.current || 0}%
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {analytics?.bugRate.change > 0 ? "+" : ""}
                {analytics?.bugRate.change || 0}% change
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="live" className="space-y-6">
          <TabsList className="bg-zinc-900 border-zinc-800er">
            <TabsTrigger
              value="live"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Activity className="w-4 h-4 mr-2" />
              Live Activity
            </TabsTrigger>
            <TabsTrigger
              value="ai-insights"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Faab978f39ff64270b6e29ab49582f574%2F38b5bfac1a6242ebb67f91834016d010?format=webp&width=800"
                alt="Logo"
                className="w-4 h-4 mr-2"
              />
              AI Insights
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Users className="w-4 h-4 mr-2" />
              Team Performance
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Award className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Deep Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live Sessions - Only show if there are real active sessions */}
              {teamData?.activities && teamData.activities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-400" />
                      Recent Team Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {teamData.activities.slice(0, 5).map((activity) => (
                        <div
                          key={activity.id}
                          className="p-3 bg-zinc-900 rounded-lg border border-zinc-700"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white text-sm">
                              {activity.action}
                            </span>
                            <span className="text-zinc-400 text-xs">
                              {new Date(activity.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {activity.project && (
                            <p className="text-zinc-300 text-xs mt-1">
                              Project: {activity.project}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Team Activity Feed */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Real-time Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg"
                      >
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1">
                            {getActivityIcon(member.currentActivity.status)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">
                              {member.name}
                            </span>
                            <Badge
                              className={getSkillLevelColor(member.skillLevel)}
                            >
                              {member.skillLevel}
                            </Badge>
                          </div>
                          <p className="text-zinc-400 text-sm">
                            {member.currentActivity.status === "coding" &&
                              `Coding in ${member.currentActivity.currentFile}`}
                            {member.currentActivity.status === "reviewing" &&
                              `Reviewing ${member.currentActivity.currentFile}`}
                            {member.currentActivity.status === "mentoring" &&
                              "In mentoring session"}
                            {member.currentActivity.status === "offline" &&
                              "Offline"}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-400" />
                            <span className="text-orange-400 text-sm">
                              {member.stats.streak}
                            </span>
                          </div>
                          <p className="text-zinc-400 text-xs">
                            {member.currentActivity.lastSeen}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2Faab978f39ff64270b6e29ab49582f574%2F38b5bfac1a6242ebb67f91834016d010?format=webp&width=800"
                      alt="Logo"
                      className="w-5 h-5"
                    />
                    AI-Powered Team Insights
                    <Badge className="bg-blue-900 text-blue-200 ml-2">
                      Beta
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiInsights.map((insight) => (
                      <div
                        key={insight.id}
                        className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-zinc-900 text-white">
                                {insight.type}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-zinc-400">
                                  Confidence:
                                </span>
                                <span className="text-xs text-white">
                                  {insight.confidence}%
                                </span>
                              </div>
                              <Badge
                                className={`text-xs ${
                                  insight.impact === "critical"
                                    ? "bg-red-900 text-red-200"
                                    : insight.impact === "high"
                                      ? "bg-orange-900 text-orange-200"
                                      : insight.impact === "medium"
                                        ? "bg-yellow-900 text-yellow-200"
                                        : "bg-green-900 text-green-200"
                                }`}
                              >
                                {insight.impact}
                              </Badge>
                            </div>
                            <h3 className="text-white font-medium mb-2">
                              {insight.title}
                            </h3>
                            <p className="text-zinc-400 text-sm mb-3">
                              {insight.description}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-zinc-400">
                              <span>
                                Time to fix: {insight.estimatedTimeToFix}
                              </span>
                              <span>Impact: {insight.potentialSavings}</span>
                              <span>
                                Projects: {insight.relatedProjects.join(", ")}
                              </span>
                            </div>
                          </div>

                          {insight.actionable && (
                            <div className="flex items-center gap-2 ml-4">
                              <Button size="sm" variant="outline">
                                <Lightbulb className="w-3 h-3 mr-1" />
                                Suggest Fix
                              </Button>
                              <Button size="sm" variant="primary">
                                <Rocket className="w-3 h-3 mr-1" />
                                Auto-Fix
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Performance Grid */}
              <Card>
                <CardHeader>
                  <CardTitle>Team Performance Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-4 bg-zinc-900 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white font-medium">
                                {member.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={getSkillLevelColor(
                                    member.skillLevel,
                                  )}
                                >
                                  {member.skillLevel}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Flame className="w-3 h-3 text-orange-400" />
                                  <span className="text-orange-400 text-xs">
                                    {member.stats.streak} days
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              {member.stats.codeQualityScore}
                            </div>
                            <div className="text-xs text-zinc-400">
                              Quality Score
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Fixes</span>
                              <span className="text-white">
                                {member.stats.fixesThisWeek}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">
                                Collaboration
                              </span>
                              <span className="text-white">
                                {member.stats.collaborationScore}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Innovation</span>
                              <span className="text-white">
                                {member.stats.innovationPoints}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Mentoring</span>
                              <span className="text-white">
                                {member.stats.mentorshipHours}h
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {member.specialties.map((specialty) => (
                              <Badge
                                key={specialty}
                                className="bg-zinc-900 text-zinc-400 text-xs"
                              >
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Skill Distribution */}
              {/* Skills section removed - no real skills data available */}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Team Achievements - Only show if there are real achievements */}
              {teamMembers.length > 0 && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Team Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="p-4 bg-zinc-900 rounded-lg border border-blue-400/30"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white font-medium">
                                {member.name}
                              </p>
                              <p className="text-zinc-400 text-xs">
                                {member.role}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Leaderboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teamMembers
                      .sort(
                        (a, b) =>
                          b.stats.innovationPoints - a.stats.innovationPoints,
                      )
                      .map((member, index) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-2 bg-zinc-900 rounded-lg"
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0
                                ? "bg-yellow-400 text-black"
                                : index === 1
                                  ? "bg-gray-400 text-black"
                                  : index === 2
                                    ? "bg-orange-600 text-white"
                                    : "bg-zinc-900 text-white"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium">
                              {member.name}
                            </p>
                            <p className="text-zinc-400 text-xs">
                              {member.stats.innovationPoints} points
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Code Quality Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-zinc-900 rounded-lg">
                    <p className="text-zinc-400">
                      Interactive quality trend chart would go here
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Velocity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-zinc-900 rounded-lg">
                    <p className="text-zinc-400">
                      Velocity and productivity metrics chart
                    </p>
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

export default EnhancedTeamDashboard;
