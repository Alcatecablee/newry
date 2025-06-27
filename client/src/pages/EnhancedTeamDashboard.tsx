import { useState, useEffect } from "react";
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
  Brain,
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
  const { data: analytics, isLoading: analyticsLoading } = useTeamAnalytics(selectedTeamId);
  const createTeam = useCreateTeam();
  const createProject = useCreateProject();

  // Initialize demo team if none exist
  useEffect(() => {
    if (!teamsLoading && (!teams || teams.length === 0)) {
      createTeam.mutate({
        name: "Development Team",
        description: "Main development team working on NeuroLint platform"
      });
    }
  }, [teams, teamsLoading, createTeam]);

  // Create demo project if team exists but no projects
  useEffect(() => {
    if (teamData && teamData.projects.length === 0) {
      createProject.mutate({
        teamId: selectedTeamId,
        project: {
          name: "NeuroLint Platform",
          repository: "company/neurolint-platform"
        }
      });
    }
  }, [teamData, selectedTeamId, createProject]);

  if (teamsLoading || teamLoading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="text-white text-lg">Loading team data...</div>
      </div>
    );
  }

  // Mock data - in real app would come from API
  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "Sarah Chen",
      email: "sarah@company.com",
      avatar: "/avatars/sarah.jpg",
      role: "Owner",
      skillLevel: "Lead",
      specialties: ["React", "TypeScript", "Architecture"],
      stats: {
        fixesThisWeek: 23,
        codeQualityScore: 96,
        collaborationScore: 98,
        innovationPoints: 150,
        mentorshipHours: 12,
        streak: 28,
      },
      currentActivity: {
        status: "reviewing",
        currentFile: "UserProfile.tsx",
        lastSeen: "2 min ago",
        activeSession: "review-session-1",
      },
      achievements: [
        {
          id: "1",
          name: "Code Quality Master",
          description: "Maintained 95%+ quality score for 30 days",
          icon: "👑",
          rarity: "legendary",
          unlockedAt: "2024-01-15",
          points: 500,
        },
      ],
    },
    {
      id: "2",
      name: "Alex Kim",
      email: "alex@company.com",
      avatar: "/avatars/alex.jpg",
      role: "Developer",
      skillLevel: "Senior",
      specialties: ["Node.js", "APIs", "Performance"],
      stats: {
        fixesThisWeek: 31,
        codeQualityScore: 89,
        collaborationScore: 94,
        innovationPoints: 120,
        mentorshipHours: 8,
        streak: 15,
      },
      currentActivity: {
        status: "coding",
        currentFile: "api/users.ts",
        lastSeen: "now",
        activeSession: "coding-session-2",
      },
      achievements: [],
    },
  ];

  const aiInsights: AIInsight[] = [
    {
      id: "1",
      type: "optimization",
      title: "Bundle Size Optimization Opportunity",
      description:
        "AI detected 3 unused dependencies that could reduce bundle size by 24%",
      confidence: 94,
      impact: "high",
      actionable: true,
      relatedProjects: ["frontend-app"],
      estimatedTimeToFix: "2 hours",
      potentialSavings: "24% bundle reduction",
    },
    {
      id: "2",
      type: "risk",
      title: "Security Vulnerability Pattern Detected",
      description:
        "Similar code patterns in 5 files may introduce XSS vulnerabilities",
      confidence: 87,
      impact: "critical",
      actionable: true,
      relatedProjects: ["frontend-app", "admin-panel"],
      estimatedTimeToFix: "4 hours",
      potentialSavings: "Prevents security incidents",
    },
    {
      id: "3",
      type: "prediction",
      title: "Code Quality Trend Analysis",
      description:
        "Current velocity suggests hitting 95% team quality score by next month",
      confidence: 91,
      impact: "medium",
      actionable: false,
      relatedProjects: ["all"],
      estimatedTimeToFix: "N/A",
      potentialSavings: "Quality milestone achievement",
    },
  ];

  const liveSessions: LiveSession[] = [
    {
      id: "1",
      type: "pair-programming",
      participants: ["1", "2"],
      repository: "frontend-app",
      file: "components/UserProfile.tsx",
      startedAt: "15 min ago",
      status: "active",
    },
  ];

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
        return "bg-charcoal-lighter text-white";
      case "Senior":
        return "bg-charcoal-light text-white";
      case "Mid":
        return "bg-charcoal text-gray-300";
      default:
        return "bg-black text-gray-400";
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "optimization":
        return "border-charcoal-lighter bg-charcoal/50";
      case "risk":
        return "border-charcoal-lighter bg-charcoal/50";
      case "opportunity":
        return "border-charcoal-lighter bg-charcoal/50";
      case "prediction":
        return "border-charcoal-lighter bg-charcoal/50";
      default:
        return "border-charcoal-light bg-charcoal-light";
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Live Status */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Team Command Center
              </h1>
              <div className="flex items-center gap-4 text-charcoal-lighter">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${liveMode ? "bg-white animate-pulse" : "bg-gray-400"}`}
                  />
                  <span>Live Mode {liveMode ? "ON" : "OFF"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>
                    {teamData?.members.length || 0} team members
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>{teamData?.projects.length || 0} active projects</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Bot className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
            <Button variant="outline" size="sm">
              <Rocket className="w-4 h-4 mr-2" />
              Start Session
            </Button>
            <Button variant="primary" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Team Settings
            </Button>
          </div>
        </div>

        {/* Enhanced Metrics with Gamification */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-charcoal border-charcoal-lighter">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Code Quality</p>
                  <p className="text-3xl font-bold text-white">{analytics?.codeQuality.current || 0}%</p>
                </div>
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {analytics?.codeQuality.change > 0 ? '+' : ''}{analytics?.codeQuality.change || 0}% from last period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-charcoal border-charcoal-lighter">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Team Velocity</p>
                  <p className="text-3xl font-bold text-white">{analytics?.velocity.current || 0}%</p>
                </div>
                <Bot className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {analytics?.velocity.change > 0 ? '+' : ''}{analytics?.velocity.change || 0}% this period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-charcoal border-charcoal-lighter">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Innovation Score</p>
                  <p className="text-3xl font-bold text-white">{analytics?.innovation.current || 0}%</p>
                </div>
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {analytics?.innovation.change > 0 ? '+' : ''}{analytics?.innovation.change || 0}% change
              </p>
            </CardContent>
          </Card>

          <Card className="bg-charcoal border-charcoal-lighter">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Collaboration</p>
                  <p className="text-3xl font-bold text-white">{analytics?.collaboration.current || 0}%</p>
                </div>
                <Heart className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {analytics?.collaboration.change > 0 ? '+' : ''}{analytics?.collaboration.change || 0}% change
              </p>
            </CardContent>
          </Card>

          <Card className="bg-charcoal border-charcoal-lighter">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Bug Rate</p>
                  <p className="text-3xl font-bold text-white">{analytics?.bugRate.current || 0}%</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {analytics?.bugRate.change > 0 ? '+' : ''}{analytics?.bugRate.change || 0}% change
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="live" className="space-y-6">
          <TabsList className="bg-charcoal-light border-charcoal-lighter">
            <TabsTrigger
              value="live"
              className="data-[state=active]:bg-white data-[state=active]:text-charcoal-dark"
            >
              <Activity className="w-4 h-4 mr-2" />
              Live Activity
            </TabsTrigger>
            <TabsTrigger
              value="ai-insights"
              className="data-[state=active]:bg-white data-[state=active]:text-charcoal-dark"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="data-[state=active]:bg-white data-[state=active]:text-charcoal-dark"
            >
              <Users className="w-4 h-4 mr-2" />
              Team Performance
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="data-[state=active]:bg-white data-[state=active]:text-charcoal-dark"
            >
              <Award className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-white data-[state=active]:text-charcoal-dark"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Deep Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Live Collaboration Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {liveSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 bg-charcoal-light rounded-lg border border-yellow-400/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-yellow-900 text-yellow-200">
                          {session.type}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-green-400 text-xs">LIVE</span>
                        </div>
                      </div>
                      <p className="text-white font-medium">
                        {session.repository}/{session.file}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex -space-x-2">
                          {session.participants.map((participantId) => {
                            const participant = teamMembers.find(
                              (m) => m.id === participantId,
                            );
                            return participant ? (
                              <Avatar
                                key={participant.id}
                                className="w-6 h-6 border-2 border-charcoal-dark"
                              >
                                <AvatarFallback className="text-xs">
                                  {participant.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                            ) : null;
                          })}
                        </div>
                        <span className="text-charcoal-lighter text-xs">
                          {session.startedAt}
                        </span>
                        <Button size="sm" variant="outline" className="ml-auto">
                          <Eye className="w-3 h-3 mr-1" />
                          Watch
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

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
                        className="flex items-center gap-3 p-3 bg-charcoal-light rounded-lg"
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
                          <p className="text-charcoal-lighter text-sm">
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
                          <p className="text-charcoal-light text-xs">
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
                    <Brain className="w-5 h-5 text-blue-400" />
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
                              <Badge className="bg-charcoal text-white">
                                {insight.type}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-charcoal-lighter">
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
                            <p className="text-charcoal-lighter text-sm mb-3">
                              {insight.description}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-charcoal-light">
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
                        className="p-4 bg-charcoal-light rounded-lg"
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
                            <div className="text-xs text-charcoal-lighter">
                              Quality Score
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-charcoal-lighter">
                                Fixes
                              </span>
                              <span className="text-white">
                                {member.stats.fixesThisWeek}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-charcoal-lighter">
                                Collaboration
                              </span>
                              <span className="text-white">
                                {member.stats.collaborationScore}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-charcoal-lighter">
                                Innovation
                              </span>
                              <span className="text-white">
                                {member.stats.innovationPoints}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-charcoal-lighter">
                                Mentoring
                              </span>
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
                                className="bg-charcoal text-charcoal-lighter text-xs"
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
              <Card>
                <CardHeader>
                  <CardTitle>Team Skill Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      "React",
                      "TypeScript",
                      "Node.js",
                      "Architecture",
                      "APIs",
                      "Performance",
                    ].map((skill) => (
                      <div
                        key={skill}
                        className="p-3 bg-charcoal-light rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">
                            {skill}
                          </span>
                          <div className="flex -space-x-1">
                            {teamMembers
                              .filter((m) => m.specialties.includes(skill))
                              .map((member) => (
                                <Avatar
                                  key={member.id}
                                  className="w-6 h-6 border-2 border-charcoal-dark"
                                >
                                  <AvatarFallback className="text-xs">
                                    {member.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                          </div>
                        </div>
                        <div className="w-full bg-charcoal h-2 rounded-full">
                          <div
                            className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full"
                            style={{ width: `${Math.random() * 50 + 50}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Team Achievements */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Team Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        name: "Quality Champions",
                        description: "90%+ quality for 30 days",
                        icon: "👑",
                        rarity: "legendary",
                        progress: 100,
                      },
                      {
                        name: "Speed Demons",
                        description: "1000+ fixes this month",
                        icon: "⚡",
                        rarity: "epic",
                        progress: 87,
                      },
                      {
                        name: "Collaboration Kings",
                        description: "50 pair sessions",
                        icon: "🤝",
                        rarity: "rare",
                        progress: 64,
                      },
                      {
                        name: "Bug Busters",
                        description: "Zero critical bugs",
                        icon: "🐛",
                        rarity: "epic",
                        progress: 100,
                      },
                    ].map((achievement) => (
                      <div
                        key={achievement.name}
                        className="p-4 bg-charcoal-light rounded-lg border border-yellow-400/30"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{achievement.icon}</span>
                          <div>
                            <p className="text-white font-medium">
                              {achievement.name}
                            </p>
                            <p className="text-charcoal-lighter text-xs">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-charcoal h-2 rounded-full">
                          <div
                            className={`h-2 rounded-full ${
                              achievement.progress === 100
                                ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                                : "bg-gradient-to-r from-blue-400 to-purple-400"
                            }`}
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-charcoal-light mt-1">
                          {achievement.progress}% complete
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

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
                          className="flex items-center gap-3 p-2 bg-charcoal-light rounded-lg"
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0
                                ? "bg-yellow-400 text-charcoal-dark"
                                : index === 1
                                  ? "bg-gray-400 text-charcoal-dark"
                                  : index === 2
                                    ? "bg-orange-600 text-white"
                                    : "bg-charcoal text-white"
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
                            <p className="text-charcoal-lighter text-xs">
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
                  <div className="h-64 flex items-center justify-center bg-charcoal-light rounded-lg">
                    <p className="text-charcoal-lighter">
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
                  <div className="h-64 flex items-center justify-center bg-charcoal-light rounded-lg">
                    <p className="text-charcoal-lighter">
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
