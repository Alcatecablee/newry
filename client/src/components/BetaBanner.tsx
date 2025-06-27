import { X, Sparkles } from "lucide-react";
import { useState } from "react";

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-zinc-900 border-b border-zinc-700/50 px-4 py-3 relative backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800/80 rounded-full">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wide">
              Beta
            </span>
          </div>
          <span className="text-sm text-zinc-200 font-medium">
            NeuroLint is currently in development
          </span>
          <a
            href="mailto:founder@neurolint.com"
            className="text-sm text-white font-semibold hover:text-purple-300 transition-colors underline underline-offset-2"
          >
            Share Feedback
          </a>
        </div>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1 hover:bg-zinc-800/50 rounded-full"
        aria-label="Close banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
