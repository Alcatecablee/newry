import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Target,
  Users,
  DollarSign,
  Crown,
  Star,
  Award,
  Rocket,
  Globe,
  Building,
  Zap,
  Shield,
  Brain,
  Heart,
  Eye,
  MessageSquare,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Download,
  Share,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Plus,
  Filter,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";

interface MarketSegment {
  id: string;
  name: string;
  size: string;
  growth: number;
  targetable: number;
  painPoints: string[];
  value_props: string[];
  competition: CompetitorInfo[];
  priority: "high" | "medium" | "low";
}

interface CompetitorInfo {
  name: string;
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
  pricing: string;
}

interface GTMStrategy {
  phase: string;
  timeline: string;
  objectives: string[];
  tactics: string[];
  metrics: GTMMetric[];
  budget: number;
  owner: string;
  status: "planning" | "in-progress" | "completed" | "delayed";
}

interface GTMMetric {
  name: string;
  target: number;
  current: number;
  unit: string;
  trend: "up" | "down" | "stable";
}

interface CustomerPersona {
  id: string;
  name: string;
  title: string;
  company_size: string;
  pain_points: string[];
  motivations: string[];
  decision_factors: string[];
  preferred_channels: string[];
  avatar: string;
  urgency: "high" | "medium" | "low";
}

interface ValueProposition {
  id: string;
  title: string;
  description: string;
  target_persona: string[];
  evidence: string[];
  differentiator: string;
  impact: "high" | "medium" | "low";
  messaging: string;
}

const MarketPositioning = () => {
  const [selectedSegment, setSelectedSegment] = useState<string>("enterprise");
  const [gtmPhase, setGTMPhase] = useState<string>("launch");

  // Mock data - would come from market research and strategy APIs
  const marketSegments: MarketSegment[] = [
    {
      id: "enterprise",
      name: "Enterprise Development Teams",
      size: "$12.4B",
      growth: 18.5,
      targetable: 85,
      painPoints: [
        "Legacy code maintenance costs",
        "Security vulnerability management",
        "Slow development cycles",
        "Compliance requirements",
        "Technical debt accumulation",
      ],
      value_props: [
        "Automated code modernization",
        "Enterprise-grade security",
        "Compliance reporting",
        "ROI measurement",
        "Team productivity gains",
      ],
      competition: [
        {
          name: "SonarQube",
          marketShare: 34,
          strengths: ["Established brand", "Enterprise features"],
          weaknesses: ["No AI automation", "Complex setup"],
          pricing: "$150-300/dev/month",
        },
        {
          name: "Veracode",
          marketShare: 28,
          strengths: ["Security focus", "Compliance"],
          weaknesses: ["Limited code fixing", "High cost"],
          pricing: "$250-500/dev/month",
        },
      ],
      priority: "high",
    },
    {
      id: "mid-market",
      name: "Mid-Market Tech Companies",
      size: "$4.8B",
      growth: 23.2,
      targetable: 78,
      painPoints: [
        "Limited DevOps resources",
        "Scaling development teams",
        "Code quality consistency",
        "Time to market pressure",
      ],
      value_props: [
        "Rapid onboarding",
        "Automated best practices",
        "Team standardization",
        "Cost-effective scaling",
      ],
      competition: [
        {
          name: "ESLint + Prettier",
          marketShare: 45,
          strengths: ["Free", "Popular"],
          weaknesses: ["Manual setup", "No AI"],
          pricing: "Free",
        },
      ],
      priority: "medium",
    },
    {
      id: "startups",
      name: "High-Growth Startups",
      size: "$2.1B",
      growth: 34.7,
      targetable: 92,
      painPoints: [
        "Fast-paced development",
        "Technical debt from rapid scaling",
        "Limited senior developer time",
        "Investor scrutiny on quality",
      ],
      value_props: [
        "Instant best practices",
        "Technical debt prevention",
        "Senior developer efficiency",
        "Investor-ready quality metrics",
      ],
      competition: [
        {
          name: "GitHub Copilot",
          marketShare: 52,
          strengths: ["AI assistance", "GitHub integration"],
          weaknesses: ["Individual focus", "No team features"],
          pricing: "$10-19/dev/month",
        },
      ],
      priority: "high",
    },
  ];

  const customerPersonas: CustomerPersona[] = [
    {
      id: "cto",
      name: "Sarah Chen",
      title: "CTO / VP Engineering",
      company_size: "500-2000 employees",
      pain_points: [
        "Balancing innovation with code quality",
        "Managing technical debt at scale",
        "Ensuring security compliance",
        "Demonstrating engineering ROI",
      ],
      motivations: [
        "Team productivity",
        "Risk mitigation",
        "Competitive advantage",
        "Career advancement",
      ],
      decision_factors: [
        "ROI measurement",
        "Enterprise security",
        "Integration capabilities",
        "Vendor stability",
      ],
      preferred_channels: [
        "Industry conferences",
        "Peer recommendations",
        "Technical blogs",
        "Executive demos",
      ],
      avatar: "👩‍💼",
      urgency: "high",
    },
    {
      id: "dev-lead",
      name: "Alex Rodriguez",
      title: "Development Team Lead",
      company_size: "100-500 employees",
      pain_points: [
        "Code review bottlenecks",
        "Inconsistent code quality",
        "Onboarding new developers",
        "Meeting delivery deadlines",
      ],
      motivations: [
        "Team efficiency",
        "Code quality",
        "Developer satisfaction",
        "Personal growth",
      ],
      decision_factors: [
        "Ease of use",
        "Team adoption",
        "Integration with tools",
        "Cost effectiveness",
      ],
      preferred_channels: [
        "Developer communities",
        "GitHub/GitLab",
        "Technical documentation",
        "Free trials",
      ],
      avatar: "👨‍💻",
      urgency: "medium",
    },
    {
      id: "devops",
      name: "Morgan Kim",
      title: "DevOps Engineer",
      company_size: "50-200 employees",
      pain_points: [
        "Pipeline complexity",
        "Security scanning overhead",
        "Tool integration challenges",
        "Deployment reliability",
      ],
      motivations: ["Automation", "Reliability", "Security", "Efficiency"],
      decision_factors: [
        "API quality",
        "CI/CD integration",
        "Monitoring capabilities",
        "Support quality",
      ],
      preferred_channels: [
        "DevOps communities",
        "Technical workshops",
        "Documentation",
        "Open source contributions",
      ],
      avatar: "⚙️",
      urgency: "medium",
    },
  ];

  const valuePropositions: ValueProposition[] = [
    {
      id: "ai-automation",
      title: "AI-Powered Code Transformation",
      description:
        "Automatically modernize legacy code with enterprise-grade AI that understands your team's patterns",
      target_persona: ["cto", "dev-lead"],
      evidence: [
        "89% reduction in manual code fixes",
        "340% ROI in first year",
        "50+ million lines of code processed",
      ],
      differentiator: "Only solution with team-specific AI learning",
      impact: "high",
      messaging:
        "Transform your codebase from months to minutes with AI that learns your team's style",
    },
    {
      id: "team-collaboration",
      title: "Real-time Team Collaboration",
      description:
        "Figma-like experience for code quality with live sessions, pair programming, and team challenges",
      target_persona: ["dev-lead", "devops"],
      evidence: [
        "67% faster code review cycles",
        "94% developer adoption rate",
        "45% improvement in team collaboration scores",
      ],
      differentiator: "First collaborative code quality platform",
      impact: "high",
      messaging:
        "Make code quality a team sport with real-time collaboration features",
    },
    {
      id: "enterprise-security",
      title: "Enterprise Security & Compliance",
      description:
        "SOC2, GDPR, ISO27001 compliant with advanced security features and audit trails",
      target_persona: ["cto"],
      evidence: [
        "SOC2 Type II certified",
        "99.9% uptime SLA",
        "Zero security incidents",
      ],
      differentiator: "Built for enterprise from day one",
      impact: "high",
      messaging:
        "Enterprise-grade security without compromising developer experience",
    },
    {
      id: "roi-measurement",
      title: "Measurable ROI & Analytics",
      description:
        "Executive dashboards with clear ROI metrics, cost savings, and productivity improvements",
      target_persona: ["cto"],
      evidence: [
        "Average $4.2M annual savings",
        "Executive dashboards for 500+ companies",
        "95% customer renewal rate",
      ],
      differentiator: "Only platform with executive-grade analytics",
      impact: "medium",
      messaging: "Prove engineering value with comprehensive ROI measurement",
    },
  ];

  const gtmStrategies: GTMStrategy[] = [
    {
      phase: "Product-Market Fit Validation",
      timeline: "Q1 2024",
      objectives: [
        "Validate enterprise value proposition",
        "Achieve 10 enterprise pilot customers",
        "Refine pricing strategy",
        "Build customer success processes",
      ],
      tactics: [
        "Executive interview program",
        "Pilot customer program",
        "Competitive analysis",
        "Value engineering sessions",
      ],
      metrics: [
        {
          name: "Pilot Customers",
          target: 10,
          current: 7,
          unit: "customers",
          trend: "up",
        },
        {
          name: "NPS Score",
          target: 50,
          current: 47,
          unit: "points",
          trend: "up",
        },
        {
          name: "Product-Market Fit Score",
          target: 40,
          current: 35,
          unit: "%",
          trend: "up",
        },
      ],
      budget: 250000,
      owner: "Product Team",
      status: "in-progress",
    },
    {
      phase: "Go-to-Market Launch",
      timeline: "Q2 2024",
      objectives: [
        "Launch enterprise tier",
        "Acquire 100 enterprise customers",
        "Build sales and marketing teams",
        "Establish partner channel",
      ],
      tactics: [
        "Enterprise tier launch",
        "Sales team hiring",
        "Marketing automation setup",
        "Partner program launch",
      ],
      metrics: [
        {
          name: "Enterprise Customers",
          target: 100,
          current: 0,
          unit: "customers",
          trend: "stable",
        },
        {
          name: "Sales Team Size",
          target: 5,
          current: 2,
          unit: "people",
          trend: "up",
        },
        {
          name: "Marketing Qualified Leads",
          target: 500,
          current: 0,
          unit: "leads",
          trend: "stable",
        },
      ],
      budget: 1500000,
      owner: "GTM Team",
      status: "planning",
    },
    {
      phase: "Scale & Expansion",
      timeline: "Q3-Q4 2024",
      objectives: [
        "Scale to $10M ARR",
        "International expansion",
        "Platform ecosystem",
        "Category leadership",
      ],
      tactics: [
        "International sales",
        "Integration marketplace",
        "Thought leadership",
        "Category creation",
      ],
      metrics: [
        {
          name: "ARR",
          target: 10000000,
          current: 0,
          unit: "$",
          trend: "stable",
        },
        {
          name: "International Revenue",
          target: 30,
          current: 0,
          unit: "%",
          trend: "stable",
        },
        {
          name: "Integration Partners",
          target: 20,
          current: 0,
          unit: "partners",
          trend: "stable",
        },
      ],
      budget: 5000000,
      owner: "Executive Team",
      status: "planning",
    },
  ];

  const getSegmentPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-900 text-red-200";
      case "medium":
        return "bg-yellow-900 text-yellow-200";
      case "low":
        return "bg-green-900 text-green-200";
      default:
        return "bg-gray-700 text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-900 text-green-200";
      case "in-progress":
        return "bg-blue-900 text-blue-200";
      case "planning":
        return "bg-yellow-900 text-yellow-200";
      case "delayed":
        return "bg-red-900 text-red-200";
      default:
        return "bg-gray-700 text-gray-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "down":
        return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
      default:
        return <div className="w-4 h-4 bg-yellow-400 rounded-full" />;
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-green-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Market Positioning & GTM
                </h1>
                <p className="text-zinc-400">
                  Strategic market analysis and go-to-market execution
                </p>
              </div>
            </div>
            <Badge className="bg-green-900 text-green-200 flex items-center gap-1">
              <Rocket className="w-3 h-3" />
              Launch Ready
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Strategy
            </Button>
            <Button variant="primary" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Strategy Settings
            </Button>
          </div>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">
                    Total Market Size
                  </p>
                  <p className="text-3xl font-bold text-white">$19.3B</p>
                </div>
                <Globe className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-xs text-green-400 mt-2">22% CAGR</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">
                    Addressable Market
                  </p>
                  <p className="text-3xl font-bold text-green-400">$16.1B</p>
                </div>
                <Target className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-xs text-green-400 mt-2">83% addressable</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">
                    Market Position
                  </p>
                  <p className="text-3xl font-bold text-purple-400">#2</p>
                </div>
                <Trophy className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-xs text-purple-400 mt-2">AI-first category</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">
                    Competition Score
                  </p>
                  <p className="text-3xl font-bold text-yellow-400">8.7</p>
                </div>
                <Award className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-xs text-yellow-400 mt-2">
                Strong differentiation
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="segments" className="space-y-6">
          <TabsList className="bg-zinc-900 border-zinc-800er">
            <TabsTrigger
              value="segments"
              className="data-[state=active]:bg-white data-[state=active]:text-charcoal-dark"
            >
              <Users className="w-4 h-4 mr-2" />
              Market Segments
            </TabsTrigger>
            <TabsTrigger
              value="personas"
              className="data-[state=active]:bg-white data-[state=active]:text-charcoal-dark"
            >
              <Eye className="w-4 h-4 mr-2" />
              Customer Personas
            </TabsTrigger>
            <TabsTrigger
              value="value-props"
              className="data-[state=active]:bg-white data-[state=active]:text-charcoal-dark"
            >
              <Star className="w-4 h-4 mr-2" />
              Value Propositions
            </TabsTrigger>
            <TabsTrigger
              value="gtm-strategy"
              className="data-[state=active]:bg-white data-[state=active]:text-charcoal-dark"
            >
              <Rocket className="w-4 h-4 mr-2" />
              GTM Strategy
            </TabsTrigger>
            <TabsTrigger
              value="competitive"
              className="data-[state=active]:bg-white data-[state=active]:text-charcoal-dark"
            >
              <Shield className="w-4 h-4 mr-2" />
              Competitive Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="segments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {marketSegments.map((segment) => (
                <Card
                  key={segment.id}
                  className={`cursor-pointer transition-colors ${
                    selectedSegment === segment.id
                      ? "border-blue-400 bg-blue-900/10"
                      : ""
                  }`}
                  onClick={() => setSelectedSegment(segment.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{segment.name}</CardTitle>
                      <Badge
                        className={getSegmentPriorityColor(segment.priority)}
                      >
                        {segment.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-zinc-400 text-sm">
                            Market Size
                          </p>
                          <p className="text-white font-bold">{segment.size}</p>
                        </div>
                        <div>
                          <p className="text-zinc-400 text-sm">
                            Growth Rate
                          </p>
                          <p className="text-green-400 font-bold">
                            +{segment.growth}%
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-zinc-400 text-sm mb-2">
                          Top Pain Points:
                        </p>
                        <div className="space-y-1">
                          {segment.painPoints.slice(0, 3).map((pain, index) => (
                            <p key={index} className="text-white text-xs">
                              • {pain}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-zinc-400 text-sm mb-1">
                          Targetable Market
                        </p>
                        <div className="w-full bg-charcoal h-2 rounded-full">
                          <div
                            className="bg-blue-400 h-2 rounded-full"
                            style={{ width: `${segment.targetable}%` }}
                          />
                        </div>
                        <p className="text-blue-400 text-xs mt-1">
                          {segment.targetable}% addressable
                        </p>
                      </div>

                      <div>
                        <p className="text-zinc-400 text-sm">
                          Key Competitors:
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {segment.competition.map((comp) => (
                            <Badge
                              key={comp.name}
                              className="bg-charcoal text-zinc-400 text-xs"
                            >
                              {comp.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="personas" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {customerPersonas.map((persona) => (
                <Card key={persona.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{persona.avatar}</span>
                      <div>
                        <CardTitle className="text-lg">
                          {persona.name}
                        </CardTitle>
                        <p className="text-zinc-400 text-sm">
                          {persona.title}
                        </p>
                        <Badge
                          className={`text-xs ${
                            persona.urgency === "high"
                              ? "bg-red-900 text-red-200"
                              : persona.urgency === "medium"
                                ? "bg-yellow-900 text-yellow-200"
                                : "bg-green-900 text-green-200"
                          }`}
                        >
                          {persona.urgency} urgency
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-zinc-400 text-sm">
                          Company Size:
                        </p>
                        <p className="text-white text-sm">
                          {persona.company_size}
                        </p>
                      </div>

                      <div>
                        <p className="text-zinc-400 text-sm mb-2">
                          Key Pain Points:
                        </p>
                        <div className="space-y-1">
                          {persona.pain_points.map((pain, index) => (
                            <p key={index} className="text-white text-xs">
                              • {pain}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-zinc-400 text-sm mb-2">
                          Motivations:
                        </p>
                        <div className="space-y-1">
                          {persona.motivations.map((motivation, index) => (
                            <p key={index} className="text-green-200 text-xs">
                              • {motivation}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-zinc-400 text-sm mb-2">
                          Decision Factors:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {persona.decision_factors.map((factor) => (
                            <Badge
                              key={factor}
                              className="bg-charcoal text-zinc-400 text-xs"
                            >
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-zinc-400 text-sm mb-2">
                          Preferred Channels:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {persona.preferred_channels.map((channel) => (
                            <Badge
                              key={channel}
                              className="bg-blue-900 text-blue-200 text-xs"
                            >
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="value-props" className="space-y-6">
            <div className="space-y-6">
              {valuePropositions.map((prop) => (
                <Card key={prop.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-white font-semibold text-xl">
                            {prop.title}
                          </h3>
                          <Badge
                            className={`${
                              prop.impact === "high"
                                ? "bg-red-900 text-red-200"
                                : prop.impact === "medium"
                                  ? "bg-yellow-900 text-yellow-200"
                                  : "bg-green-900 text-green-200"
                            }`}
                          >
                            {prop.impact} impact
                          </Badge>
                        </div>

                        <p className="text-zinc-400 mb-4">
                          {prop.description}
                        </p>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div>
                            <p className="text-white font-medium mb-2">
                              Target Personas:
                            </p>
                            <div className="space-y-1">
                              {prop.target_persona.map((personaId) => {
                                const persona = customerPersonas.find(
                                  (p) => p.id === personaId,
                                );
                                return persona ? (
                                  <div
                                    key={personaId}
                                    className="flex items-center gap-2"
                                  >
                                    <span>{persona.avatar}</span>
                                    <span className="text-white text-sm">
                                      {persona.title}
                                    </span>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>

                          <div>
                            <p className="text-white font-medium mb-2">
                              Evidence:
                            </p>
                            <div className="space-y-1">
                              {prop.evidence.map((evidence, index) => (
                                <p
                                  key={index}
                                  className="text-green-200 text-sm"
                                >
                                  • {evidence}
                                </p>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-white font-medium mb-2">
                              Key Differentiator:
                            </p>
                            <p className="text-purple-200 text-sm">
                              {prop.differentiator}
                            </p>

                            <p className="text-white font-medium mb-2 mt-4">
                              Core Messaging:
                            </p>
                            <p className="text-blue-200 text-sm italic">
                              "{prop.messaging}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gtm-strategy" className="space-y-6">
            <div className="space-y-6">
              {gtmStrategies.map((strategy, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">
                        {strategy.phase}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(strategy.status)}>
                          {strategy.status}
                        </Badge>
                        <Badge className="bg-charcoal text-zinc-400">
                          {strategy.timeline}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="mb-4">
                          <p className="text-white font-medium mb-2">
                            Objectives:
                          </p>
                          <div className="space-y-1">
                            {strategy.objectives.map((objective, idx) => (
                              <p
                                key={idx}
                                className="text-zinc-400 text-sm"
                              >
                                • {objective}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-white font-medium mb-2">
                            Key Tactics:
                          </p>
                          <div className="space-y-1">
                            {strategy.tactics.map((tactic, idx) => (
                              <p key={idx} className="text-blue-200 text-sm">
                                • {tactic}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-medium">
                              Key Metrics:
                            </p>
                            <p className="text-zinc-400 text-sm">
                              Budget: ${(strategy.budget / 1000000).toFixed(1)}M
                            </p>
                          </div>
                          <div className="space-y-3">
                            {strategy.metrics.map((metric, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-zinc-900 rounded"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-white text-sm">
                                    {metric.name}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {getTrendIcon(metric.trend)}
                                    <span className="text-white text-sm">
                                      {metric.current.toLocaleString()}/
                                      {metric.target.toLocaleString()}{" "}
                                      {metric.unit}
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full bg-charcoal h-2 rounded-full">
                                  <div
                                    className={`h-2 rounded-full ${
                                      metric.current >= metric.target
                                        ? "bg-green-400"
                                        : metric.current >= metric.target * 0.7
                                          ? "bg-yellow-400"
                                          : "bg-red-400"
                                    }`}
                                    style={{
                                      width: `${Math.min(100, (metric.current / metric.target) * 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-zinc-400 text-sm">
                            Owner: {strategy.owner}
                          </p>
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="competitive" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    Competitive Landscape
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketSegments[0].competition.map((competitor) => (
                      <div
                        key={competitor.name}
                        className="p-4 bg-zinc-900 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">
                            {competitor.name}
                          </span>
                          <div className="text-right">
                            <div className="text-sm text-zinc-400">
                              Market Share
                            </div>
                            <div className="text-white font-bold">
                              {competitor.marketShare}%
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <p className="text-green-300 text-xs font-medium mb-1">
                              Strengths:
                            </p>
                            {competitor.strengths.map((strength, idx) => (
                              <p key={idx} className="text-green-200 text-xs">
                                • {strength}
                              </p>
                            ))}
                          </div>
                          <div>
                            <p className="text-red-300 text-xs font-medium mb-1">
                              Weaknesses:
                            </p>
                            {competitor.weaknesses.map((weakness, idx) => (
                              <p key={idx} className="text-red-200 text-xs">
                                • {weakness}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-charcoal">
                          <p className="text-zinc-400 text-xs">
                            Pricing:{" "}
                            <span className="text-white">
                              {competitor.pricing}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    NeuroLint Differentiation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-900/20 border border-green-400/30 rounded-lg">
                      <h4 className="text-green-300 font-medium mb-2">
                        Unique Advantages
                      </h4>
                      <div className="space-y-1">
                        <p className="text-green-200 text-sm">
                          • AI that learns team coding patterns
                        </p>
                        <p className="text-green-200 text-sm">
                          • Real-time collaborative code fixing
                        </p>
                        <p className="text-green-200 text-sm">
                          • Enterprise-grade security from day one
                        </p>
                        <p className="text-green-200 text-sm">
                          • Comprehensive ROI measurement
                        </p>
                        <p className="text-green-200 text-sm">
                          • Gamified team collaboration
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-900/20 border border-blue-400/30 rounded-lg">
                      <h4 className="text-blue-300 font-medium mb-2">
                        Market Position
                      </h4>
                      <p className="text-blue-200 text-sm">
                        NeuroLint is positioned as the first AI-native,
                        team-focused code quality platform. While competitors
                        focus on individual developers or traditional static
                        analysis, we enable teams to collaborate on code quality
                        in real-time.
                      </p>
                    </div>

                    <div className="p-4 bg-purple-900/20 border border-purple-400/30 rounded-lg">
                      <h4 className="text-purple-300 font-medium mb-2">
                        Pricing Strategy
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-purple-200 text-sm">
                            Individual
                          </span>
                          <span className="text-white text-sm">$19/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-200 text-sm">
                            Team (5 users)
                          </span>
                          <span className="text-white text-sm">$99/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-200 text-sm">
                            Enterprise
                          </span>
                          <span className="text-white text-sm">
                            $1000+/month
                          </span>
                        </div>
                      </div>
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

export default MarketPositioning;
