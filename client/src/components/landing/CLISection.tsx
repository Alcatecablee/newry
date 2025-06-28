import React from "react";
import {
  Terminal,
  Code,
  Zap,
  GitBranch,
  CheckCircle2,
  Download,
  Settings,
  Play,
  Shield,
  Clock,
  RefreshCw,
  Users,
  BarChart3,
  Webhook,
  Key,
  FileText,
} from "lucide-react";

export function CLISection() {
  return (
    <section id="cli" className="relative z-10 py-20 bg-black backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Enterprise CLI Tool
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Production-ready command line interface with robust error handling,
            progress tracking, and enterprise-grade reliability. Built for
            professional development workflows.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* CLI Demo */}
          <div className="order-2 lg:order-1">
            <div className="bg-gray-900/90 border border-gray-700 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
                <Terminal className="w-4 h-4" />
                <span>Terminal</span>
                <div className="flex gap-1 ml-auto">
                  <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
                  <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
                  <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
                </div>
              </div>
              <div className="font-mono text-sm space-y-2">
                <div className="text-white">
                  $ npm install -g @neurolint/cli
                </div>
                <div className="text-gray-400">Installing NeuroLint CLI...</div>
                <div className="text-white">$ neurolint login --enterprise</div>
                <div className="text-white">NeuroLint CLI</div>
                <div className="text-gray-300">
                  Enterprise authentication required.
                </div>
                <div className="text-gray-300">Authentication successful</div>
                <div className="text-white">$ neurolint enterprise</div>
                <div className="text-white">NeuroLint Enterprise Features</div>
                <div className="text-gray-300">
                  neurolint team - Team management
                </div>
                <div className="text-gray-300">
                  neurolint analytics - Analytics and reporting
                </div>
                <div className="text-gray-300">
                  neurolint webhook - Webhook management
                </div>
                <div className="text-gray-300">
                  neurolint sso - Single Sign-On
                </div>
                <div className="text-gray-300">
                  neurolint audit - Audit trail and compliance
                </div>
                <div className="text-white">$ neurolint team --list</div>
                <div className="text-white">Teams:</div>
                <div className="text-gray-300">Development Team (team-123)</div>
                <div className="text-gray-300"> Members: 12</div>
                <div className="text-gray-300"> SSO: Enabled</div>
                <div className="text-white">$ neurolint analytics --export</div>
                <div className="text-gray-300">Fetching analytics data...</div>
                <div className="text-gray-300">
                  Analytics exported to: analytics-2024-01-15.json
                </div>
                <div className="text-gray-300">Format: JSON</div>
                <div className="text-white animate-pulse">█</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Team Management
                </h3>
                <p className="text-gray-400">
                  Complete team collaboration with member management, role-based
                  access control, and invitation workflows for enterprise teams.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Analytics & Reporting
                </h3>
                <p className="text-gray-400">
                  Executive dashboards, compliance reports, and data export in
                  multiple formats with real-time metrics and business insights.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  SSO Integration
                </h3>
                <p className="text-gray-400">
                  Enterprise SSO with SAML, OIDC, and OAuth2 support for
                  seamless authentication integration with your existing
                  identity systems.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Audit & Compliance
                </h3>
                <p className="text-gray-400">
                  Complete audit trails, SOC2/GDPR/ISO27001 compliance
                  reporting, and security monitoring for enterprise governance
                  requirements.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Commands */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold mb-8 text-white">
            Enterprise-Grade Features
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded flex items-center justify-center mb-3">
                <Download className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold mb-2 text-white">Install</h4>
              <code className="text-sm text-white bg-gray-900/50 px-3 py-1 rounded">
                npm install -g @neurolint/cli
              </code>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded flex items-center justify-center mb-3">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold mb-2 text-white">Enterprise Auth</h4>
              <code className="text-sm text-white bg-gray-900/50 px-3 py-1 rounded">
                neurolint login --enterprise
              </code>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded flex items-center justify-center mb-3">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold mb-2 text-white">Team Setup</h4>
              <code className="text-sm text-white bg-gray-900/50 px-3 py-1 rounded">
                neurolint team --create
              </code>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded flex items-center justify-center mb-3">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold mb-2 text-white">Analytics</h4>
              <code className="text-sm text-white bg-gray-900/50 px-3 py-1 rounded">
                neurolint analytics --export
              </code>
            </div>
          </div>

          {/* Advanced Commands */}
          <div className="mt-12">
            <h4 className="text-lg font-semibold mb-6 text-white">
              Enterprise Operations
            </h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Webhook className="w-4 h-4 text-white" />
                  <span className="text-white font-medium">Webhook Setup</span>
                </div>
                <code className="text-xs text-gray-300 bg-gray-900/50 px-2 py-1 rounded">
                  neurolint webhook --create --url api.com
                </code>
              </div>
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-white" />
                  <span className="text-white font-medium">SSO Config</span>
                </div>
                <code className="text-xs text-gray-300 bg-gray-900/50 px-2 py-1 rounded">
                  neurolint sso --setup saml --domain org.com
                </code>
              </div>
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-white" />
                  <span className="text-white font-medium">Audit Reports</span>
                </div>
                <code className="text-xs text-gray-300 bg-gray-900/50 px-2 py-1 rounded">
                  neurolint audit --compliance soc2
                </code>
              </div>
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-white" />
                  <span className="text-white font-medium">Team Invite</span>
                </div>
                <code className="text-xs text-gray-300 bg-gray-900/50 px-2 py-1 rounded">
                  neurolint team --invite user@org.com
                </code>
              </div>
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-white" />
                  <span className="text-white font-medium">Dashboard</span>
                </div>
                <code className="text-xs text-gray-300 bg-gray-900/50 px-2 py-1 rounded">
                  neurolint analytics --dashboard
                </code>
              </div>
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-white" />
                  <span className="text-white font-medium">Security Audit</span>
                </div>
                <code className="text-xs text-gray-300 bg-gray-900/50 px-2 py-1 rounded">
                  neurolint audit --trail --days 30
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
