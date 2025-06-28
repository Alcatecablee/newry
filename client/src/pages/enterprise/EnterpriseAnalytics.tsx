import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Shield,
  Users,
  Building,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Crown,
  Star,
  Target,
  Zap,
  Award,
  Eye,
  Download,
  Calendar,
  Globe,
  Database,
  GitBranch,
  Code,
  Bug,
  Activity,
  PieChart,
  LineChart,
  BarChart,
  Settings,
  Filter,
  RefreshCw,
} from "lucide-react";

interface ExecutiveMetric {
  name: string;
  current: number;
  previous: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  status: "on-track" | "at-risk" | "exceeding" | "behind";
  impact: "revenue" | "efficiency" | "risk" | "quality";
}

interface ComplianceFramework {
  id: string;
  name: string;
  status: "compliant" | "partial" | "non-compliant" | "in-progress";
  score: number;
  lastAudit: string;
  nextAudit: string;
  requirements: ComplianceRequirement[];
  riskLevel: "low" | "medium" | "high" | "critical";
}

interface ComplianceRequirement {
  id: string;
  title: string;
  status: "met" | "partial" | "not-met" | "not-applicable";
  evidence: string[];
  lastReview: string;
  assignee: string;
}

interface OrganizationHealth {
  overall: number;
  dimensions: {
    security: number;
    quality: number;
    velocity: number;
    collaboration: number;
    innovation: number;
    compliance: number;
  };
  riskFactors: RiskFactor[];
  opportunities: Opportunity[];
}

interface RiskFactor {
  id: string;
  type: "security" | "compliance" | "operational" | "financial";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  impact: string;
  likelihood: number;
  mitigation: string[];
  owner: string;
  dueDate: string;
}

interface Opportunity {
  id: string;
  type: "efficiency" | "quality" | "cost-saving" | "innovation";
  title: string;
  description: string;
  potentialValue: string;
  effort: "low" | "medium" | "high";
  timeline: string;
  priority: number;
}

const EnterpriseAnalytics = () => {
  const [timeRange, setTimeRange] = useState<"quarter" | "year" | "ytd">(
    "quarter",
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [executiveView, setExecutiveView] = useState(true);

  const [executiveMetrics, setExecutiveMetrics] = useState<ExecutiveMetric[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExecutiveMetrics();
  }, []);

  const fetchExecutiveMetrics = async () => {
    try {
      const response = await fetch("/api/enterprise/analytics/executive");
      if (response.ok) {
        const data = await response.json();
        setExecutiveMetrics(data);
      }
    } catch (error) {
      console.error("Failed to fetch executive metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const complianceFrameworks: ComplianceFramework[] = [
    {
      id: "soc2",
      name: "SOC 2 Type II",
      status: "compliant",
      score: 96,
      lastAudit: "2024-01-15",
      nextAudit: "2024-07-15",
      riskLevel: "low",
      requirements: [
        {
          id: "1",
          title: "Security Policies and Procedures",
          status: "met",
          evidence: ["Security Manual v2.1", "Policy Review 2024-Q1"],
          lastReview: "2024-01-10",
          assignee: "Security Team",
        },
        {
          id: "2",
          title: "Access Controls",
          status: "met",
          evidence: ["SSO Implementation", "MFA Rollout"],
          lastReview: "2024-01-12",
          assignee: "IT Team",
        },
      ],
    },
    {
      id: "gdpr",
      name: "GDPR Compliance",
      status: "compliant",
      score: 98,
      lastAudit: "2024-01-10",
      nextAudit: "2025-01-10",
      riskLevel: "low",
      requirements: [
        {
          id: "1",
          title: "Data Protection Impact Assessment",
          status: "met",
          evidence: ["DPIA Report 2024", "Privacy Review"],
          lastReview: "2024-01-08",
          assignee: "Legal Team",
        },
      ],
    },
    {
      id: "iso27001",
      name: "ISO 27001",
      status: "in-progress",
      score: 78,
      lastAudit: "2023-12-15",
      nextAudit: "2024-06-15",
      riskLevel: "medium",
      requirements: [
        {
          id: "1",
          title: "Information Security Management System",
          status: "partial",
          evidence: ["ISMS Framework Draft"],
          lastReview: "2024-01-05",
          assignee: "Security Team",
        },
      ],
    },
  ];

  const organizationHealth: OrganizationHealth = {
    overall: 91,
    dimensions: {
      security: 94,
      quality: 89,
      velocity: 87,
      collaboration: 92,
      innovation: 85,
      compliance: 96,
    },
    riskFactors: [
      {
        id: "1",
        type: "security",
        severity: "medium",
        title: "Legacy System Dependencies",
        description:
          "Critical systems still depend on legacy components with known vulnerabilities",
        impact: "Potential security breach affecting customer data",
        likelihood: 35,
        mitigation: [
          "Upgrade plan development",
          "Enhanced monitoring",
          "Segmentation",
        ],
        owner: "Security Team",
        dueDate: "2024-03-31",
      },
      {
        id: "2",
        type: "compliance",
        severity: "low",
        title: "ISO 27001 Certification Gap",
        description: "Missing documentation for complete ISO 27001 compliance",
        impact: "Delayed certification affecting enterprise sales",
        likelihood: 20,
        mitigation: ["Documentation sprint", "External consultant engagement"],
        owner: "Compliance Team",
        dueDate: "2024-06-15",
      },
    ],
    opportunities: [
      {
        id: "1",
        type: "efficiency",
        title: "Automated Code Review Pipeline",
        description:
          "Implement automated code review to reduce manual review time by 60%",
        potentialValue: "$2.4M annually",
        effort: "medium",
        timeline: "3 months",
        priority: 1,
      },
      {
        id: "2",
        type: "cost-saving",
        title: "Legacy System Modernization",
        description: "Migrate legacy systems to reduce maintenance costs",
        potentialValue: "$1.8M annually",
        effort: "high",
        timeline: "12 months",
        priority: 2,
      },
    ],
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case "exceeding":
        return "text-green-400";
      case "on-track":
        return "text-blue-400";
      case "at-risk":
        return "text-yellow-400";
      case "behind":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "text-green-400";
      case "partial":
        return "text-yellow-400";
      case "non-compliant":
        return "text-red-400";
      case "in-progress":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const getRiskSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-green-900 text-green-200";
      case "medium":
        return "bg-yellow-900 text-yellow-200";
      case "high":
        return "bg-orange-900 text-orange-200";
      case "critical":
        return "bg-red-900 text-red-200";
      default:
        return "bg-gray-700 text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Executive Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Building className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Enterprise Analytics
                </h1>
                <p className="text-zinc-400">
                  Executive insights and compliance overview
                </p>
              </div>
            </div>
            <Badge className="bg-purple-900 text-purple-200 flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Executive Dashboard
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {(["quarter", "year", "ytd"] as const).map((range) => (
                <Button
                  key={range}
                  size="sm"
                  variant={timeRange === range ? "primary" : "ghost"}
                  onClick={() => setTimeRange(range)}
                  className="capitalize"
                >
                  {range === "ytd" ? "YTD" : range}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="primary" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          {executiveMetrics.map((metric, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div
                className={`absolute top-0 left-0 w-full h-1 ${
                  metric.status === "exceeding"
                    ? "bg-green-400"
                    : metric.status === "on-track"
                      ? "bg-blue-400"
                      : metric.status === "at-risk"
                        ? "bg-yellow-400"
                        : "bg-red-400"
                }`}
              />
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-400 text-xs uppercase tracking-wide">
                    {metric.name}
                  </span>
                  <div className="flex items-center">
                    {metric.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 text-green-400" />
                    ) : metric.trend === "down" ? (
                      <TrendingDown className="w-3 h-3 text-red-400" />
                    ) : (
                      <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                    )}
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {metric.current}
                  {metric.unit}
                </div>
                <div
                  className={`text-xs ${getMetricStatusColor(metric.status)}`}
                >
                  vs target: {metric.target}
                  {metric.unit}
                </div>
                <div className="text-xs text-zinc-400">
                  {metric.current > metric.previous ? "+" : ""}
                  {(
                    ((metric.current - metric.previous) / metric.previous) *
                    100
                  ).toFixed(1)}
                  % from last period
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="executive" className="space-y-6">
          <TabsList className="bg-zinc-900 border-zinc-800er">
            <TabsTrigger
              value="executive"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Crown className="w-4 h-4 mr-2" />
              Executive Overview
            </TabsTrigger>
            <TabsTrigger
              value="compliance"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Shield className="w-4 h-4 mr-2" />
              Compliance
            </TabsTrigger>
            <TabsTrigger
              value="risk"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Risk Management
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger
              value="roi"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              ROI Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="executive" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Organization Health */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    Organization Health Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-green-400">
                        {organizationHealth.overall}
                      </div>
                      <div className="text-zinc-400">Overall Health</div>
                    </div>

                    <div className="flex-1 space-y-4">
                      {Object.entries(organizationHealth.dimensions).map(
                        ([dimension, score]) => (
                          <div
                            key={dimension}
                            className="flex items-center justify-between"
                          >
                            <span className="text-white capitalize">
                              {dimension}
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
                              <span className="text-sm font-medium text-white w-8">
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

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-400" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Generate Executive Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Audit Review
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Shield className="w-4 h-4 mr-2" />
                      View Security Dashboard
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="w-4 h-4 mr-2" />
                      Team Performance Review
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Target className="w-4 h-4 mr-2" />
                      Set Quarterly Goals
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2Faab978f39ff64270b6e29ab49582f574%2F38b5bfac1a6242ebb67f91834016d010?format=webp&width=800"
                      alt="Logo"
                      className="w-5 h-5"
                    />
                    AI-Generated Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-900/20 border border-green-400/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-300 font-medium">
                          Exceeding Targets
                        </span>
                      </div>
                      <p className="text-green-200 text-sm">
                        Security vulnerability reduction is 40% ahead of target.
                        Current trajectory suggests achieving zero critical
                        vulnerabilities by Q2.
                      </p>
                    </div>

                    <div className="p-4 bg-blue-900/20 border border-blue-400/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-300 font-medium">
                          Opportunity Identified
                        </span>
                      </div>
                      <p className="text-blue-200 text-sm">
                        Code quality improvements are driving 23% faster issue
                        resolution. Consider scaling these practices across all
                        teams.
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-900/20 border border-yellow-400/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-300 font-medium">
                          Attention Required
                        </span>
                      </div>
                      <p className="text-yellow-200 text-sm">
                        ISO 27001 certification timeline at risk. Recommend
                        additional resources for documentation completion.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Business Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-900 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">
                          Cost Savings
                        </span>
                        <span className="text-green-400 font-bold">$4.2M</span>
                      </div>
                      <p className="text-zinc-400 text-sm">
                        Annual savings from improved code quality and reduced
                        bug fixing time
                      </p>
                    </div>

                    <div className="p-4 bg-zinc-900 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">
                          Risk Reduction
                        </span>
                        <span className="text-blue-400 font-bold">87%</span>
                      </div>
                      <p className="text-zinc-400 text-sm">
                        Decrease in security-related incidents compared to last
                        year
                      </p>
                    </div>

                    <div className="p-4 bg-zinc-900 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">
                          Developer Efficiency
                        </span>
                        <span className="text-purple-400 font-bold">+34%</span>
                      </div>
                      <p className="text-zinc-400 text-sm">
                        Improvement in developer productivity metrics
                        quarter-over-quarter
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compliance Frameworks */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Frameworks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {complianceFrameworks.map((framework) => (
                      <div
                        key={framework.id}
                        className="p-4 bg-zinc-900 rounded-lg border border-zinc-800er"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">
                              {framework.name}
                            </span>
                            <Badge
                              className={
                                framework.status === "compliant"
                                  ? "bg-green-900 text-green-200"
                                  : framework.status === "partial"
                                    ? "bg-yellow-900 text-yellow-200"
                                    : framework.status === "in-progress"
                                      ? "bg-blue-900 text-blue-200"
                                      : "bg-red-900 text-red-200"
                              }
                            >
                              {framework.status}
                            </Badge>
                          </div>
                          <div
                            className={`text-2xl font-bold ${getComplianceStatusColor(framework.status)}`}
                          >
                            {framework.score}%
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-zinc-400">Last Audit:</span>
                            <div className="text-white">
                              {framework.lastAudit}
                            </div>
                          </div>
                          <div>
                            <span className="text-zinc-400">Next Audit:</span>
                            <div className="text-white">
                              {framework.nextAudit}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <Badge
                            className={getRiskSeverityColor(
                              framework.riskLevel,
                            )}
                          >
                            {framework.riskLevel} risk
                          </Badge>
                          <span className="text-zinc-400 text-sm">
                            {framework.requirements.length} requirements
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Compliance Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        activity: "SOC 2 Type II Review",
                        date: "2024-02-15",
                        type: "review",
                        status: "upcoming",
                      },
                      {
                        activity: "GDPR Annual Assessment",
                        date: "2024-03-01",
                        type: "assessment",
                        status: "upcoming",
                      },
                      {
                        activity: "ISO 27001 Documentation",
                        date: "2024-03-31",
                        type: "milestone",
                        status: "in-progress",
                      },
                      {
                        activity: "Security Audit Q1",
                        date: "2024-04-15",
                        type: "audit",
                        status: "scheduled",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-zinc-900 rounded"
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            item.status === "upcoming"
                              ? "bg-yellow-400"
                              : item.status === "in-progress"
                                ? "bg-blue-400"
                                : "bg-green-400"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {item.activity}
                          </p>
                          <p className="text-zinc-400 text-sm">{item.date}</p>
                        </div>
                        <Badge className="bg-zinc-900 text-zinc-400 capitalize">
                          {item.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risk Factors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Active Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {organizationHealth.riskFactors.map((risk) => (
                      <div
                        key={risk.id}
                        className="p-4 bg-zinc-900 rounded-lg border border-zinc-800er"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                className={getRiskSeverityColor(risk.severity)}
                              >
                                {risk.severity}
                              </Badge>
                              <Badge className="bg-zinc-900 text-zinc-400 capitalize">
                                {risk.type}
                              </Badge>
                            </div>
                            <p className="text-white font-medium">
                              {risk.title}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-zinc-400">
                              Likelihood
                            </div>
                            <div className="text-white font-bold">
                              {risk.likelihood}%
                            </div>
                          </div>
                        </div>

                        <p className="text-zinc-400 text-sm mb-3">
                          {risk.description}
                        </p>

                        <div className="space-y-2">
                          <div>
                            <span className="text-zinc-400 text-xs">
                              Impact:
                            </span>
                            <p className="text-white text-sm">{risk.impact}</p>
                          </div>
                          <div>
                            <span className="text-zinc-400 text-xs">
                              Owner:
                            </span>
                            <span className="text-white text-sm ml-2">
                              {risk.owner}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-400 text-xs">
                              Due Date:
                            </span>
                            <span className="text-white text-sm ml-2">
                              {risk.dueDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Opportunities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Strategic Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {organizationHealth.opportunities.map((opportunity) => (
                      <div
                        key={opportunity.id}
                        className="p-4 bg-zinc-900 rounded-lg border border-zinc-800er"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                className={`${
                                  opportunity.effort === "low"
                                    ? "bg-green-900 text-green-200"
                                    : opportunity.effort === "medium"
                                      ? "bg-yellow-900 text-yellow-200"
                                      : "bg-red-900 text-red-200"
                                }`}
                              >
                                {opportunity.effort} effort
                              </Badge>
                              <Badge className="bg-zinc-900 text-zinc-400 capitalize">
                                {opportunity.type}
                              </Badge>
                            </div>
                            <p className="text-white font-medium">
                              {opportunity.title}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-zinc-400">
                              Priority
                            </div>
                            <div className="text-white font-bold">
                              #{opportunity.priority}
                            </div>
                          </div>
                        </div>

                        <p className="text-zinc-400 text-sm mb-3">
                          {opportunity.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-zinc-400 text-xs">
                              Value:
                            </span>
                            <span className="text-green-400 text-sm font-bold ml-2">
                              {opportunity.potentialValue}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-400 text-xs">
                              Timeline:
                            </span>
                            <span className="text-white text-sm ml-2">
                              {opportunity.timeline}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-zinc-900 rounded-lg">
                    <p className="text-zinc-400">
                      Performance trend charts would be here
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-zinc-900 rounded-lg">
                    <p className="text-zinc-400">
                      Quality metrics visualization
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Posture</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-zinc-900 rounded-lg">
                    <p className="text-zinc-400">Security metrics dashboard</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-zinc-900 rounded-lg">
                    <p className="text-zinc-400">Compliance trend analysis</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="roi" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cost Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">
                      $4.2M
                    </div>
                    <div className="text-zinc-400 text-sm">Annual Savings</div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Bug Fix Reduction</span>
                      <span className="text-white">$2.1M</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Security Incidents</span>
                      <span className="text-white">$1.5M</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Compliance Fines</span>
                      <span className="text-white">$0.6M</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Productivity Gains</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-400 mb-2">
                      34%
                    </div>
                    <div className="text-zinc-400 text-sm">
                      Efficiency Increase
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Code Review Time</span>
                      <span className="text-white">-45%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Issue Resolution</span>
                      <span className="text-white">-58%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Deploy Frequency</span>
                      <span className="text-white">+67%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ROI Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-400 mb-2">
                      340%
                    </div>
                    <div className="text-zinc-400 text-sm">
                      Return on Investment
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Investment</span>
                      <span className="text-white">$1.2M</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Annual Return</span>
                      <span className="text-white">$4.2M</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Payback Period</span>
                      <span className="text-white">3.4 months</span>
                    </div>
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

export default EnterpriseAnalytics;
