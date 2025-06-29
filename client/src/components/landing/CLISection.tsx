import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Terminal,
  Users,
  BarChart3,
  Key,
  FileText,
  Download,
  ExternalLink,
  Monitor,
  Zap,
  Database,
  Shield,
  Settings,
  Webhook,
  Check,
} from "lucide-react";

export function CLISection() {
  const [copied, setCopied] = useState(false);

  const handleInstallClick = async () => {
    const installCommand = "npm install -g @neurolint/cli";

    try {
      await navigator.clipboard.writeText(installCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = installCommand;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="py-24 px-4" role="region" aria-labelledby="cli-heading">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2
            id="cli-heading"
            className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white"
          >
            Enterprise CLI Tool
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-medium">
            Production-ready command line interface with robust error handling,
            team management, and enterprise-grade security features.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-white tracking-tight">
                Install from NPM
              </h3>
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={handleInstallClick}
                  className="bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl flex items-center gap-3"
                >
                  {copied ? (
                    <>
                      <Check className="w-6 h-6" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6" />
                      Install CLI
                    </>
                  )}
                </button>
                <Link
                  to="/cli-docs"
                  className="border-2 border-zinc-800 text-white px-8 py-4 rounded-xl font-bold text-lg hover:border-zinc-600 transition-all duration-300 flex items-center gap-3"
                >
                  <ExternalLink className="w-5 h-5" />
                  View Documentation
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-black/70 backdrop-blur-xl p-6 rounded-3xl border-2 border-zinc-800/50 hover:border-zinc-600/80 transition-all duration-300 hover:bg-black/90 group">
                <div className="flex items-center gap-4 mb-3">
                  <Users className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="text-xl font-black text-white">
                    Team Management
                  </h4>
                </div>
                <p className="text-gray-300 leading-relaxed font-medium">
                  Complete team collaboration with role-based access
                </p>
              </div>
              <div className="bg-black/70 backdrop-blur-xl p-6 rounded-3xl border-2 border-zinc-800/50 hover:border-zinc-600/80 transition-all duration-300 hover:bg-black/90 group">
                <div className="flex items-center gap-4 mb-3">
                  <BarChart3 className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="text-xl font-black text-white">
                    Analytics & Reports
                  </h4>
                </div>
                <p className="text-gray-300 leading-relaxed font-medium">
                  Executive dashboards and compliance reporting
                </p>
              </div>
              <div className="bg-black/70 backdrop-blur-xl p-6 rounded-3xl border-2 border-zinc-800/50 hover:border-zinc-600/80 transition-all duration-300 hover:bg-black/90 group">
                <div className="flex items-center gap-4 mb-3">
                  <Key className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="text-xl font-black text-white">
                    SSO Integration
                  </h4>
                </div>
                <p className="text-gray-300 leading-relaxed font-medium">
                  SAML, OIDC, and OAuth2 enterprise authentication
                </p>
              </div>
              <div className="bg-black/70 backdrop-blur-xl p-6 rounded-3xl border-2 border-zinc-800/50 hover:border-zinc-600/80 transition-all duration-300 hover:bg-black/90 group">
                <div className="flex items-center gap-4 mb-3">
                  <FileText className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="text-xl font-black text-white">
                    Audit & Compliance
                  </h4>
                </div>
                <p className="text-gray-300 leading-relaxed font-medium">
                  SOC2, GDPR, ISO27001 compliance tracking
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#111111] border-2 border-zinc-800 rounded-3xl p-10 hover:border-zinc-600 transition-all duration-300 hover:bg-zinc-900/50">
            <div className="flex items-center gap-3 mb-6 text-sm text-gray-300">
              <Terminal className="w-5 h-5" />
              <span className="font-medium">Terminal</span>
              <div className="flex gap-2 ml-auto">
                <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
                <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
                <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
              </div>
            </div>
            <div className="font-mono text-sm space-y-3 bg-black/50 p-6 rounded-2xl">
              <div className="text-white font-medium">
                $ npm install -g @neurolint/cli
              </div>
              <div className="text-gray-300">Installing NeuroLint CLI...</div>
              <div className="text-white font-medium">
                $ neurolint login --enterprise
              </div>
              <div className="text-white font-medium">NeuroLint CLI</div>
              <div className="text-gray-300">
                Enterprise authentication required.
              </div>
              <div className="text-gray-300">Authentication successful</div>
              <div className="text-white font-medium">
                $ neurolint enterprise
              </div>
              <div className="text-white font-medium">
                NeuroLint Enterprise Features
              </div>
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
              <div className="text-white font-medium">
                $ neurolint team --list
              </div>
              <div className="text-white font-medium">Teams:</div>
              <div className="text-gray-300">Development Team (team-123)</div>
              <div className="text-gray-300"> Members: 12</div>
              <div className="text-gray-300"> SSO: Enabled</div>
              <div className="text-white animate-pulse">█</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
