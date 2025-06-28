import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FAQSection } from "@/components/landing/FAQSection";
import { TechnologySection } from "@/components/landing/TechnologySection";

import {
  Target,
  Zap,
  Search,
  Puzzle,
  BarChart3,
  Atom,
  CheckCircle,
  Shield,
  Terminal,
  Code,
  Database,
  Users,
  Settings,
  Monitor,
  Cpu,
  GitBranch,
  Download,
  Play,
  Copy,
  ExternalLink,
} from "lucide-react";

// Lazy Loading Hook
const useInView = (threshold = 0.1) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isInView] as const;
};

// TypewriterHeadline Component
const TypewriterHeadline: React.FC = () => {
  const [currentText, setCurrentText] = React.useState("");
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);

  const words = [
    "Code Analysis",
    "Bug Detection",
    "Code Optimization",
    "Performance Tuning",
    "Code Transformation",
  ];

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const delayBetweenWords = 2000;

    if (currentIndex < words[currentWordIndex].length) {
      timeout = setTimeout(() => {
        setCurrentText((prev) => prev + words[currentWordIndex][currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, typingSpeed);
    } else {
      timeout = setTimeout(
        () => {
          if (currentText.length > 0) {
            setCurrentText((prev) => prev.slice(0, -1));
          } else {
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
            setCurrentIndex(0);
          }
        },
        currentText.length === words[currentWordIndex].length
          ? delayBetweenWords
          : deletingSpeed,
      );
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, currentText, currentWordIndex, words]);

  return (
    <div className="mb-12">
      <h1 className="text-5xl md:text-7xl font-black mb-8 text-white leading-tight tracking-tight min-h-[1.2em]">
        {currentText}
      </h1>
    </div>
  );
};

export default function Index() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll(".feature-card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
        (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center text-center px-4 py-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-zinc-900/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-zinc-800/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-zinc-900/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto z-10 animate-fade-in">
          <div className="mb-12">
            <span className="px-6 py-3 bg-zinc-900/70 rounded-2xl text-base font-bold backdrop-blur-xl border-2 border-zinc-800 hover:border-zinc-700 transition-all duration-300">
              Next Generation Code Analysis
            </span>
          </div>

          <TypewriterHeadline />

          <div className="relative mb-16">
            <p className="text-2xl md:text-3xl text-gray-200 mb-16 max-w-4xl mx-auto leading-relaxed px-8 py-8 backdrop-blur-xl rounded-3xl border-2 border-zinc-800/30 font-medium">
              Experience advanced code analysis with our{" "}
              <span className="text-white font-black">
                transformation platform
              </span>
              . Detect bugs, optimize performance, and{" "}
              <span className="text-white font-black">
                maintain clean code automatically
              </span>
              .
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <Link
              to="/app"
              className="group relative px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-gray-100 transition-all duration-300 ease-out flex items-center justify-center gap-3 text-lg shadow-2xl hover:shadow-white/20 hover:scale-105"
            >
              Start Analyzing
              <svg
                className="w-6 h-6 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>

            <a
              href="#features"
              className="group relative px-10 py-5 bg-black/50 text-white font-black rounded-2xl border-2 border-zinc-800 hover:bg-black hover:border-zinc-600 transition-all duration-300 flex items-center justify-center gap-3 text-lg backdrop-blur-xl hover:scale-105"
            >
              See How It Works
              <svg
                className="w-6 h-6 group-hover:translate-y-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Test Suite CTA Section */}
      <section className="py-16 px-4 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white tracking-tight">
            See NeuroLint in Action
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
            Try our interactive test suite to see how NeuroLint transforms your
            code
          </p>
          <Link
            to="/test"
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl"
          >
            <Play className="w-6 h-6" />
            Try Test Suite
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-black"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white">
              Multi-Layer Analysis System
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-medium">
              Our six-layer analysis system catches issues other tools miss
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Syntax Analysis",
                description:
                  "Advanced parsing catches syntax errors and potential issues before they cause problems.",
                icon: Zap,
              },
              {
                title: "Pattern Detection",
                description:
                  "Identifies common anti-patterns and suggests modern alternatives.",
                icon: Search,
              },
              {
                title: "Component Analysis",
                description:
                  "Ensures React components follow best practices and performance guidelines.",
                icon: Puzzle,
              },
              {
                title: "Data Flow Check",
                description:
                  "Validates prop types, state management, and data flow through your application.",
                icon: BarChart3,
              },
              {
                title: "Framework Optimization",
                description:
                  "Specific checks for Next.js and other modern framework features.",
                icon: Atom,
              },
              {
                title: "Testing Coverage",
                description:
                  "Analyzes test coverage and suggests areas needing more testing.",
                icon: CheckCircle,
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="feature-card bg-black/70 backdrop-blur-xl p-10 rounded-3xl relative border-2 border-zinc-800/50 hover:border-zinc-600/80 transition-all duration-300 hover:bg-black/90 group h-[280px] flex flex-col"
              >
                <div className="flex items-center gap-4 mb-6">
                  <feature.icon className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-2xl font-black text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-300 leading-relaxed font-medium flex-grow">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-zinc-900/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white">
              How It Works
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-medium">
              Three simple steps to better code
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Upload Your Code",
                description:
                  "Simply drag and drop your files or connect your repository for continuous analysis.",
              },
              {
                step: "02",
                title: "Code Analysis",
                description:
                  "Our six-layer analysis system examines your code for issues and improvement opportunities. Currently in beta with AI-ready architecture.",
              },
              {
                step: "03",
                title: "Get Results",
                description:
                  "Receive detailed reports with actionable fixes and improvements, prioritized by impact.",
              },
            ].map((item, index) => (
              <div key={index} className="group relative">
                <div className="relative p-10 bg-[#111111] border-2 border-zinc-800 rounded-3xl hover:border-zinc-600 transition-all duration-300 hover:bg-zinc-900/50 h-[320px] flex flex-col">
                  <div className="text-5xl font-black text-white mb-8">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-black mb-6 text-white">
                    {item.title}
                  </h3>
                  <p className="text-zinc-300 leading-relaxed font-medium text-lg flex-grow">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLI Tool Section */}
      <section id="cli" className="py-20 bg-black border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
              Enterprise CLI Tool
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Production-ready command line interface with robust error handling,
              progress tracking, and enterprise-grade reliability. Built for professional
              development workflows and CI/CD pipelines.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-white">
                  Quick Installation
                </h3>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Terminal</span>
                    <button className="text-zinc-400 hover:text-white transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <code className="text-white font-mono">
                    npm install -g @neurolint/cli
                  </code>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <Terminal className="w-6 h-6 text-white" />
                  <div>
                    <h4 className="font-semibold text-white">
                      Production-Ready Reliability
                    </h4>
                    <p className="text-zinc-400 text-sm">
                      Robust error handling, automatic retry logic, and progress tracking
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <GitBranch className="w-6 h-6 text-white" />
                  <div>
                    <h4 className="font-semibold text-white">
                      Enterprise Authentication
                    </h4>
                    <p className="text-zinc-400 text-sm">
                      Secure API key management with built-in authentication validation
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <Settings className="w-6 h-6 text-white" />
                  <div>
                    <h4 className="font-semibold text-white">
                      Data Protection
                    </h4>
                    <p className="text-zinc-400 text-sm">
                      Automatic backup creation and atomic file operations
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="bg-zinc-900 px-4 py-3 flex items-center gap-2 border-b border-zinc-800">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm text-zinc-400 ml-4">Terminal</span>
              </div>
              <div className="p-6 font-mono text-sm space-y-2">
                <div className="text-white">$ neurolint analyze src/</div>
                <div className="text-zinc-400">Analyzing 24 files...</div>
                <div className="text-white">
                  ��� Layer 1: Configuration (0.2s)
                </div>
                <div className="text-white">
                  ✓ Layer 2: Pattern Detection (0.8s)
                </div>
                <div className="text-white">
                  ✓ Layer 3: Component Analysis (1.2s)
                </div>
                <div className="text-zinc-400">
                  ! Found 12 issues, 8 auto-fixable
                </div>
                <div className="text-white">$ neurolint fix --auto</div>
                <div className="text-zinc-400">Applying automatic fixes...</div>
                <div className="text-white">Fixed 8/12 issues successfully</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VS Code Extension Section */}
      <section id="vscode" className="py-20 bg-black border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
              VS Code Extension
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Get real-time code analysis and automated suggestions directly in
              your favorite editor. Never leave your development environment.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-zinc-900 px-4 py-3 flex items-center gap-2 border-b border-zinc-800">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm text-zinc-400 ml-4">
                  component.tsx - NeuroLint
                </span>
              </div>
              <div className="p-6">
                <div className="font-mono text-sm space-y-2">
                  <div className="text-zinc-400">
                    1 import React from 'react';
                  </div>
                  <div className="text-zinc-400">2 </div>
                  <div className="text-zinc-400">
                    3 export function Header() &#123;
                  </div>
                  <div className="text-zinc-400">
                    4 const items = ['Home', 'About', 'Contact'];
                  </div>
                  <div className="text-zinc-400">5 </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">6</span>
                    <span className="text-white"> return (</span>
                    <div className="bg-zinc-900 border border-zinc-800er rounded px-2 py-1 text-xs text-white ml-4">
                      Missing key prop
                    </div>
                  </div>
                  <div className="text-zinc-400">7 &lt;nav&gt;</div>
                  <div className="flex items-center">
                    <span className="text-zinc-400">8</span>
                    <span className="text-white ml-4">
                      &#123;items.map(item =&gt;
                    </span>
                    <span className="bg-zinc-900 border-l-2 border-white pl-2 text-white">
                      &lt;li&gt;&#123;item&#125;&lt;/li&gt;
                    </span>
                  </div>
                  <div className="text-zinc-400">9 )&#125;</div>
                  <div className="text-zinc-400">10 &lt;/nav&gt;</div>
                  <div className="text-zinc-400">11 );</div>
                  <div className="text-zinc-400">12 &#125;</div>
                </div>

                <div className="mt-4 p-3 bg-zinc-900 border border-zinc-800er rounded-lg">
                  <div className="flex items-center gap-2 text-white text-sm">
                    <Code className="w-4 h-4" />
                    <span>NeuroLint suggests: Add key prop to list items</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-white">
                  Install from Marketplace
                </h3>
                <div className="flex gap-4">
                  <button className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Install Extension
                  </button>
                  <button className="border border-zinc-800 text-white px-6 py-3 rounded-lg font-medium hover:border-white transition-colors flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View on Marketplace
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <Monitor className="w-6 h-6 text-white" />
                  <div>
                    <h4 className="font-semibold text-white">
                      Real-time Analysis
                    </h4>
                    <p className="text-zinc-400 text-sm">
                      Get instant feedback as you type
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <Zap className="w-6 h-6 text-white" />
                  <div>
                    <h4 className="font-semibold text-white">Quick Fixes</h4>
                    <p className="text-zinc-400 text-sm">
                      One-click solutions for common issues
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <Database className="w-6 h-6 text-white" />
                  <div>
                    <h4 className="font-semibold text-white">
                      Workspace Analysis
                    </h4>
                    <p className="text-zinc-400 text-sm">
                      Analyze entire projects with detailed reports
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REST API Section */}
      <section id="api" className="py-20 bg-black border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
              REST API
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Integrate NeuroLint's powerful analysis capabilities into your own
              applications with our comprehensive REST API.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-white">
                  API Endpoints
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                    <span className="bg-white text-black px-2 py-1 rounded text-xs font-mono">
                      POST
                    </span>
                    <code className="text-white">/api/analyze</code>
                    <span className="text-zinc-400 text-sm">Analyze code</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                    <span className="bg-white text-black px-2 py-1 rounded text-xs font-mono">
                      POST
                    </span>
                    <code className="text-white">/api/transform</code>
                    <span className="text-zinc-400 text-sm">
                      Transform code
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                    <span className="bg-white text-black px-2 py-1 rounded text-xs font-mono">
                      GET
                    </span>
                    <code className="text-white">/api/layers</code>
                    <span className="text-zinc-400 text-sm">
                      Get available layers
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <Shield className="w-6 h-6 text-white" />
                  <div>
                    <h4 className="font-semibold text-white">
                      Secure Authentication
                    </h4>
                    <p className="text-zinc-400 text-sm">
                      API key-based authentication with rate limiting
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <Cpu className="w-6 h-6 text-white" />
                  <div>
                    <h4 className="font-semibold text-white">
                      High Performance
                    </h4>
                    <p className="text-zinc-400 text-sm">
                      Optimized for speed with sub-second response times
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-white" />
                  <div>
                    <h4 className="font-semibold text-white">
                      Detailed Analytics
                    </h4>
                    <p className="text-zinc-400 text-sm">
                      Comprehensive usage analytics and insights
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="bg-zinc-900 px-4 py-3 flex items-center gap-2 border-b border-zinc-800">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm text-zinc-400 ml-4">API Example</span>
              </div>
              <div className="p-6 font-mono text-sm space-y-2">
                <div className="text-white">$ neurolint login</div>
                <div className="text-zinc-400">NeuroLint Authentication</div>
                <div className="text-zinc-400">Authentication successful</div>
                <div className="text-white">$ neurolint analyze src/</div>
                <div className="text-zinc-400">Discovering and validating files...</div>
                <div className="text-zinc-400">Found 24 valid files to analyze</div>
                <div className="text-zinc-400">Analysis (18/24) 75.0% - ETA: 8s</div>
                <div className="text-white">PASS Layer 1: Configuration Validation</div>
                <div className="text-white">PASS Layer 2: Pattern & Entity Fixes</div>
                <div className="text-white">PASS Layer 3: Component Best Practices</div>
                <div className="text-white">Analysis Complete</div>
                <div className="text-white">Successfully analyzed: 22</div>
                <div className="text-white">Failed: 2</div>
                <div className="text-white">$ neurolint fix --backup --dry-run</div>
                <div className="text-zinc-400">DRY RUN MODE - Preview changes:</div>
                <div className="text-zinc-400">src/components/Header.tsx - Would be modified</div>
                <div className="text-white animate-pulse">█</div>
              </div>
                    "performance": &#123; "totalTime": 0.85 &#125;
                  </div>
                  <div className="text-white">&#125;</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 bg-black border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
              Seamless Integrations
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Connect NeuroLint with your existing development tools and
              workflows
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-white transition-colors">
              <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mb-4">
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                GitHub Actions
              </h3>
              <p className="text-zinc-400 text-sm">
                Automated code analysis on every pull request
              </p>
            </div>

            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-white transition-colors">
              <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Jenkins</h3>
              <p className="text-zinc-400 text-sm">
                Integrate with your CI/CD pipeline
              </p>
            </div>

            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-white transition-colors">
              <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Slack</h3>
              <p className="text-zinc-400 text-sm">
                Get notifications in your team channels
              </p>
            </div>

            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-white transition-colors">
              <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Webhooks
              </h3>
              <p className="text-zinc-400 text-sm">
                Custom integrations with any platform
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <TechnologySection />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto relative">
          <div className="relative bg-zinc-900/70 border-2 border-zinc-800 rounded-3xl p-16 md:p-24 text-center backdrop-blur-xl">
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white">
              Ready to Transform Your Code?
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-4xl mx-auto font-medium">
              Join developers who are writing better code with our advanced
              transformation platform
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/app"
                className="px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-gray-100 transition-all duration-300 text-lg shadow-2xl hover:scale-105"
              >
                Start Free Trial
              </Link>
              <Link
                to="/pricing"
                className="px-10 py-5 bg-black/50 text-white font-black rounded-2xl border-2 border-zinc-800 hover:bg-black hover:border-zinc-600 transition-all duration-300 text-lg backdrop-blur-xl hover:scale-105"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}