import React from "react";
import { Terminal, Code, Zap, GitBranch, CheckCircle2 } from "lucide-react";

export function CLISection() {
  return (
    <section id="cli" className="relative z-10 py-20 bg-black backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-zinc-900">
            Command Line Power
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Integrate NeuroLint into your development workflow with our powerful
            CLI tool. Perfect for CI/CD pipelines, automated testing, and batch
            processing.
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
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="font-mono text-sm space-y-2">
                <div className="text-white">
                  $ npm install -g @neurolint/cli
                </div>
                <div className="text-gray-400">Installing NeuroLint CLI...</div>
                <div className="text-white">$ neurolint init</div>
                <div className="text-white">NeuroLint CLI</div>
                <div className="text-gray-300">
                  ✓ Configuration created successfully!
                </div>
                <div className="text-white">$ neurolint analyze src/</div>
                <div className="text-gray-300">Analyzing 47 files...</div>
                <div className="text-gray-300">
                  ✓ Layer 1: Configuration Validation (12 fixes)
                </div>
                <div className="text-gray-300">
                  ✓ Layer 2: Pattern & Entity Fixes (8 fixes)
                </div>
                <div className="text-gray-300">
                  ✓ Layer 3: Component Best Practices (15 fixes)
                </div>
                <div className="text-gray-300">
                  ✓ Layer 4: Hydration & SSR Guard (5 fixes)
                </div>
                <div className="text-white">
                  Analysis complete: 40 issues found, 35 auto-fixable
                </div>
                <div className="text-white">$ neurolint fix --dry-run</div>
                <div className="text-zinc-400">
                  DRY RUN MODE - Preview changes:
                </div>
                <div className="text-gray-300">
                  ~ src/components/Header.tsx - Missing key props
                </div>
                <div className="text-gray-300">
                  ~ src/utils/helpers.ts - Performance optimization
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
                  Lightning Fast Analysis
                </h3>
                <p className="text-gray-400">
                  Process thousands of files in seconds with parallel analysis
                  and intelligent caching.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center">
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  CI/CD Integration
                </h3>
                <p className="text-gray-400">
                  Seamlessly integrate with GitHub Actions, Jenkins, GitLab CI,
                  and other automation tools.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Flexible Configuration
                </h3>
                <p className="text-gray-400">
                  Customize analysis layers, output formats, and file patterns
                  to match your project needs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-600/20 border border-orange-500/30 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Safe Transformations
                </h3>
                <p className="text-gray-400">
                  Preview changes with dry-run mode and automatic backups before
                  applying fixes.
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
              <div className="text-3xl mb-3">📦</div>
              <h4 className="font-semibold mb-2 text-white">Install</h4>
              <code className="text-sm text-green-400 bg-gray-900/50 px-3 py-1 rounded">
                npm install -g @neurolint/cli
              </code>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="text-3xl mb-3">⚙️</div>
              <h4 className="font-semibold mb-2 text-white">Configure</h4>
              <code className="text-sm text-blue-400 bg-gray-900/50 px-3 py-1 rounded">
                neurolint init
              </code>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="text-3xl mb-3">🚀</div>
              <h4 className="font-semibold mb-2 text-white">Analyze</h4>
              <code className="text-sm text-purple-400 bg-gray-900/50 px-3 py-1 rounded">
                neurolint analyze src/
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
