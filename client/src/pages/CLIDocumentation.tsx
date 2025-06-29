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

export default function CLIDocumentation() {
  const navigate = useNavigate();
  const [selectedCommand, setSelectedCommand] = useState<CLICommand | null>(
    null,
  );

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
            NeuroLint CLI Documentation
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl font-medium">
            Enterprise command-line tool for advanced code analysis and
            transformation
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-[#111111] border-2 border-zinc-800 p-2 rounded-2xl">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-gray-400 px-6 py-3 rounded-xl font-medium"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="installation"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-gray-400 px-6 py-3 rounded-xl font-medium"
            >
              Installation
            </TabsTrigger>
            <TabsTrigger
              value="commands"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-gray-400 px-6 py-3 rounded-xl font-medium"
            >
              Commands
            </TabsTrigger>
            <TabsTrigger
              value="configuration"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-gray-400 px-6 py-3 rounded-xl font-medium"
            >
              Configuration
            </TabsTrigger>
            <TabsTrigger
              value="enterprise"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-gray-400 px-6 py-3 rounded-xl font-medium"
            >
              Enterprise
            </TabsTrigger>
          </TabsList>
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">CLI Overview</CardTitle>
                <CardDescription className="text-zinc-400">
                  Production-ready command-line interface with enterprise
                  features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-3">
                    What is NeuroLint CLI?
                  </h3>
                  <p className="text-zinc-400 mb-4">
                    NeuroLint CLI is a powerful command-line tool that brings
                    advanced code analysis and transformation capabilities
                    directly to your terminal. Built for enterprise environments
                    with robust error handling, team management, and security
                    features.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        Enterprise Ready
                      </h4>
                      <p className="text-zinc-400 text-sm">
                        SOC2 compliant with audit logging, SSO, and team
                        management
                      </p>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        Powerful Analysis
                      </h4>
                      <p className="text-zinc-400 text-sm">
                        6-layer analysis engine for comprehensive code
                        improvements
                      </p>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        CI/CD Integration
                      </h4>
                      <p className="text-zinc-400 text-sm">
                        Seamless integration with GitHub, GitLab, Jenkins, and
                        more
                      </p>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        Interactive Mode
                      </h4>
                      <p className="text-zinc-400 text-sm">
                        User-friendly interactive prompts for guided workflows
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div>
                  <h3 className="font-semibold text-white mb-3">Quick Start</h3>
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <pre className="text-sm text-zinc-300 font-mono">
                      {`# Install globally
npm install -g @neurolint/cli

# Verify installation
neurolint --version

# Initialize in your project
neurolint init

# Run analysis
neurolint analyze src/

# Fix issues automatically
neurolint fix src/ --backup`}
                    </pre>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div>
                  <h3 className="font-semibold text-white mb-3">
                    Core Features
                  </h3>
                  <ul className="space-y-2 text-zinc-400">
                    <li>
                      • <strong>Code Analysis</strong> - Deep analysis across 6
                      specialized layers
                    </li>
                    <li>
                      • <strong>Automatic Fixes</strong> - Safe, automated code
                      transformations
                    </li>
                    <li>
                      • <strong>Team Management</strong> - Multi-team support
                      with role-based access
                    </li>
                    <li>
                      • <strong>Analytics & Reporting</strong> - Comprehensive
                      usage and compliance reports
                    </li>
                    <li>
                      • <strong>SSO Integration</strong> - SAML, OAuth2, and
                      OpenID Connect support
                    </li>
                    <li>
                      • <strong>Webhook System</strong> - Real-time
                      notifications and integrations
                    </li>
                  </ul>
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
                  Get the NeuroLint CLI up and running in your environment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-white mb-3">
                    System Requirements
                  </h3>
                  <ul className="space-y-2 text-zinc-400 mb-6">
                    <li>• Node.js 16.0.0 or higher</li>
                    <li>• npm, yarn, or pnpm package manager</li>
                    <li>• TypeScript 4.5+ (for TypeScript projects)</li>
                    <li>• React 16.8+ (for React projects)</li>
                    <li>• 512MB available memory</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-3">
                    Installation Methods
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
                  <div className="space-y-4">
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        1. Verify Installation
                      </h4>
                      <pre className="text-sm text-zinc-300 bg-zinc-900 p-3 rounded font-mono mb-2">
                        neurolint --version
                      </pre>
                      <p className="text-zinc-400 text-sm">
                        Should display the current version number
                      </p>
                    </div>

                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        2. Initialize Project
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
                        3. Authentication (Optional)
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
                        4. First Analysis
                      </h4>
                      <pre className="text-sm text-zinc-300 bg-zinc-900 p-3 rounded font-mono mb-2">
                        neurolint analyze src/
                      </pre>
                      <p className="text-zinc-400 text-sm">
                        Run your first code analysis
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commands Tab */}
          <TabsContent value="commands" className="space-y-6">
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

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Configuration</CardTitle>
                <CardDescription className="text-zinc-400">
                  Customize NeuroLint CLI behavior with configuration files and
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

        {/* Support Section */}
        <Card className="bg-zinc-900 border-zinc-800 mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white mb-1">Need Help?</h3>
                <p className="text-zinc-400 text-sm">
                  Get support and explore additional resources
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                >
                  GitHub Issues
                </Button>
                <Button
                  variant="outline"
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                >
                  Contact Support
                </Button>
                <Button className="bg-white text-black hover:bg-zinc-200">
                  Main Documentation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
