import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Zap,
  Code,
  Shield,
  Target,
  Settings,
  Cpu,
  GitBranch,
  Terminal,
  Monitor,
  Users,
  Cloud,
  Lock,
  CheckCircle,
  TrendingUp,
  Layers,
  Sparkles,
  Rocket,
  Clock,
  Search,
  Puzzle,
  BarChart3,
  Atom,
  TestTube,
  Database,
  Workflow,
  Gauge,
} from "lucide-react";

const Features = () => {
  const layerFeatures = [
    {
      id: 1,
      name: "Configuration Validation",
      description:
        "Optimizes TypeScript, Next.js config, and package.json with modern settings.",
      icon: Settings,
      color: "text-zinc-400",
      bgColor: "bg-zinc-500/20",
      details: [
        "TypeScript configuration optimization",
        "Next.js App Router best practices",
        "Package.json dependency updates",
        "ESLint & Prettier integration",
        "Build tool optimization",
      ],
    },
    {
      id: 2,
      name: "Pattern & Entity Fixes",
      description:
        "Cleans up HTML entities, old patterns, and modernizes JS/TS code.",
      icon: Search,
      color: "text-zinc-400",
      bgColor: "bg-zinc-500/20",
      details: [
        "HTML entity cleanup",
        "Legacy pattern modernization",
        "Code style standardization",
        "Import/export optimization",
        "Syntax modernization",
      ],
    },
    {
      id: 3,
      name: "Component Best Practices",
      description:
        "Solves missing key props, accessibility, prop types, and missing imports.",
      icon: Puzzle,
      color: "text-zinc-400",
      bgColor: "bg-zinc-500/20",
      details: [
        "React key prop fixes",
        "Accessibility improvements",
        "PropTypes & TypeScript types",
        "Missing import detection",
        "Component structure optimization",
      ],
    },
    {
      id: 4,
      name: "Hydration & SSR Guard",
      description: "Fixes hydration bugs and adds SSR/localStorage protection.",
      icon: Shield,
      color: "text-zinc-400",
      bgColor: "bg-zinc-500/20",
      details: [
        "Hydration mismatch fixes",
        "SSR compatibility checks",
        "Client-side only code protection",
        "localStorage/window guards",
        "Dynamic import optimization",
      ],
    },
    {
      id: 5,
      name: "Next.js Optimization",
      description:
        "Optimizes Next.js App Router patterns, 'use client' directives, and import order.",
      icon: Rocket,
      color: "text-zinc-400",
      bgColor: "bg-zinc-500/20",
      details: [
        "App Router pattern optimization",
        "'use client' directive placement",
        "Server/Client component separation",
        "Import order optimization",
        "Performance best practices",
      ],
    },
    {
      id: 6,
      name: "Quality & Performance",
      description:
        "Adds error handling, performance optimizations, and code quality improvements.",
      icon: TrendingUp,
      color: "text-zinc-400",
      bgColor: "bg-zinc-500/20",
      details: [
        "Error boundary integration",
        "Performance monitoring",
        "Code splitting optimization",
        "Memory leak prevention",
        "Quality metrics improvement",
      ],
    },
  ];

  const integrationFeatures = [
    {
      name: "CLI Tool",
      description:
        "Powerful command-line interface for automated code analysis",
      icon: Terminal,
      features: [
        "CI/CD integration",
        "Batch processing",
        "Custom rules",
        "Git hooks",
      ],
    },
    {
      name: "VS Code Extension",
      description: "Real-time analysis and fixes directly in your editor",
      icon: Monitor,
      features: [
        "Real-time hints",
        "One-click fixes",
        "Inline suggestions",
        "Workspace analysis",
      ],
    },
    {
      name: "REST API",
      description:
        "Integrate NeuroLint into your own applications and workflows",
      icon: Database,
      features: [
        "RESTful endpoints",
        "Webhook support",
        "Rate limiting",
        "Analytics",
      ],
    },
    {
      name: "GitHub Integration",
      description: "Seamless integration with your development workflow",
      icon: GitBranch,
      features: [
        "Pull request checks",
        "Auto-fix commits",
        "Status reporting",
        "Team collaboration",
      ],
    },
  ];

  const securityFeatures = [
    {
      name: "Code Privacy",
      description: "Your code is never stored or shared",
      icon: Lock,
    },
    {
      name: "Secure Processing",
      description: "All analysis happens in isolated environments",
      icon: Shield,
    },
    {
      name: "Enterprise Security",
      description: "SOC 2 compliance and advanced security controls",
      icon: Users,
    },
    {
      name: "On-Premise Options",
      description: "Deploy NeuroLint within your infrastructure",
      icon: Cloud,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-zinc-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-zinc-800/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-zinc-900/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/80 rounded-xl text-sm font-medium backdrop-blur-xl border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            <Link
              to="/app"
              className="inline-flex items-center px-4 py-2 bg-white text-black font-medium rounded-xl hover:bg-gray-100 transition-all duration-200 text-sm shadow-lg"
            >
              Try NeuroLint
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800/50 rounded-xl backdrop-blur-sm mb-6">
                <Layers className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-400">
                  Features & Capabilities
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white">
                Multi-Layer Code Analysis
              </h1>

              <p className="text-xl text-zinc-400 max-w-4xl mx-auto leading-relaxed">
                Discover how NeuroLint's six advanced layers work together to
                transform your code.
                <br />
                <span className="text-white font-semibold">
                  From configuration to performance, we've got you covered.
                </span>
              </p>
            </div>
          </div>

          {/* 6 Layer Analysis System */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Six-Layer Analysis System
              </h2>
              <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
                Each layer targets specific aspects of your code, working
                together to deliver comprehensive improvements.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {layerFeatures.map((layer) => {
                const Icon = layer.icon;
                return (
                  <Card
                    key={layer.id}
                    className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl backdrop-blur-sm hover:bg-zinc-900/60 transition-all duration-300"
                  >
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        <div
                          className={`p-3 rounded-2xl ${layer.bgColor} flex-shrink-0`}
                        >
                          <Icon className={`w-8 h-8 ${layer.color}`} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge
                              variant="outline"
                              className="text-zinc-400 border-zinc-700"
                            >
                              Layer {layer.id}
                            </Badge>
                            <h3 className="text-xl font-bold text-white">
                              {layer.name}
                            </h3>
                          </div>

                          <p className="text-zinc-400 mb-4 leading-relaxed">
                            {layer.description}
                          </p>

                          <ul className="space-y-2">
                            {layer.details.map((detail, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-3 text-sm"
                              >
                                <CheckCircle className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                                <span className="text-zinc-300">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Integration Features */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Powerful Integrations
              </h2>
              <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
                Use NeuroLint however you prefer - through our web app, CLI, VS
                Code extension, or API.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {integrationFeatures.map((integration, index) => {
                const Icon = integration.icon;
                return (
                  <Card
                    key={index}
                    className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm hover:bg-zinc-900/60 transition-all duration-300"
                  >
                    <CardContent className="p-6 text-center">
                      <div className="p-3 bg-zinc-800/50 rounded-2xl inline-flex mb-4">
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2">
                        {integration.name}
                      </h3>

                      <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                        {integration.description}
                      </p>

                      <ul className="space-y-2">
                        {integration.features.map((feature, idx) => (
                          <li key={idx} className="text-xs text-zinc-500">
                            • {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Security & Privacy */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Security & Privacy First
              </h2>
              <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
                Your code is precious. We protect it with enterprise-grade
                security and privacy controls.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {securityFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={index}
                    className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm text-center"
                  >
                    <CardContent className="p-6">
                      <div className="p-3 bg-zinc-500/20 rounded-2xl inline-flex mb-4">
                        <Icon className="w-8 h-8 text-zinc-400" />
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2">
                        {feature.name}
                      </h3>

                      <p className="text-zinc-400 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Performance Stats */}
          <section className="mb-20">
            <Card className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <div className="mb-8">
                  <Gauge className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Built for Performance
                  </h2>
                  <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                    Lightning-fast analysis with enterprise-grade reliability
                    and scalability.
                  </p>
                </div>

                <div className="grid md:grid-cols-4 gap-8">
                  <div>
                    <div className="text-4xl font-bold text-white mb-2">
                      &lt;1s
                    </div>
                    <div className="text-zinc-400 text-sm">
                      Average Analysis Time
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white mb-2">
                      99.9%
                    </div>
                    <div className="text-zinc-400 text-sm">Uptime SLA</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white mb-2">
                      10MB
                    </div>
                    <div className="text-zinc-400 text-sm">Max File Size</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white mb-2">
                      24/7
                    </div>
                    <div className="text-zinc-400 text-sm">
                      Support Available
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <Card className="bg-zinc-900/60 border border-zinc-800/50 rounded-3xl backdrop-blur-sm">
              <CardContent className="p-12">
                <div className="mb-8">
                  <Sparkles className="w-16 h-16 text-zinc-400 mx-auto mb-6" />
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Ready to Transform Your Code?
                  </h2>
                  <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
                    Join thousands of developers who trust NeuroLint to keep
                    their code clean, modern, and performant.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    className="bg-white text-black hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-xl"
                  >
                    <Link to="/app">Start Free Trial</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-zinc-700 text-white hover:bg-zinc-800 px-8 py-3 text-lg font-semibold rounded-xl"
                  >
                    <Link to="/pricing">View Pricing</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Features;
