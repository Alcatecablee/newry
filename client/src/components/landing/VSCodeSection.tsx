import React from "react";
import { Code2, Lightbulb, Eye, Settings, Download, Star } from "lucide-react";

export function VSCodeSection() {
  return (
    <section
      id="vscode"
      className="relative z-10 py-20 bg-black backdrop-blur-sm"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-zinc-900">
            Code in Your Editor
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience NeuroLint directly in Visual Studio Code with real-time
            analysis, instant fixes, and seamless integration into your
            development workflow.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* VS Code Screenshot/Demo */}
          <div className="order-1 lg:order-1">
            <div className="bg-gray-900/90 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
              {/* VS Code Title Bar */}
              <div className="bg-gray-800 px-4 py-3 flex items-center gap-2 border-b border-gray-700">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
                  <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
                  <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-300 ml-4">
                  Header.tsx - NeuroLint
                </div>
              </div>

              {/* VS Code Interface */}
              <div className="p-6">
                <div className="font-mono text-sm space-y-2">
                  <div className="text-gray-500">
                    1 import React from 'react';
                  </div>
                  <div className="text-gray-500">2 </div>
                  <div className="text-gray-500">
                    3 export function Header() &#123;
                  </div>
                  <div className="text-gray-500">
                    4 const items = ['Home', 'About', 'Contact'];
                  </div>
                  <div className="text-gray-500">5 </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">6</span>
                    <span className="text-gray-300"> return (</span>
                    <div className="bg-zinc-500/20 border border-zinc-500/50 rounded px-2 py-1 text-xs text-zinc-300 ml-4">
                      <Lightbulb className="w-3 h-3 inline mr-1" />
                      Missing key prop
                    </div>
                  </div>
                  <div className="text-gray-500">7 &lt;nav&gt;</div>
                  <div className="flex items-center">
                    <span className="text-gray-500">8</span>
                    <span className="text-gray-300 ml-4">
                      &#123;items.map(item =&gt;
                    </span>
                    <span className="bg-red-500/20 border-l-2 border-red-500 pl-2 text-red-300">
                      &lt;li&gt;&#123;item&#125;&lt;/li&gt;
                    </span>
                  </div>
                  <div className="text-gray-500">9 )&#125;</div>
                  <div className="text-gray-500">10 &lt;/nav&gt;</div>
                  <div className="text-gray-500">11 );</div>
                  <div className="text-gray-500">12 &#125;</div>
                </div>

                {/* Quick Fix Popup */}
                <div className="mt-4 bg-gray-800 border border-gray-600 rounded-lg p-4 max-w-sm">
                  <div className="text-sm font-medium text-white mb-2">
                    NeuroLint Quick Fix
                  </div>
                  <div className="text-xs text-gray-300 mb-3">
                    Add missing key prop to list items
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors">
                    Apply Fix
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="order-2 lg:order-2 space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-600/20 border border-zinc-500/30 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Real-time Diagnostics
                </h3>
                <p className="text-gray-400">
                  See issues highlighted instantly as you type with advanced
                  rule-based error detection and warnings.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-600/20 border border-zinc-500/30 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Advanced Quick Fixes
                </h3>
                <p className="text-gray-400">
                  One-click solutions for common issues with rule-based code
                  transformations and best practices.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-600/20 border border-zinc-500/30 rounded-lg flex items-center justify-center">
                <Code2 className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Workspace Analysis
                </h3>
                <p className="text-gray-400">
                  Analyze entire projects with comprehensive reporting and batch
                  transformations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-600/20 border border-zinc-500/30 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  Customizable Layers
                </h3>
                <p className="text-gray-400">
                  Configure which analysis layers to run and customize rules to
                  match your coding standards.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Installation Stats */}
        <div className="mt-16">
          <div className="bg-zinc-900">
            <h3 className="text-2xl font-semibold mb-6 text-white">
              Join Thousands of Developers
            </h3>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  50K+
                </div>
                <div className="text-gray-400">Active Installs</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-3xl font-bold text-zinc-400 mb-2">
                  4.9 <Star className="w-6 h-6 fill-current" />
                </div>
                <div className="text-gray-400">Marketplace Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">
                  1M+
                </div>
                <div className="text-gray-400">Issues Fixed</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
                <Download className="w-5 h-5" />
                Install Extension
              </button>
              <button className="border border-gray-600 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
