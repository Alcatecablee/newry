import React, { useState } from "react";
import {
  Info,
  X,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Code,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";

export const InfoWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center shadow-2xl hover:bg-zinc-800 transition-all duration-300 hover:scale-110 group"
          aria-label="Open status information"
        >
          <div className="relative">
            <Info className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-zinc-600 rounded-full animate-pulse"></div>
          </div>
        </button>
      )}

      {/* Widget Panel */}
      {isOpen && (
        <div className="w-80 bg-zinc-900/95 border border-zinc-700 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden transform transition-all duration-300 ease-out">
          {/* Header */}
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2 py-1 bg-zinc-800/80 rounded-full">
                  <Sparkles className="w-3 h-3 text-zinc-400" />
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    Beta
                  </span>
                </div>
                <span className="text-sm font-semibold text-white">
                  NeuroLint Status
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-zinc-800 rounded-full transition-colors"
                aria-label="Close widget"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Current Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium text-white">
                  Current Implementation
                </span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Advanced rule-based code transformation platform using AST
                parsing and sophisticated pattern matching.
              </p>
            </div>

            {/* Development Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium text-white">
                  Development Status
                </span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Currently in beta with AI-ready architecture. AI integration
                planned for future releases.
              </p>
            </div>

            {/* Expandable Details */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between p-2 hover:bg-zinc-800/50 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium text-zinc-300">
                Technical Details
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            {isExpanded && (
              <div className="space-y-3 pl-2 border-l-2 border-zinc-800">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-zinc-400">
                    ✓ AST Parsing & Transformation
                  </p>
                  <p className="text-xs font-medium text-zinc-400">
                    ✓ 6-Layer Analysis Pipeline
                  </p>
                  <p className="text-xs font-medium text-zinc-400">
                    ✓ Multi-Language Support
                  </p>
                  <p className="text-xs font-medium text-zinc-400">
                    ✓ Enterprise Security
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-zinc-500">
                    🔄 Machine Learning Integration
                  </p>
                  <p className="text-xs font-medium text-zinc-500">
                    🔄 Adaptive Pattern Recognition
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="#technology"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <span>View Technology Roadmap</span>
                <ArrowRight className="w-3 h-3" />
              </Link>

              <div className="flex gap-2">
                <a
                  href="mailto:founder@neurolint.com"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-colors text-sm"
                >
                  <span>Feedback</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <Link
                  to="/docs"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-colors text-sm"
                >
                  <span>Docs</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Dismiss Option */}
            <div className="pt-2 border-t border-zinc-800">
              <button
                onClick={() => setIsVisible(false)}
                className="w-full text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
              >
                Don't show this again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
