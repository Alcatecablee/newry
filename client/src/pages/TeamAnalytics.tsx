import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Code,
  GitBranch,
  Flame,
  Award,
  Lightbulb,
  Rocket,
  Eye,
  Heart,
  Star,
  Crown,
  Timer,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

interface MetricTrend {
  current: number;
  previous: number;
  change: number;
  trend: "up" | "down" | "stable";
  target?: number;
  projection?: number;
}

interface TeamMetrics {
  codeQuality: MetricTrend;
  velocity: MetricTrend;
  collaboration: MetricTrend;
  bugRate: MetricTrend;
  techDebt: MetricTrend;
  innovation: MetricTrend;
}

interface PredictiveInsight {
  id: string;
  type: "forecast" | "risk" | "opportunity" | "recommendation";
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
  impact: "low" | "medium" | "high" | "critical";
  metrics: string[];
  actionable: boolean;
  suggestedActions: string[];
}

interface TeamHealthScore {
  overall: number;
  categories: {
    quality: number;
    velocity: number;
    collaboration: number;
    innovation: number;
    satisfaction: number;
  };
  trend: "improving" | "declining" | "stable";
  riskFactors: string[];
  strengths: string[];
}

const TeamAnalytics = () => {
  const [timeRange, setTimeRange] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");
  const [selectedMetric, setSelectedMetric] = useState<string>("overview");
  const [predictiveMode, setPredictiveMode] = useState(true);

  // Get real analytics data from API
  const teamMetrics: TeamMetrics = analyticsData ? {
    codeQuality: analyticsData.codeQuality,
    velocity: analyticsData.velocity,
    collaboration: analyticsData.collaboration,
    bugRate: analyticsData.bugRate,
    },
    techDebt: {
      current: 23,
      previous: 28,
      change: -17.9,
      trend: "up", // down is good for tech debt
      target: 20,
      projection: 19,
    },
    innovation: {
      current: 78,
      previous: 72,
      change: 8.3,
      trend: "up",
      target: 80,
      projection: 82,
    },
  };

  const teamHealthScore: TeamHealthScore = {
    overall: 91,
    categories: {
      quality: 94,
      velocity: 87,
      collaboration: 92,
      innovation: 78,
      satisfaction: 89,
    },
    trend: "improving",
    riskFactors: [
      "Collaboration score declining",
      "Innovation below target",
      "Potential burnout in Q4",
    ],
    strengths: [
      "Exceptional code quality",
      "Strong velocity improvement",
      "Low bug rate",
      "Decreasing tech debt",
    ],
  };

  const predictiveInsights: PredictiveInsight[] = [
    {
      id: "1",
      type: "forecast",
      title: "Team Will Hit Quality Target Next Month",
      description:
        "Based on current trends, the team is on track to achieve 95% quality score by end of February",
      confidence: 87,
      timeframe: "4 weeks",
      impact: "medium",
      metrics: ["codeQuality", "bugRate"],
      actionable: false,
      suggestedActions: [],
    },
    {
      id: "2",
      type: "risk",
      title: "Collaboration Declining - Intervention Needed",
      description:
        "Collaboration score has dropped 2.1% and is projected to decline further without intervention",
      confidence: 92,
      timeframe: "2 weeks",
      impact: "high",
      metrics: ["collaboration"],
      actionable: true,
      suggestedActions: [
        "Schedule team building activities",
        "Increase pair programming sessions",
        "Review communication tools",
        "Host knowledge sharing sessions",
      ],
    },
    {
      id: "3",
      type: "opportunity",
      title: "Innovation Score Acceleration Opportunity",
      description:
        "Team is ready for advanced challenges - innovation could increase 15% with right projects",
      confidence: 79,
      timeframe: "6 weeks",
      impact: "high",
      metrics: ["innovation", "satisfaction"],
      actionable: true,
      suggestedActions: [
        "Introduce hackathon projects",
        "Allocate 20% time for experimentation",
        "Provide access to new technologies",
        "Create innovation challenges",
      ],
    },
    {
      id: "4",
      type: "recommendation",
      title: "Optimize Sprint Planning Process",
      description:
        "AI analysis suggests changing sprint length from 2 to 3 weeks could improve velocity by 12%",
      confidence: 84,
      timeframe: "Next sprint",
      impact: "medium",
      metrics: ["velocity", "satisfaction"],
      actionable: true,
      suggestedActions: [
        "Test 3-week sprint cycle",
        "Adjust story point estimation",
        "Update retrospective schedule",
        "Modify planning meetings",
      ],
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-400";
      case "down":
        return "text-red-400";
      default:
        return "text-yellow-400";
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "forecast":
        return "border-blue-400 bg-blue-900/20";
      case "risk":
        return "border-red-400 bg-red-900/20";
      case "opportunity":
        return "border-green-400 bg-green-900/20";
      case "recommendation":
        return "border-purple-400 bg-purple-900/20";
      default:
        return "border-zinc-800 bg-zinc-900";
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 75) return "text-yellow-400";
    if (score >= 60) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Advanced Team Analytics
            </h1>
            <p className="text-zinc-400">
              AI-powered insights and predictive analytics for your development
              team
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {(["week", "month", "quarter", "year"] as const).map((range) => (
                <Button
                  key={range}
                  size="sm"
                  variant={timeRange === range ? "primary" : "ghost"}
                  onClick={() => setTimeRange(range)}
                  className="capitalize"
                >
                  {range}
                </Button>
              ))}
            </div>
            <Button
              size="sm"
              variant={predictiveMode ? "primary" : "ghost"}
              onClick={() => setPredictiveMode(!predictiveMode)}
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Faab978f39ff64270b6e29ab49582f574%2F38b5bfac1a6242ebb67f91834016d010?format=webp&width=800"
                alt="Logo"
                className="w-3 h-3 mr-1"
              />
              AI Predictions
            </Button>
          </div>
        </div>

        {/* Team Health Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                Team Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div
                    className={`text-6xl font-bold ${getHealthScoreColor(teamHealthScore.overall)}`}
                  >
                    {teamHealthScore.overall}
                  </div>
                  <div className="text-zinc-400">Overall Health</div>
                  <Badge
                    className={`mt-2 ${
                      teamHealthScore.trend === "improving"
                        ? "bg-green-900 text-green-200"
                        : teamHealthScore.trend === "declining"
                          ? "bg-red-900 text-red-200"
                          : "bg-yellow-900 text-yellow-200"
                    }`}
                  >
                    {teamHealthScore.trend}
                  </Badge>
                </div>

                <div className="flex-1 space-y-4">
                  {Object.entries(teamHealthScore.categories).map(
                    ([category, score]) => (
                      <div
                        key={category}
                        className="flex items-center justify-between"
                      >
                        <span className="text-white capitalize">
                          {category}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-zinc-900 h-2 rounded-full">
                            <div
                              className={`h-2 rounded-full ${
                                score >= 90
                                  ? "bg-green-400"
                                  : score >= 75
                                    ? "bg-yellow-400"
                                    : score >= 60
                                      ? "bg-orange-400"
                                      : "bg-red-400"
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span
                            className={`text-sm font-medium ${getHealthScoreColor(score)}`}
                          >
                            {score}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Health Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Strengths
                  </h4>
                  <div className="space-y-1">
                    {teamHealthScore.strengths.map((strength, index) => (
                      <p key={index} className="text-green-200 text-sm">
                        • {strength}
                      </p>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Risk Factors
                  </h4>
                  <div className="space-y-1">
                    {teamHealthScore.riskFactors.map((risk, index) => (
                      <p key={index} className="text-red-200 text-sm">
                        • {risk}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          {Object.entries(teamMetrics).map(([key, metric]) => (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-400 text-sm capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {key === "bugRate" || key === "techDebt"
                    ? `${metric.current}${key === "bugRate" ? "%" : ""}`
                    : `${metric.current}${key !== "techDebt" ? "%" : ""}`}
                </div>
                <div className={`text-xs ${getTrendColor(metric.trend)}`}>
                  {metric.change > 0 ? "+" : ""}
                  {metric.change.toFixed(1)}% vs last {timeRange}
                </div>
                {predictiveMode && metric.projection && (
                  <div className="text-xs text-blue-300 mt-1">
                    Projected: {metric.projection}%
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="bg-zinc-900 border-zinc-800er">
            <TabsTrigger
              value="insights"
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
              value="trends"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Target className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger
              value="predictions"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Eye className="w-4 h-4 mr-2" />
              Predictions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2Faab978f39ff64270b6e29ab49582f574%2F38b5bfac1a6242ebb67f91834016d010?format=webp&width=800"
                      alt="Logo"
                      className="w-5 h-5"
                    />
                    Predictive Analytics & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictiveInsights.map((insight) => (
                      <div
                        key={insight.id}
                        className={`p-6 rounded-lg border ${getInsightColor(insight.type)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className="bg-zinc-900 text-white capitalize">
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
                                {insight.impact} impact
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-zinc-400" />
                                <span className="text-xs text-zinc-400">
                                  {insight.timeframe}
                                </span>
                              </div>
                            </div>

                            <h3 className="text-white font-semibold text-lg mb-2">
                              {insight.title}
                            </h3>
                            <p className="text-zinc-400 mb-4">
                              {insight.description}
                            </p>

                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs text-zinc-400">
                                Affected metrics:
                              </span>
                              {insight.metrics.map((metric) => (
                                <Badge
                                  key={metric}
                                  className="bg-zinc-900 text-zinc-400 text-xs"
                                >
                                  {metric}
                                </Badge>
                              ))}
                            </div>

                            {insight.actionable &&
                              insight.suggestedActions.length > 0 && (
                                <div>
                                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4" />
                                    Suggested Actions:
                                  </h4>
                                  <div className="space-y-1">
                                    {insight.suggestedActions.map(
                                      (action, index) => (
                                        <p
                                          key={index}
                                          className="text-zinc-400 text-sm"
                                        >
                                          • {action}
                                        </p>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>

                          {insight.actionable && (
                            <div className="flex flex-col gap-2 ml-6">
                              <Button size="sm" variant="primary">
                                <Rocket className="w-3 h-3 mr-1" />
                                Implement
                              </Button>
                              <Button size="sm" variant="outline">
                                <Calendar className="w-3 h-3 mr-1" />
                                Schedule
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

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quality Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-zinc-900 rounded-lg">
                    <p className="text-zinc-400">
                      Quality trend chart visualization
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Velocity Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-zinc-900 rounded-lg">
                    <p className="text-zinc-400">Velocity pattern analysis</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Collaboration Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-zinc-900 rounded-lg">
                    <p className="text-zinc-400">
                      Team collaboration network visualization
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Innovation Index</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-zinc-900 rounded-lg">
                    <p className="text-zinc-400">
                      Innovation metrics and patterns
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sprint Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { sprint: "Sprint 23", completion: 94, velocity: 87 },
                      { sprint: "Sprint 22", completion: 89, velocity: 82 },
                      { sprint: "Sprint 21", completion: 92, velocity: 85 },
                      { sprint: "Sprint 20", completion: 87, velocity: 79 },
                    ].map((sprint) => (
                      <div
                        key={sprint.sprint}
                        className="p-3 bg-zinc-900 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">
                            {sprint.sprint}
                          </span>
                          <Badge className="bg-green-900 text-green-200">
                            {sprint.completion}% complete
                          </Badge>
                        </div>
                        <div className="w-full bg-zinc-900 h-2 rounded-full">
                          <div
                            className="bg-zinc-600 h-2 rounded-full"
                            style={{ width: `${sprint.completion}%` }}
                          />
                        </div>
                        <p className="text-zinc-400 text-xs mt-1">
                          Velocity: {sprint.velocity} points
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Code Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { metric: "Test Coverage", value: 92, target: 95 },
                      {
                        metric: "Code Duplication",
                        value: 3.2,
                        target: 5,
                        reverse: true,
                      },
                      {
                        metric: "Cyclomatic Complexity",
                        value: 2.8,
                        target: 3,
                        reverse: true,
                      },
                      { metric: "Documentation", value: 87, target: 90 },
                    ].map((item) => (
                      <div
                        key={item.metric}
                        className="flex items-center justify-between"
                      >
                        <span className="text-white">{item.metric}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-zinc-900 h-2 rounded-full">
                            <div
                              className={`h-2 rounded-full ${
                                item.reverse
                                  ? item.value <= item.target
                                    ? "bg-green-400"
                                    : "bg-red-400"
                                  : item.value >= item.target
                                    ? "bg-green-400"
                                    : "bg-yellow-400"
                              }`}
                              style={{
                                width: `${item.reverse ? 100 - (item.value / item.target) * 50 : (item.value / 100) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-white">
                            {item.value}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Individual Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Sarah Chen", score: 96, trend: "up" },
                      { name: "Alex Kim", score: 89, trend: "up" },
                      { name: "Mike Rodriguez", score: 84, trend: "stable" },
                    ].map((member) => (
                      <div
                        key={member.name}
                        className="flex items-center justify-between p-2 bg-zinc-900 rounded"
                      >
                        <span className="text-white text-sm">
                          {member.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm">
                            {member.score}
                          </span>
                          {getTrendIcon(member.trend)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-400" />
                    30-Day Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(teamMetrics).map(([key, metric]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg"
                      >
                        <span className="text-white capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-400 text-sm">
                            Current: {metric.current}%
                          </span>
                          <span className="text-purple-300 text-sm font-medium">
                            Predicted: {metric.projection}%
                          </span>
                          {metric.projection &&
                          metric.projection > metric.current ? (
                            <ArrowUp className="w-4 h-4 text-green-400" />
                          ) : metric.projection &&
                            metric.projection < metric.current ? (
                            <ArrowDown className="w-4 h-4 text-red-400" />
                          ) : (
                            <Minus className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-400" />
                    Goal Achievement Probability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        goal: "Reach 95% Code Quality",
                        probability: 87,
                        timeline: "4 weeks",
                      },
                      {
                        goal: "90% Velocity Target",
                        probability: 94,
                        timeline: "2 weeks",
                      },
                      {
                        goal: "Zero Critical Bugs",
                        probability: 76,
                        timeline: "6 weeks",
                      },
                      {
                        goal: "Innovation Score 80+",
                        probability: 82,
                        timeline: "8 weeks",
                      },
                    ].map((goal) => (
                      <div
                        key={goal.goal}
                        className="p-3 bg-zinc-900 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">
                            {goal.goal}
                          </span>
                          <Badge
                            className={`${
                              goal.probability >= 80
                                ? "bg-green-900 text-green-200"
                                : goal.probability >= 60
                                  ? "bg-yellow-900 text-yellow-200"
                                  : "bg-red-900 text-red-200"
                            }`}
                          >
                            {goal.probability}%
                          </Badge>
                        </div>
                        <div className="w-full bg-zinc-900 h-2 rounded-full">
                          <div
                            className={`h-2 rounded-full ${
                              goal.probability >= 80
                                ? "bg-green-400"
                                : goal.probability >= 60
                                  ? "bg-yellow-400"
                                  : "bg-red-400"
                            }`}
                            style={{ width: `${goal.probability}%` }}
                          />
                        </div>
                        <p className="text-zinc-400 text-xs mt-1">
                          Expected timeline: {goal.timeline}
                        </p>
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

export default TeamAnalytics;