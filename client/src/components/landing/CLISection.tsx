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
                <div className="text-white">$ neurolint login</div>
                <div className="text-white">NeuroLint Authentication</div>
                <div className="text-gray-300">Authentication successful</div>
                <div className="text-white">$ neurolint init</div>
                <div className="text-white">NeuroLint CLI</div>
                <div className="text-gray-300">
                  Configuration created successfully
                </div>
                <div className="text-white">$ neurolint analyze src/</div>
                <div className="text-gray-300">
                  Discovering and validating files...
                </div>
                <div className="text-gray-300">
                  Found 47 valid files to analyze
                </div>
                <div className="text-gray-300">
                  Analysis (35/47) 74.5% - ETA: 12s
                </div>
                <div className="text-gray-300">
                  PASS Layer 1: Configuration Validation
                </div>
                <div className="text-gray-300">
                  PASS Layer 2: Pattern & Entity Fixes
                </div>
                <div className="text-gray-300">
                  PASS Layer 3: Component Best Practices
                </div>
                <div className="text-gray-300">
                  PASS Layer 4: Hydration & SSR Guard
                </div>
                <div className="text-white">Analysis Complete</div>
                <div className="text-white">Successfully analyzed: 45</div>
                <div className="text-white">Failed: 2</div>
                <div className="text-white">
                  $ neurolint fix --backup --dry-run
                </div>
                <div className="text-gray-300">
                  DRY RUN MODE - Preview changes:
                </div>
                <div className="text-gray-300">
                  src/components/Header.tsx - Would be modified
                </div>
                <div className="text-gray-300">
                  src/utils/helpers.ts - Would be modified
                </div>
                <div className="text-white animate-pulse">█</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Production-Ready Reliability
                </h3>
                <p className="text-gray-400">
                  Robust error handling, automatic retry logic, and progress
                  tracking with resumption capabilities for interrupted
                  operations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center">
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Enterprise Authentication
                </h3>
                <p className="text-gray-400">
                  Secure API key management with built-in authentication
                  validation and session management for team environments.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Advanced Input Validation
                </h3>
                <p className="text-gray-400">
                  Comprehensive file validation, size limits, and pattern
                  matching with detailed error reporting for safer operations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Data Protection
                </h3>
                <p className="text-gray-400">
                  Automatic backup creation, atomic file operations, and
                  rollback capabilities ensure your code is never at risk.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Commands */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold mb-8 text-white">
            Get Started in Seconds
          </h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
                <Settings className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold mb-2 text-white">Configure</h4>
              <code className="text-sm text-white bg-gray-900/50 px-3 py-1 rounded">
                neurolint init
              </code>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded flex items-center justify-center mb-3">
                <Play className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold mb-2 text-white">Analyze</h4>
              <code className="text-sm text-white bg-gray-900/50 px-3 py-1 rounded">
                neurolint analyze src/
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
