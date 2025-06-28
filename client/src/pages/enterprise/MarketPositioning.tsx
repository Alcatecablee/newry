import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Users,
  Target,
  DollarSign,
  ArrowRight,
  Lightbulb,
  Shield,
  Zap,
} from "lucide-react";

interface MarketSegment {
  id: string;
  name: string;
  size: string;
  growth: number;
  targetable: number;
  painPoints: string[];
  value_props: string[];
  competition: Array<{
    name: string;
    marketShare: number;
    strengths: string[];
    weaknesses: string[];
    pricing: string;
  }>;
  priority: "high" | "medium" | "low";
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
  budget_range: string;
  decision_timeline: string;
}

interface GTMPhase {
  id: string;
  name: string;
  duration: string;
  objectives: string[];
  tactics: string[];
  metrics: string[];
  budget: string;
  status: "completed" | "current" | "planned";
}

const MarketPositioning = () => {
  const [selectedSegment, setSelectedSegment] = useState<string>("enterprise");
  const [gtmPhase, setGTMPhase] = useState<string>("launch");
  const [marketSegments, setMarketSegments] = useState<MarketSegment[]>([]);
  const [customerPersonas, setCustomerPersonas] = useState<CustomerPersona[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketSegments();
    fetchCustomerPersonas();
  }, []);

  const fetchMarketSegments = async () => {
    try {
      const response = await fetch("/api/enterprise/market-segments");
      if (response.ok) {
        const data = await response.json();
        setMarketSegments(data);
      }
    } catch (error) {
      console.error("Failed to fetch market segments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerPersonas = async () => {
    try {
      const response = await fetch("/api/enterprise/customer-personas");
      if (response.ok) {
        const data = await response.json();
        setCustomerPersonas(data);
      }
    } catch (error) {
      console.error("Failed to fetch customer personas:", error);
    }
  };

  const gtmPhases: GTMPhase[] = [
    {
      id: "foundation",
      name: "Foundation & MVP",
      duration: "Q1 2024",
      objectives: [
        "Product-market fit validation",
        "Core feature completion",
        "Initial customer acquisition",
      ],
      tactics: [
        "Beta customer program",
        "Content marketing launch",
        "Developer community engagement",
      ],
      metrics: [
        "10 paying customers",
        "90% user satisfaction",
        "5% MRR growth",
      ],
      budget: "$50K",
      status: "completed",
    },
    {
      id: "growth",
      name: "Growth & Expansion",
      duration: "Q2-Q3 2024",
      objectives: [
        "Scale customer acquisition",
        "Enterprise feature development",
        "Channel partnerships",
      ],
      tactics: [
        "Performance marketing",
        "Sales team hiring",
        "Integration partnerships",
      ],
      metrics: ["100 customers", "$50K ARR", "15% market awareness"],
      budget: "$200K",
      status: "current",
    },
    {
      id: "scale",
      name: "Scale & Optimization",
      duration: "Q4 2024",
      objectives: [
        "Market leadership position",
        "International expansion",
        "Product platform evolution",
      ],
      tactics: [
        "Global marketing campaigns",
        "Enterprise sales motion",
        "API platform launch",
      ],
      metrics: ["$500K ARR", "25% market share", "Global presence"],
      budget: "$500K",
      status: "planned",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading market positioning data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-violet-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Market Positioning & Go-to-Market Strategy
          </h1>
          <p className="text-zinc-400 text-lg">
            Strategic market analysis and customer acquisition planning for
            NeuroLint
          </p>
        </div>

        <Tabs defaultValue="segments" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-zinc-900 border-zinc-800 mb-8">
            <TabsTrigger
              value="segments"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Target className="w-4 h-4 mr-2" />
              Market Segments
            </TabsTrigger>
            <TabsTrigger
              value="personas"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Users className="w-4 h-4 mr-2" />
              Customer Personas
            </TabsTrigger>
            <TabsTrigger
              value="positioning"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Positioning
            </TabsTrigger>
            <TabsTrigger
              value="gtm"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Zap className="w-4 h-4 mr-2" />
              Go-to-Market
            </TabsTrigger>
          </TabsList>

          <TabsContent value="segments" className="space-y-6">
            {marketSegments.length === 0 ? (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Market Research Data
                  </h3>
                  <p className="text-zinc-400">
                    Market segment data will be populated when market research
                    is completed.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {marketSegments.map((segment) => (
                  <Card
                    key={segment.id}
                    className="bg-zinc-900/50 border-zinc-800"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">
                          {segment.name}
                        </CardTitle>
                        <Badge
                          variant={
                            segment.priority === "high" ? "default" : "outline"
                          }
                          className={
                            segment.priority === "high" ? "bg-green-600" : ""
                          }
                        >
                          {segment.priority} priority
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-zinc-400 text-sm">Market Size</p>
                          <p className="text-white font-semibold">
                            {segment.size}
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-400 text-sm">Growth Rate</p>
                          <p className="text-white font-semibold">
                            {segment.growth}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="personas" className="space-y-6">
            {customerPersonas.length === 0 ? (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Customer Research
                  </h3>
                  <p className="text-zinc-400">
                    Customer persona data will be populated when user research
                    is completed.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {customerPersonas.map((persona) => (
                  <Card
                    key={persona.id}
                    className="bg-zinc-900/50 border-zinc-800"
                  >
                    <CardHeader>
                      <CardTitle className="text-white">
                        {persona.name}
                      </CardTitle>
                      <p className="text-zinc-400">{persona.title}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-zinc-400 text-sm mb-2">
                          Company Size
                        </p>
                        <p className="text-white">{persona.company_size}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="positioning" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Value Proposition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Core Message
                    </h4>
                    <p className="text-zinc-300">
                      "Advanced code transformation that reduces technical debt
                      by 80% while maintaining 99.9% accuracy"
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Key Benefits
                    </h4>
                    <ul className="space-y-2 text-zinc-300">
                      <li>• Instant technical debt reduction</li>
                      <li>• Enterprise-grade security and compliance</li>
                      <li>• Seamless CI/CD integration</li>
                      <li>• Real-time collaboration features</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Competitive Advantage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Differentiators
                    </h4>
                    <ul className="space-y-2 text-zinc-300">
                      <li>• 6-layer analysis system</li>
                      <li>• Real-time collaborative features</li>
                      <li>• Enterprise compliance automation</li>
                      <li>• Advanced AI orchestration</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="gtm" className="space-y-6">
            <div className="space-y-6">
              {gtmPhases.map((phase, index) => (
                <Card key={phase.id} className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-700 text-white font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <CardTitle className="text-white">
                            {phase.name}
                          </CardTitle>
                          <p className="text-zinc-400">{phase.duration}</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          phase.status === "completed"
                            ? "default"
                            : phase.status === "current"
                              ? "secondary"
                              : "outline"
                        }
                        className={
                          phase.status === "completed"
                            ? "bg-green-600"
                            : phase.status === "current"
                              ? "bg-blue-600"
                              : ""
                        }
                      >
                        {phase.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-white font-semibold mb-2">
                          Objectives
                        </h4>
                        <ul className="space-y-1 text-zinc-300 text-sm">
                          {phase.objectives.map((objective, idx) => (
                            <li key={idx}>• {objective}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-white font-semibold mb-2">
                          Key Tactics
                        </h4>
                        <ul className="space-y-1 text-zinc-300 text-sm">
                          {phase.tactics.map((tactic, idx) => (
                            <li key={idx}>• {tactic}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-white font-semibold mb-2">
                          Success Metrics
                        </h4>
                        <ul className="space-y-1 text-zinc-300 text-sm">
                          {phase.metrics.map((metric, idx) => (
                            <li key={idx}>• {metric}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
                      <span className="text-zinc-400">
                        Budget:{" "}
                        <span className="text-white font-semibold">
                          {phase.budget}
                        </span>
                      </span>
                      {index < gtmPhases.length - 1 && (
                        <ArrowRight className="w-5 h-5 text-zinc-400" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MarketPositioning;
