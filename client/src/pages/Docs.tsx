import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useNavigate, Link } from "react-router-dom";
import {
  Terminal,
  Code,
  Puzzle,
  Zap,
  ExternalLink,
  Settings,
  BarChart3,
  Shield,
} from "lucide-react";

export default function Docs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-16">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-6 border-2 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 bg-black px-6 py-3 rounded-xl"
          >
            ← Back
          </Button>
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white">
            NeuroLint Documentation
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl font-medium">Complete guide to NeuroLint - Advanced code cleanup and modernization toolkit</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-[#111111] border-2 border-zinc-800 p-2 rounded-2xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-gray-400 px-6 py-3 rounded-xl font-medium">Overview</TabsTrigger>
            <TabsTrigger value="getting-started" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-gray-400 px-6 py-3 rounded-xl font-medium">Getting Started</TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-gray-400 px-6 py-3 rounded-xl font-medium">Tools & Integrations</TabsTrigger>
            <TabsTrigger value="layers" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-gray-400 px-6 py-3 rounded-xl font-medium">Analysis Layers</TabsTrigger>
            <TabsTrigger value="enterprise" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-gray-400 px-6 py-3 rounded-xl font-medium">Enterprise</TabsTrigger>
          </TabsList>
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-[#111111] border-2 border-zinc-800 rounded-3xl hover:border-zinc-600 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">
                  Meet NeuroLint: Effortless Code Cleanup & Modernization
                </CardTitle>
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Advanced toolkit to bring React/TypeScript codebases into the
                  modern age without the grind
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-zinc-400 mb-4">
                    <strong>NeuroLint</strong> is your advanced toolkit to bring
                    React/TypeScript codebases into the modern age—without the
                    grind. Save hours, enforce best practices automatically, and
                    bulletproof your codebase for scale.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        Autofix, don't just lint
                      </h4>
                      <p className="text-zinc-400 text-sm">
                        Cleans up code, modernizes patterns, and fixes the
                        painful stuff automatically
                      </p>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        Layered magic
                      </h4>
                      <p className="text-zinc-400 text-sm">
                        6 "layers" scan and upgrade everything from config to
                        accessibility, prop types to hydration bugs
                      </p>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        CI-ready & safe
                      </h4>
                      <p className="text-zinc-400 text-sm">
                        Use as a dev tool, one-off fixer, or continuous
                        guardrail on every commit
                      </p>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        Contrib-friendly
                      </h4>
                      <p className="text-zinc-400 text-sm">
                        Patterns, layers, and safety features are easy to extend
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div>
                  <h3 className="font-semibold text-white mb-3">
                    Key Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <Zap className="w-8 h-8 text-yellow-400 mb-3" />
                      <h4 className="font-medium text-white mb-2">
                        Instant Fixes
                      </h4>
                      <p className="text-zinc-400 text-sm">
                        Automatically fix common issues like missing keys, HTML
                        entities, and accessibility problems
                      </p>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <Puzzle className="w-8 h-8 text-blue-400 mb-3" />
                      <h4 className="font-medium text-white mb-2">
                        Layered Analysis
                      </h4>
                      <p className="text-zinc-400 text-sm">
                        6-layer analysis system covers everything from config to
                        performance optimization
                      </p>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <Shield className="w-8 h-8 text-green-400 mb-3" />
                      <h4 className="font-medium text-white mb-2">
                        Enterprise Ready
                      </h4>
                      <p className="text-zinc-400 text-sm">
                        SOC2 compliance, audit logging, SSO integration, and
                        team management
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div>
                  <h3 className="font-semibold text-white mb-3">
                    Example Fixes
                  </h3>
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <ul className="space-y-2 text-zinc-400">
                      <li>
                        • Converts{" "}
                        <code className="bg-zinc-700 px-1 rounded">
                          &quot; → "
                        </code>{" "}
                        and other HTML entities
                      </li>
                      <li>
                        • Adds missing <strong>key</strong> props to mapped
                        components
                      </li>
                      <li>
                        • Modernizes <strong>Button</strong> and form patterns
                      </li>
                      <li>
                        • Protects <strong>localStorage</strong> calls for
                        SSR-safety
                      </li>
                      <li>
                        • Adds <strong>alt</strong> to images and fixes
                        accessibility snags
                      </li>
                      <li>• Upgrades out-of-date configs automatically</li>
                    </ul>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div>
                  <h3 className="font-semibold text-white mb-3">
                    External Resources
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://github.com/Alcatecablee/neurolint/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      View on GitHub
                    </a>
                    <a
                      href="https://github.com/Alcatecablee/neurolint/wiki"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Wiki & API
                    </a>
                    <a
                      href="mailto:founder@neurolint.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Contact Us
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Getting Started Tab */}
          <TabsContent value="getting-started" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Getting Started</CardTitle>
                <CardDescription className="text-zinc-400">
                  Quick start guide to get NeuroLint running in your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-white mb-4">
                      Project Integration
                    </h3>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-3">
                        Quick Setup
                      </h4>
                      <pre className="text-sm text-zinc-300 bg-zinc-900 p-3 rounded font-mono mb-3">
                        {`# Install dependencies
npm install

# Fix everything, fast
npm run fix all

# Preview, don't apply
npm run fix dry run

# Just run a specific layer
npm run fix layer 3`}
                      </pre>
                      <p className="text-zinc-400 text-sm">
                        Perfect for existing projects - integrates with your
                        current setup
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-4">
                      CLI Installation
                    </h3>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-3">
                        Global CLI Tool
                      </h4>
                      <pre className="text-sm text-zinc-300 bg-zinc-900 p-3 rounded font-mono mb-3">
                        {`# Install globally
npm install -g @neurolint/cli

# Initialize in project
neurolint init

# Analyze code
neurolint analyze src/

# Fix automatically
neurolint fix src/ --backup`}
                      </pre>
                      <p className="text-zinc-400 text-sm">
                        Standalone CLI for cross-project use and automation
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div>
                  <h3 className="font-semibold text-white mb-3">
                    How NeuroLint Works
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-900 text-blue-200 rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-1">
                          Analysis
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Reads your codebase and applies AI + AST-powered logic
                          in carefully designed "layers"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-green-900 text-green-200 rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-1">
                          Transformation
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Detects, explains, and safely applies changes—never
                          override code blindly
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-zinc-800 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-medium text-white mb-1">
                          Validation
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Validates output, keeps backups, supports dry runs,
                          and guards the build
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-orange-900 text-orange-200 rounded-full flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-1">
                          Extension
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Each layer can be extended—add your own patterns or
                          even new layers
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tools & Integrations Tab */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* CLI Tool */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Terminal className="w-8 h-8 text-green-400" />
                    <h3 className="text-xl font-semibold text-white">
                      CLI Tool
                    </h3>
                  </div>
                  <p className="text-zinc-400 mb-4">
                    Enterprise-grade command-line interface with team
                    management, analytics, and automation capabilities.
                  </p>
                  <ul className="space-y-2 text-zinc-400 text-sm mb-4">
                    <li>• Global installation via npm</li>
                    <li>• Interactive analysis workflows</li>
                    <li>• Enterprise team management</li>
                    <li>• CI/CD integration</li>
                  </ul>
                  <Link
                    to="/cli-docs"
                    className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
                  >
                    View CLI Documentation
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>

              {/* VS Code Extension */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Code className="w-8 h-8 text-blue-400" />
                    <h3 className="text-xl font-semibold text-white">
                      VS Code Extension
                    </h3>
                  </div>
                  <p className="text-zinc-400 mb-4">
                    Integrated development experience with real-time analysis,
                    inline suggestions, and automated fixes.
                  </p>
                  <ul className="space-y-2 text-zinc-400 text-sm mb-4">
                    <li>• Real-time code analysis</li>
                    <li>• Inline diagnostics and fixes</li>
                    <li>• Context menu integration</li>
                    <li>• Enterprise features</li>
                  </ul>
                  <Button
                    variant="outline"
                    className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                  >
                    Install Extension
                  </Button>
                </CardContent>
              </Card>

              {/* REST API */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Settings className="w-8 h-8 text-white" />
                    <h3 className="text-xl font-semibold text-white">
                      REST API
                    </h3>
                  </div>
                  <p className="text-zinc-400 mb-4">
                    Production-ready API for integrating NeuroLint into your
                    applications and custom workflows.
                  </p>
                  <ul className="space-y-2 text-zinc-400 text-sm mb-4">
                    <li>• RESTful endpoints</li>
                    <li>• Enterprise authentication</li>
                    <li>• Comprehensive documentation</li>
                    <li>• SDK libraries available</li>
                  </ul>
                  <Link
                    to="/api-docs"
                    className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
                  >
                    View API Documentation
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>
            </div>

            <Separator className="bg-zinc-700" />

            {/* Integration Examples */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">
                  Integration Examples
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Common integration patterns for different development
                  workflows
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-white mb-3">
                      GitHub Actions
                    </h3>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <pre className="text-sm text-zinc-300 bg-zinc-900 p-3 rounded font-mono">
                        {`name: NeuroLint Analysis
on: [push, pull_request]
jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install NeuroLint
        run: npm install -g @neurolint/cli
      - name: Run Analysis
        run: neurolint analyze src/ --output=json
        env:
          NEUROLINT_API_KEY: \${{ secrets.NEUROLINT_API_KEY }}`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-3">
                      Package.json Scripts
                    </h3>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <pre className="text-sm text-zinc-300 bg-zinc-900 p-3 rounded font-mono">
                        {`{
  "scripts": {
    "lint": "neurolint analyze src/",
    "lint:fix": "neurolint fix src/ --backup",
    "lint:ci": "neurolint analyze --output=json",
    "pre-commit": "neurolint fix --dry-run",
    "quality-check": "neurolint status --detailed"
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm run pre-commit"
    }
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Layers Tab */}
          <TabsContent value="layers" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">
                  6-Layer Analysis System
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Understanding NeuroLint's comprehensive analysis and
                  transformation engine
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="bg-zinc-800 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-900 text-blue-200 rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        Layer 1: Configuration
                      </h3>
                    </div>
                    <p className="text-zinc-400 mb-3">
                      Updates TypeScript/Next.js configs, package.json scripts,
                      unlocks modern tooling
                    </p>
                    <ul className="text-sm text-zinc-400 space-y-1">
                      <li>• TypeScript compiler target upgrade to ES2022+</li>
                      <li>• Package.json scripts enhancement</li>
                      <li>• ESLint and Prettier configuration updates</li>
                      <li>• Build tool optimization</li>
                    </ul>
                  </div>

                  <div className="bg-zinc-800 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-green-900 text-green-200 rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        Layer 2: Code Patterns
                      </h3>
                    </div>
                    <p className="text-zinc-400 mb-3">
                      Cleans up HTML entities, removes noise, upgrades patterns
                      and imports
                    </p>
                    <ul className="text-sm text-zinc-400 space-y-1">
                      <li>• HTML entity conversion (e.g., &quot; → ")</li>
                      <li>• Import statement optimization</li>
                      <li>• Code pattern modernization</li>
                      <li>• Dead code elimination</li>
                    </ul>
                  </div>

                  <div className="bg-zinc-800 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-purple-900 text-purple-200 rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        Layer 3: Component Intelligence
                      </h3>
                    </div>
                    <p className="text-zinc-400 mb-3">
                      Fixes missing keys, adds accessibility, improves prop
                      types, enforces TSX hygiene
                    </p>
                    <ul className="text-sm text-zinc-400 space-y-1">
                      <li>• Missing key props in mapped components</li>
                      <li>
                        • Accessibility improvements (alt attributes, ARIA
                        labels)
                      </li>
                      <li>• PropTypes and interface optimization</li>
                      <li>• Component best practices enforcement</li>
                    </ul>
                  </div>

                  <div className="bg-zinc-800 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-orange-900 text-orange-200 rounded-full flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        Layer 4: Hydration & SSR
                      </h3>
                    </div>
                    <p className="text-zinc-400 mb-3">
                      Guards against SSR bugs, hydration drift, unsafe
                      localStorage usage
                    </p>
                    <ul className="text-sm text-zinc-400 space-y-1">
                      <li>• SSR-safe localStorage protection</li>
                      <li>• Hydration mismatch prevention</li>
                      <li>• Client-side only code isolation</li>
                      <li>• Next.js specific optimizations</li>
                    </ul>
                  </div>

                  <div className="bg-zinc-800 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-red-900 text-red-200 rounded-full flex items-center justify-center text-sm font-bold">
                        5
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        Layer 5: Performance
                      </h3>
                    </div>
                    <p className="text-zinc-400 mb-3">
                      Optimizes bundle size, lazy loading, and runtime
                      performance
                    </p>
                    <ul className="text-sm text-zinc-400 space-y-1">
                      <li>• Dynamic imports and code splitting</li>
                      <li>• Image optimization suggestions</li>
                      <li>• Bundle analysis and optimization</li>
                      <li>• Memory leak prevention</li>
                    </ul>
                  </div>

                  <div className="bg-zinc-800 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-yellow-900 text-yellow-200 rounded-full flex items-center justify-center text-sm font-bold">
                        6
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        Layer 6: Testing
                      </h3>
                    </div>
                    <p className="text-zinc-400 mb-3">
                      Enhances test coverage, adds missing test cases, improves
                      test quality
                    </p>
                    <ul className="text-sm text-zinc-400 space-y-1">
                      <li>• Test case generation suggestions</li>
                      <li>• Testing library best practices</li>
                      <li>• Mock optimization</li>
                      <li>• Coverage gap identification</li>
                    </ul>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div>
                  <h3 className="font-semibold text-white mb-3">
                    Layer Usage Examples
                  </h3>
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <pre className="text-sm text-zinc-300 font-mono">
                      {`# Run specific layers
neurolint analyze --layers=1,3,4 src/

# Run all layers
neurolint fix --layers=1,2,3,4,5,6 src/

# Skip performance layer
neurolint analyze --layers=1,2,3,4,6 src/

# Configuration and component layers only
npm run fix layer 1,3`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enterprise Tab */}
          <TabsContent value="enterprise" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">
                  Enterprise Features
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Advanced capabilities for enterprise-scale development teams
                  and organizations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">
                      Security & Compliance
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">
                          SOC 2 Type II
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Security, availability, and confidentiality controls
                        </p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">
                          GDPR Compliance
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Data protection and privacy regulations
                        </p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">
                          ISO 27001
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Information security management standards
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">
                      Team Management
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">
                          Multi-Team Support
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Organize users with role-based permissions
                        </p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">
                          SSO Integration
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          SAML, OAuth 2.0, and OpenID Connect
                        </p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">
                          Audit Logging
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Comprehensive activity tracking
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">
                      Analytics & Reporting
                    </h3>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <BarChart3 className="w-8 h-8 text-blue-400 mb-3" />
                      <h4 className="font-medium text-white mb-2">
                        Executive Dashboards
                      </h4>
                      <p className="text-zinc-400 text-sm mb-3">
                        Comprehensive analytics and usage insights for
                        leadership teams
                      </p>
                      <ul className="text-xs text-zinc-400 space-y-1">
                        <li>• Code quality metrics over time</li>
                        <li>• Team productivity insights</li>
                        <li>• Compliance report generation</li>
                        <li>• Custom KPI tracking</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">
                      Integration & Automation
                    </h3>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <Settings className="w-8 h-8 text-purple-400 mb-3" />
                      <h4 className="font-medium text-white mb-2">
                        Enterprise Integrations
                      </h4>
                      <p className="text-zinc-400 text-sm mb-3">
                        Deep integration with enterprise development tools
                      </p>
                      <ul className="text-xs text-zinc-400 space-y-1">
                        <li>• Webhook system for real-time notifications</li>
                        <li>• JIRA/Azure DevOps integration</li>
                        <li>• Slack/Microsoft Teams alerts</li>
                        <li>• Custom API endpoints</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div>
                  <h3 className="font-semibold text-white mb-3">
                    Want to Contribute?
                  </h3>
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <ul className="space-y-2 text-zinc-400 text-sm">
                      <li>
                        • Extend a pattern or add a custom fix—see{" "}
                        <code className="bg-zinc-700 px-1 rounded">
                          src/lib/neurolint/layers/
                        </code>
                      </li>
                      <li>
                        • New ideas? PRs welcome! Document your change and
                        ensure dry run passes
                      </li>
                      <li>
                        • Need help?{" "}
                        <a
                          href="mailto:founder@neurolint.com"
                          className="underline text-white"
                        >
                          Email or submit an issue
                        </a>
                        —let's make codebases better, together
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="bg-zinc-900 border-zinc-800 mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Ready to Get Started?
                </h3>
                <p className="text-zinc-400 text-sm">
                  Explore our tools and start improving your codebase today
                </p>
              </div>
              <div className="flex gap-3">
                <Link to="/cli-docs">
                  <Button
                    variant="outline"
                    className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                  >
                    CLI Docs
                  </Button>
                </Link>
                <Link to="/api-docs">
                  <Button
                    variant="outline"
                    className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                  >
                    API Docs
                  </Button>
                </Link>
                <Link to="/app">
                  <Button className="bg-white text-black hover:bg-zinc-200">
                    Try NeuroLint App
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-xs text-center text-zinc-400 mt-8">
          NeuroLint is open source (MIT License), built as part of the Taxfy
          project.
          <br />
          Like it? Tell your team, star us on GitHub, or drop us feedback!
        </div>
      </div>
    </div>
  );
}