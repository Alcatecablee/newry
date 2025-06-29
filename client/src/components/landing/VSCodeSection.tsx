import React from "react";
import { Code2, Lightbulb, Eye, Settings, Download, Star } from "lucide-react";

export function VSCodeSection() {
  return (
    <section
      className="section-padding container-padding bg-zinc-950/80 backdrop-blur-xl"
      role="region"
      aria-labelledby="vscode-heading"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2
            id="vscode-heading"
            className="text-2xl font-bold mb-6 text-white tracking-tight"
          >
            Code in Your Editor
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
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
                    8 &#123;items.map(item =&gt;
                    &lt;div&gt;&#123;item&#125;&lt;/div&gt;)&#125;
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
                  <h4 className="text-xl font-black text-white">
                    Real-time Analysis
                  </h4>
                </div>
                <p className="text-gray-300 leading-relaxed font-medium">
                  Get instant feedback as you type with our advanced analysis
                  engine running in the background.
                </p>
              </div>

              <div className="bg-black/70 backdrop-blur-xl p-6 rounded-3xl border-2 border-zinc-800/50 hover:border-zinc-600/80 transition-all duration-300 hover:bg-black/90 group">
                <div className="flex items-center gap-4 mb-3">
                  <Lightbulb className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="text-xl font-black text-white">
                    Smart Suggestions
                  </h4>
                </div>
                <p className="text-gray-300 leading-relaxed font-medium">
                  Receive intelligent code improvements and pattern suggestions
                  tailored to your project.
                </p>
              </div>

              <div className="bg-black/70 backdrop-blur-xl p-6 rounded-3xl border-2 border-zinc-800/50 hover:border-zinc-600/80 transition-all duration-300 hover:bg-black/90 group">
                <div className="flex items-center gap-4 mb-3">
                  <Eye className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="text-xl font-black text-white">
                    Visual Indicators
                  </h4>
                </div>
                <p className="text-gray-300 leading-relaxed font-medium">
                  See potential issues highlighted directly in your editor with
                  detailed explanations.
                </p>
              </div>

              <div className="bg-black/70 backdrop-blur-xl p-6 rounded-3xl border-2 border-zinc-800/50 hover:border-zinc-600/80 transition-all duration-300 hover:bg-black/90 group">
                <div className="flex items-center gap-4 mb-3">
                  <Settings className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="text-xl font-black text-white">
                    Customizable Rules
                  </h4>
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
        </div>
      </div>
    </section>
  );
}
