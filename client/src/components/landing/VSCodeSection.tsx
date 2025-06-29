import React from "react";
import { Code2, Lightbulb, Eye, Settings, Download, Star } from "lucide-react";

export function VSCodeSection() {
  return (
    <section className="py-24 px-4 bg-zinc-900/30 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white">
            Code in Your Editor
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-medium">
            Experience NeuroLint directly in Visual Studio Code with real-time
            analysis, instant fixes, and seamless integration into your
            development workflow.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* VS Code Screenshot/Demo */}
          <div className="order-1 lg:order-1">
            <div className="bg-[#111111] border-2 border-zinc-800 rounded-3xl overflow-hidden shadow-2xl hover:border-zinc-600 transition-all duration-300">
              {/* VS Code Title Bar */}
              <div className="bg-zinc-900 px-6 py-4 flex items-center gap-3 border-b border-zinc-800">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
                  <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
                  <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-300 ml-4 font-medium">
                  Header.tsx - NeuroLint
                </div>
              </div>

              {/* VS Code Interface */}
              <div className="p-6">
                <div className="font-mono text-sm space-y-2">
                  <div className="text-gray-400">
                    1 import React from 'react';
                  </div>
                  <div className="text-gray-400">2 </div>
                  <div className="text-gray-400">
                    3 export function Header() &#123;
                  </div>
                  <div className="text-gray-400">
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
                  <div className="text-gray-400">5 </div>
                  <div className="flex items-center">
                    <div className="text-gray-400 mr-1">6</div>
                    <div className="text-gray-400">return (</div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-gray-400 mr-1">7</div>
                    <div className="text-red-400 mr-1">&lt;div&gt;</div>
                    <div className="bg-red-500 text-white px-2 py-1 text-xs rounded-md font-medium">
                      Missing key prop
                    </div>
                  </div>
                  <div className="text-gray-400">
                    8 &#123;items.map(item =&gt; &lt;div&gt;&#123;item&#125;&lt;/div&gt;)&#125;
                  </div>
                  <div className="text-gray-400">9 &lt;/div&gt;</div>
                  <div className="text-gray-400">10 );</div>
                  <div className="text-gray-400">11 &#125;</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="order-2 lg:order-2 space-y-8">
            <h3 className="text-2xl font-black text-white mb-8 tracking-tight">
              Code Smarter with NeuroLint
            </h3>

            <div className="space-y-4">
              <div className="bg-black/70 backdrop-blur-xl p-6 rounded-3xl border-2 border-zinc-800/50 hover:border-zinc-600/80 transition-all duration-300 hover:bg-black/90 group">
                <div className="flex items-center gap-4 mb-3">
                  <Code2 className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="text-xl font-black text-white">Real-time Analysis</h4>
                </div>
                <p className="text-gray-300 leading-relaxed font-medium">
                  Get instant feedback as you type with our advanced analysis
                  engine running in the background.
                </p>
              </div>

              <div className="bg-black/70 backdrop-blur-xl p-6 rounded-3xl border-2 border-zinc-800/50 hover:border-zinc-600/80 transition-all duration-300 hover:bg-black/90 group">
                <div className="flex items-center gap-4 mb-3">
                  <Lightbulb className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="text-xl font-black text-white">Smart Suggestions</h4>
                </div>
                <p className="text-gray-300 leading-relaxed font-medium">
                  Receive intelligent code improvements and pattern
                  suggestions tailored to your project.
                </p>
              </div>

              <div className="bg-black/70 backdrop-blur-xl p-6 rounded-3xl border-2 border-zinc-800/50 hover:border-zinc-600/80 transition-all duration-300 hover:bg-black/90 group">
                <div className="flex items-center gap-4 mb-3">
                  <Eye className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="text-xl font-black text-white">Visual Indicators</h4>
                </div>
                <p className="text-gray-300 leading-relaxed font-medium">
                  See potential issues highlighted directly in your editor
                  with detailed explanations.
                </p>
              </div>

              <div className="bg-black/70 backdrop-blur-xl p-6 rounded-3xl border-2 border-zinc-800/50 hover:border-zinc-600/80 transition-all duration-300 hover:bg-black/90 group">
                <div className="flex items-center gap-4 mb-3">
                  <Settings className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="text-xl font-black text-white">Customizable Rules</h4>
                </div>
                <p className="text-gray-300 leading-relaxed font-medium">
                  Configure analysis layers and rules to match your team's
                  coding standards and preferences.
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-6 flex-wrap">
              <button className="bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl flex items-center gap-3">
                <Download className="w-6 h-6" />
                Install Extension
              </button>
              <button className="border-2 border-zinc-800 text-white px-8 py-4 rounded-xl font-bold text-lg hover:border-zinc-600 transition-all duration-300">
                View Documentation
              </button>
            </div>
          </div>