import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

interface CLICommand {
  command: string;
  description: string;
  alias?: string;
  options: Array<{
    flag: string;
    description: string;
    default?: string;
  }>;
  examples: string[];
  enterprise?: boolean;
}

const CLI_COMMANDS: CLICommand[] = [
  {
    command: "neurolint init",
    description: "Initialize NeuroLint in your project",
    options: [
      { flag: "-f, --force", description: "Overwrite existing configuration" },
    ],
    examples: ["neurolint init", "neurolint init --force"],
  },
  {
    command: "neurolint analyze [files...]",
    alias: "scan",
    description: "Analyze code files for issues and improvements",
    options: [
      {
        flag: "-l, --layers <layers>",
        description: "Specify layers to run (1-6)",
        default: "1,2,3,4",
      },
      {
        flag: "-o, --output <format>",
        description: "Output format (json|table|summary)",
        default: "table",
      },
      { flag: "-r, --recursive", description: "Analyze files recursively" },
      {
        flag: "--include <patterns>",
        description: "Include file patterns (comma-separated)",
      },
      {
        flag: "--exclude <patterns>",
        description: "Exclude file patterns (comma-separated)",
      },
      { flag: "--config <path>", description: "Configuration file path" },
    ],
    examples: [
      "neurolint analyze src/components/*.tsx",
      "neurolint scan --recursive src/",
      "neurolint analyze --layers=1,3,4 --output=json src/",
      'neurolint analyze --include="**/*.ts,**/*.tsx" --exclude="**/*.test.*"',
    ],
  },
  {
    command: "neurolint fix [files...]",
    description: "Fix code issues automatically",
    options: [
      {
        flag: "-l, --layers <layers>",
        description: "Specify layers to run (1-6)",
        default: "1,2,3,4",
      },
      { flag: "-r, --recursive", description: "Fix files recursively" },
      {
        flag: "--dry-run",
        description: "Preview changes without applying them",
      },
      { flag: "--backup", description: "Create backup files before fixing" },
      {
        flag: "--include <patterns>",
        description: "Include file patterns (comma-separated)",
      },
      {
        flag: "--exclude <patterns>",
        description: "Exclude file patterns (comma-separated)",
      },
      { flag: "--config <path>", description: "Configuration file path" },
    ],
    examples: [
      "neurolint fix src/components/",
      "neurolint fix --dry-run --recursive src/",
      "neurolint fix --backup --layers=1,2,3 src/",
      'neurolint fix --recursive --include="**/*.tsx"',
    ],
  },
  {
    command: "neurolint config",
    description: "Manage NeuroLint configuration",
    options: [
      { flag: "--set <key=value>", description: "Set configuration value" },
      { flag: "--get <key>", description: "Get configuration value" },
      { flag: "--list", description: "List all configuration" },
      { flag: "--reset", description: "Reset to default configuration" },
    ],
    examples: [
      "neurolint config --list",
      "neurolint config --set layers=1,2,3,4",
      "neurolint config --get apiUrl",
      "neurolint config --reset",
    ],
  },
  {
    command: "neurolint status",
    description: "Show project analysis status and statistics",
    options: [{ flag: "--detailed", description: "Show detailed statistics" }],
    examples: ["neurolint status", "neurolint status --detailed"],
  },
  {
    command: "neurolint login",
    description: "Authenticate with NeuroLint service",
    options: [
      { flag: "--api-key <key>", description: "API key for authentication" },
      { flag: "--url <url>", description: "API server URL" },
    ],
    examples: [
      "neurolint login",
      "neurolint login --api-key YOUR_API_KEY",
      "neurolint login --url https://api.neurolint.com",
    ],
  },
  {
    command: "neurolint interactive",
    alias: "i",
    description: "Run NeuroLint in interactive mode",
    options: [],
    examples: ["neurolint interactive", "neurolint i"],
  },
  {
    command: "neurolint team",
    description: "Manage teams and team members",
    enterprise: true,
    options: [
      { flag: "--list", description: "List all teams" },
      { flag: "--members <team-id>", description: "List team members" },
      { flag: "--invite <email>", description: "Invite team member" },
      { flag: "--remove <email>", description: "Remove team member" },
      { flag: "--create <name>", description: "Create new team" },
      { flag: "--team <team-id>", description: "Specify team ID" },
      {
        flag: "--role <role>",
        description: "Specify role (admin|member|viewer)",
        default: "member",
      },
    ],
    examples: [
      "neurolint team --list",
      'neurolint team --create "Development Team"',
      "neurolint team --invite user@company.com --team team-123",
      "neurolint team --members team-123",
    ],
  },
  {
    command: "neurolint analytics",
    description: "Enterprise analytics and reporting",
    enterprise: true,
    options: [
      { flag: "--export", description: "Export analytics data" },
      { flag: "--dashboard", description: "Show analytics dashboard" },
      { flag: "--compliance", description: "Show compliance report" },
      { flag: "--teams", description: "Show team analytics" },
      {
        flag: "--format <format>",
        description: "Export format (json|csv|txt)",
        default: "json",
      },
      { flag: "--output <file>", description: "Output file path" },
    ],
    examples: [
      "neurolint analytics --dashboard",
      "neurolint analytics --export --format=csv --output=report.csv",
      "neurolint analytics --compliance",
      "neurolint analytics --teams",
    ],
  },
  {
    command: "neurolint audit",
    description: "Audit trail and compliance reporting",
    enterprise: true,
    options: [
      { flag: "--trail", description: "Show audit trail" },
      { flag: "--report", description: "Generate audit report" },
      { flag: "--search <query>", description: "Search audit events" },
      {
        flag: "--compliance [framework]",
        description: "Generate compliance report",
      },
      { flag: "--alerts", description: "Show security alerts" },
      { flag: "--user <user-id>", description: "Filter by user" },
      { flag: "--action <action>", description: "Filter by action" },
      {
        flag: "--days <days>",
        description: "Number of days to look back",
        default: "30",
      },
      {
        flag: "--period <period>",
        description: "Report period (week|month|quarter|year)",
        default: "month",
      },
      {
        flag: "--format <format>",
        description: "Output format (json|csv|txt)",
        default: "json",
      },
    ],
    examples: [
      "neurolint audit --trail",
      "neurolint audit --compliance soc2",
      'neurolint audit --search "user login" --days=7',
      "neurolint audit --report --period=quarter",
    ],
  },
  {
    command: "neurolint webhook",
    description: "Manage enterprise webhooks",
    enterprise: true,
    options: [
      { flag: "--list", description: "List configured webhooks" },
      { flag: "--create", description: "Create new webhook" },
      { flag: "--delete <id>", description: "Delete webhook" },
      { flag: "--test <id>", description: "Test webhook" },
      { flag: "--logs <id>", description: "Show webhook logs" },
      { flag: "--url <url>", description: "Webhook URL" },
      {
        flag: "--events <events>",
        description: "Webhook events (comma-separated)",
      },
      { flag: "--secret <secret>", description: "Webhook secret" },
    ],
    examples: [
      "neurolint webhook --list",
      "neurolint webhook --create --url https://api.company.com/webhooks",
      "neurolint webhook --test webhook-123",
      "neurolint webhook --logs webhook-123",
    ],
  },
  {
    command: "neurolint sso",
    description: "Manage Single Sign-On (SSO)",
    enterprise: true,
    options: [
      { flag: "--list", description: "List SSO providers" },
      {
        flag: "--setup <type>",
        description: "Setup SSO provider (saml|oidc|oauth2)",
      },
      { flag: "--test <id>", description: "Test SSO configuration" },
      { flag: "--sync <id>", description: "Sync users from SSO" },
      { flag: "--disable <id>", description: "Disable SSO provider" },
      { flag: "--domain <domain>", description: "Organization domain" },
    ],
    examples: [
      "neurolint sso --list",
      "neurolint sso --setup saml --domain company.com",
      "neurolint sso --test sso-123",
      "neurolint sso --sync sso-123",
    ],
  },
];

export default function Docs() {
  const navigate = useNavigate();
  const [selectedCommand, setSelectedCommand] = useState<CLICommand | null>(
    null,
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="mb-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              ← Back
            </Button>
            <h1 className="text-4xl font-bold text-white mb-2">
              NeuroLint Documentation
            </h1>
            <p className="text-xl text-zinc-400">
              Comprehensive guide for CLI tool and development workflow
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-zinc-900 border-zinc-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-zinc-800"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="installation"
              className="data-[state=active]:bg-zinc-800"
            >
              Installation
            </TabsTrigger>
            <TabsTrigger
              value="cli-commands"
              className="data-[state=active]:bg-zinc-800"
            >
              CLI Commands
            </TabsTrigger>
            <TabsTrigger
              value="layers"
              className="data-[state=active]:bg-zinc-800"
            >
              Analysis Layers
            </TabsTrigger>
            <TabsTrigger
              value="configuration"
              className="data-[state=active]:bg-zinc-800"
            >
              Configuration
            </TabsTrigger>
            <TabsTrigger
              value="enterprise"
              className="data-[state=active]:bg-zinc-800"
            >
              Enterprise
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">
                  Meet <span className="text-purple-400">NeuroLint</span>:
                  Effortless Code Cleanup & Modernization
                </CardTitle>
                <CardDescription className="text-zinc-400">
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
                        4 "layers" scan and upgrade everything from config to
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

                <div className="space-y-4">
                  <h3 className="font-semibold text-white mb-3">Quick Start</h3>

                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h4 className="font-medium text-white mb-3">
                      Installation & Basic Usage
                    </h4>
                    <pre className="text-sm text-zinc-300 bg-zinc-900 p-3 rounded font-mono mb-3">
                      {`# Install dependencies
npm install

# Fix everything, fast
npm run fix all

# Preview, don't apply
npm run fix dry run

# Just run a specific layer (e.g., component best practices)
npm run fix layer 3`}
                    </pre>
                  </div>

                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h4 className="font-medium text-white mb-3">
                      CLI Installation
                    </h4>
                    <pre className="text-sm text-zinc-300 bg-zinc-900 p-3 rounded font-mono">
                      {`# Install the CLI globally
npm install -g @neurolint/cli

# Initialize in your project
neurolint init

# Analyze your code
neurolint analyze src/

# Fix issues automatically
neurolint fix src/ --backup`}
                    </pre>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div>
                  <h3 className="font-semibold text-white mb-3">
                    Layered Autofixing: What Happens?
                  </h3>
                  <ul className="space-y-2 text-zinc-400">
                    <li>
                      <strong>Layer 1: Config++</strong> — Updates TS/Next
                      configs, package.json scripts, unlocks modern tooling
                    </li>
                    <li>
                      <strong>Layer 2: Code Patterns</strong> — Cleans up HTML
                      entities, removes noise, upgrades patterns & imports
                    </li>
                    <li>
                      <strong>Layer 3: Component Intelligence</strong> — Fixes
                      missing keys, adds accessibility, improves prop types,
                      enforces best TSX hygiene
                    </li>
                    <li>
                      <strong>Layer 4: Hydration & SSR</strong> — Guards against
                      SSR bugs, hydration drift, unsafe localStorage—rock-solid
                      for modern Next.js/React apps
                    </li>
                  </ul>
                </div>

                <Separator className="bg-zinc-700" />

                <div>
                  <h3 className="font-semibold text-white mb-3">
                    Example Fixes (See It Work!)
                  </h3>
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

          {/* Installation Tab */}
          <TabsContent value="installation" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">
                  Installation & Setup
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Get started with NeuroLint in your development environment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-white mb-3">
                    CLI Installation
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        npm (Recommended)
                      </h4>
                      <pre className="text-sm text-zinc-300 bg-zinc-900 p-3 rounded font-mono">
                        npm install -g @neurolint/cli
                      </pre>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">yarn</h4>
                      <pre className="text-sm text-zinc-300 bg-zinc-900 p-3 rounded font-mono">
                        yarn global add @neurolint/cli
                      </pre>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">pnpm</h4>
                      <pre className="text-sm text-zinc-300 bg-zinc-900 p-3 rounded font-mono">
                        pnpm add -g @neurolint/cli
                      </pre>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div>
                  <h3 className="font-semibold text-white mb-3">
                    Project Setup
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        1. Initialize NeuroLint
                      </h4>
                      <pre className="text-sm text-zinc-300 bg-zinc-900 p-3 rounded font-mono mb-2">
                        neurolint init
                      </pre>
                      <p className="text-zinc-400 text-sm">
                        Creates .neurolint.config.js with default settings
                      </p>
                    </div>

                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        2. Authentication (Optional)
                      </h4>
                      <pre className="text-sm text-zinc-300 bg-zinc-900 p-3 rounded font-mono mb-2">
                        neurolint login
                      </pre>
                      <p className="text-zinc-400 text-sm">
                        Connect to NeuroLint cloud for advanced features
                      </p>
                    </div>

                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        3. Verify Installation
                      </h4>
                      <pre className="text-sm text-zinc-300 bg-zinc-900 p-3 rounded font-mono mb-2">
                        neurolint --version
                      </pre>
                      <p className="text-zinc-400 text-sm">
                        Should display current version number
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div>
                  <h3 className="font-semibold text-white mb-3">
                    System Requirements
                  </h3>
                  <ul className="space-y-2 text-zinc-400">
                    <li>• Node.js 16.0.0 or higher</li>
                    <li>• npm, yarn, or pnpm package manager</li>
                    <li>• TypeScript 4.5+ (for TypeScript projects)</li>
                    <li>• React 16.8+ (for React projects)</li>
                    <li>• 512MB available memory</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CLI Commands Tab */}
          <TabsContent value="cli-commands" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  CLI Commands
                </h2>
                <div className="space-y-3">
                  {CLI_COMMANDS.map((cmd, index) => (
                    <Card
                      key={index}
                      className={`bg-zinc-900 border-zinc-800 cursor-pointer transition-colors hover:bg-zinc-800 ${
                        selectedCommand === cmd ? "ring-2 ring-zinc-600" : ""
                      }`}
                      onClick={() => setSelectedCommand(cmd)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <code className="font-mono text-sm text-zinc-300">
                            {cmd.command}
                          </code>
                          {cmd.enterprise && (
                            <Badge
                              variant="outline"
                              className="bg-purple-900 text-purple-200 border-purple-700 text-xs"
                            >
                              Enterprise
                            </Badge>
                          )}
                        </div>
                        {cmd.alias && (
                          <div className="text-xs text-zinc-500 mb-2">
                            Alias: {cmd.alias}
                          </div>
                        )}
                        <p className="text-sm text-zinc-400">
                          {cmd.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                {selectedCommand ? (
                  <Card className="bg-zinc-900 border-zinc-800 sticky top-6">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white font-mono text-lg">
                          {selectedCommand.command}
                        </CardTitle>
                        {selectedCommand.enterprise && (
                          <Badge
                            variant="outline"
                            className="bg-purple-900 text-purple-200 border-purple-700"
                          >
                            Enterprise
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-zinc-400">
                        {selectedCommand.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedCommand.alias && (
                        <div>
                          <h4 className="font-medium text-white mb-2">Alias</h4>
                          <code className="text-sm text-zinc-300 bg-zinc-800 p-2 rounded font-mono block">
                            {selectedCommand.alias}
                          </code>
                        </div>
                      )}

                      {selectedCommand.options.length > 0 && (
                        <div>
                          <h4 className="font-medium text-white mb-2">
                            Options
                          </h4>
                          <div className="space-y-2">
                            {selectedCommand.options.map((option, index) => (
                              <div
                                key={index}
                                className="bg-zinc-800 p-3 rounded"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <code className="font-mono text-sm text-zinc-300">
                                    {option.flag}
                                  </code>
                                  {option.default && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-zinc-700 text-zinc-300"
                                    >
                                      Default: {option.default}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-zinc-400">
                                  {option.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium text-white mb-2">
                          Examples
                        </h4>
                        <div className="space-y-2">
                          {selectedCommand.examples.map((example, index) => (
                            <div
                              key={index}
                              className="bg-zinc-800 p-3 rounded"
                            >
                              <code className="text-sm text-zinc-300 font-mono">
                                {example}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-8 text-center">
                      <h3 className="text-lg font-medium text-white mb-2">
                        Select a Command
                      </h3>
                      <p className="text-zinc-400">
                        Click on a command from the list to view detailed
                        documentation
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Analysis Layers Tab */}
          <TabsContent value="layers" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Analysis Layers</CardTitle>
                <CardDescription className="text-zinc-400">
                  Understanding NeuroLint's 6-layer analysis and transformation
                  system
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
                    Using Specific Layers
                  </h3>
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <pre className="text-sm text-zinc-300 font-mono">
                      {`# Run specific layers
neurolint analyze --layers=1,3,4 src/

# Run all layers
neurolint fix --layers=1,2,3,4,5,6 src/

# Skip performance layer
neurolint analyze --layers=1,2,3,4,6 src/`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Configuration</CardTitle>
                <CardDescription className="text-zinc-400">
                  Customize NeuroLint behavior with configuration files and
                  environment variables
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-white mb-3">
                    Configuration File
                  </h3>
                  <p className="text-zinc-400 mb-4">
                    NeuroLint uses{" "}
                    <code className="bg-zinc-800 px-2 py-1 rounded">
                      .neurolint.config.js
                    </code>{" "}
                    for project-specific settings.
                  </p>

                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h4 className="font-medium text-white mb-3">
                      Example Configuration
                    </h4>
                    <pre className="text-sm text-zinc-300 bg-zinc-900 p-4 rounded font-mono overflow-x-auto">
                      {`module.exports = {
  // API Configuration
  apiUrl: "https://api.neurolint.com",
  apiKey: process.env.NEUROLINT_API_KEY,

  // Analysis Settings
  enabledLayers: [1, 2, 3, 4],
  timeout: 30000,

  // File Processing
  include: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
  exclude: [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.next/**",
    "**/coverage/**"
  ],

  // Output Settings
  outputFormat: "table",
  showProgress: true,
  verbose: false,

  // Backup Settings
  createBackups: true,
  backupDir: ".neurolint-backups",

  // Enterprise Settings
  teamId: process.env.NEUROLINT_TEAM_ID,
  enterpriseFeatures: {
    auditLogging: true,
    complianceMode: true,
    ssoEnabled: false
  }
};`}
                    </pre>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div>
                  <h3 className="font-semibold text-white mb-3">
                    Environment Variables
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        NEUROLINT_API_KEY
                      </h4>
                      <p className="text-zinc-400 text-sm mb-2">
                        Your NeuroLint API authentication key
                      </p>
                      <code className="text-sm text-zinc-300 bg-zinc-900 p-2 rounded font-mono block">
                        export NEUROLINT_API_KEY=your_api_key_here
                      </code>
                    </div>

                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        NEUROLINT_API_URL
                      </h4>
                      <p className="text-zinc-400 text-sm mb-2">
                        Custom API endpoint (defaults to
                        https://api.neurolint.com)
                      </p>
                      <code className="text-sm text-zinc-300 bg-zinc-900 p-2 rounded font-mono block">
                        export
                        NEUROLINT_API_URL=https://your-custom-endpoint.com
                      </code>
                    </div>

                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        NEUROLINT_TEAM_ID
                      </h4>
                      <p className="text-zinc-400 text-sm mb-2">
                        Enterprise team identifier
                      </p>
                      <code className="text-sm text-zinc-300 bg-zinc-900 p-2 rounded font-mono block">
                        export NEUROLINT_TEAM_ID=team_123456789
                      </code>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div>
                  <h3 className="font-semibold text-white mb-3">
                    Configuration Management
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        View Current Configuration
                      </h4>
                      <code className="text-sm text-zinc-300 bg-zinc-900 p-2 rounded font-mono block">
                        neurolint config --list
                      </code>
                    </div>

                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        Update Configuration
                      </h4>
                      <code className="text-sm text-zinc-300 bg-zinc-900 p-2 rounded font-mono block">
                        neurolint config --set layers=1,2,3,4,5,6
                      </code>
                    </div>

                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        Reset to Defaults
                      </h4>
                      <code className="text-sm text-zinc-300 bg-zinc-900 p-2 rounded font-mono block">
                        neurolint config --reset
                      </code>
                    </div>
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
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">
                      Team Management
                    </h3>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        Multi-Team Support
                      </h4>
                      <p className="text-zinc-400 text-sm mb-3">
                        Organize users into teams with role-based permissions
                      </p>
                      <code className="text-sm text-zinc-300 bg-zinc-900 p-2 rounded font-mono block">
                        neurolint team --create "Frontend Team"
                      </code>
                    </div>

                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        Member Management
                      </h4>
                      <p className="text-zinc-400 text-sm mb-3">
                        Invite, remove, and manage team member permissions
                      </p>
                      <code className="text-sm text-zinc-300 bg-zinc-900 p-2 rounded font-mono block">
                        neurolint team --invite user@company.com
                      </code>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">
                      Analytics & Reporting
                    </h3>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        Usage Analytics
                      </h4>
                      <p className="text-zinc-400 text-sm mb-3">
                        Track team usage patterns and code quality metrics
                      </p>
                      <code className="text-sm text-zinc-300 bg-zinc-900 p-2 rounded font-mono block">
                        neurolint analytics --dashboard
                      </code>
                    </div>

                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        Compliance Reports
                      </h4>
                      <p className="text-zinc-400 text-sm mb-3">
                        Generate SOC2, GDPR, and ISO27001 compliance reports
                      </p>
                      <code className="text-sm text-zinc-300 bg-zinc-900 p-2 rounded font-mono block">
                        neurolint analytics --compliance
                      </code>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">
                      Security & Compliance
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">
                          Audit Logging
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Comprehensive audit trail for all team activities
                        </p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">
                          SSO Integration
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          SAML, OAuth 2.0, and OpenID Connect support
                        </p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">
                          Role-Based Access
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Granular permission control for team members
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">
                      Integration & Automation
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">
                          Webhook System
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Real-time notifications for analysis events
                        </p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">
                          CI/CD Integration
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Seamless integration with GitHub, GitLab, Jenkins
                        </p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">
                          Custom Policies
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Define organization-specific coding standards
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div>
                  <h3 className="font-semibold text-white mb-3">
                    Getting Started with Enterprise
                  </h3>
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <pre className="text-sm text-zinc-300 bg-zinc-900 p-4 rounded font-mono">
                      {`# Set up SSO
neurolint sso --setup saml --domain company.com

# Create team and invite members
neurolint team --create "Development Team"
neurolint team --invite dev@company.com --role admin

# Configure webhooks
neurolint webhook --create --url https://api.company.com/hooks

# Generate compliance report
neurolint audit --compliance soc2 --period quarter`}
                    </pre>
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
                  Need More Help?
                </h3>
                <p className="text-zinc-400 text-sm">
                  Explore additional resources and support options
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                >
                  GitHub Repository
                </Button>
                <Button
                  variant="outline"
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                >
                  Contact Support
                </Button>
                <Button className="bg-white text-black hover:bg-zinc-200">
                  Try NeuroLint App
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
