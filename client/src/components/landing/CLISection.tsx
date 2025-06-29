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
    <section id="cli" className="py-20 bg-black border-t border-zinc-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
            Enterprise CLI Tool
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Production-ready command line interface with robust error handling,
            team management, and enterprise-grade security features.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white">
                Install from NPM
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={handleInstallClick}
                  className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 relative"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Install CLI
                    </>
                  )}
                </button>
                <Link
                  to="/cli-docs"
                  className="border border-zinc-800 text-white px-6 py-3 rounded-lg font-medium hover:border-white transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Documentation
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <Users className="w-6 h-6 text-white" />
                <div>
                  <h4 className="font-semibold text-white">Team Management</h4>
                  <p className="text-zinc-400 text-sm">
                    Complete team collaboration with role-based access
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
                <div>
                  <h4 className="font-semibold text-white">
                    Analytics & Reports
                  </h4>
                  <p className="text-zinc-400 text-sm">
                    Executive dashboards and compliance reporting
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <Key className="w-6 h-6 text-white" />
                <div>
                  <h4 className="font-semibold text-white">SSO Integration</h4>
                  <p className="text-zinc-400 text-sm">
                    SAML, OIDC, and OAuth2 enterprise authentication
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
                <div>
                  <h4 className="font-semibold text-white">
                    Audit & Compliance
                  </h4>
                  <p className="text-zinc-400 text-sm">
                    SOC2, GDPR, ISO27001 compliance tracking
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4 text-sm text-zinc-400">
              <Terminal className="w-4 h-4" />
              <span>Terminal</span>
              <div className="flex gap-1 ml-auto">
                <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
                <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
                <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
              </div>
            </div>
            <div className="font-mono text-sm space-y-2 bg-black/30 p-4 rounded-lg">
              <div className="text-white">$ npm install -g @neurolint/cli</div>
              <div className="text-zinc-400">Installing NeuroLint CLI...</div>
              <div className="text-white">$ neurolint login --enterprise</div>
              <div className="text-white">NeuroLint CLI</div>
              <div className="text-zinc-400">
                Enterprise authentication required.
              </div>
              <div className="text-zinc-400">Authentication successful</div>
              <div className="text-white">$ neurolint enterprise</div>
              <div className="text-white">NeuroLint Enterprise Features</div>
              <div className="text-zinc-400">
                neurolint team - Team management
              </div>
              <div className="text-zinc-400">
                neurolint analytics - Analytics and reporting
              </div>
              <div className="text-zinc-400">
                neurolint webhook - Webhook management
              </div>
              <div className="text-zinc-400">
                neurolint sso - Single Sign-On
              </div>
              <div className="text-zinc-400">
                neurolint audit - Audit trail and compliance
              </div>
              <div className="text-white">$ neurolint team --list</div>
              <div className="text-white">Teams:</div>
              <div className="text-zinc-400">Development Team (team-123)</div>
              <div className="text-zinc-400"> Members: 12</div>
              <div className="text-zinc-400"> SSO: Enabled</div>
              <div className="text-white animate-pulse">█</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
