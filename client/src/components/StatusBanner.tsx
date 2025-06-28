import { Info, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function StatusBanner() {
  return (
    <div className="w-full bg-zinc-800/50 border-b border-zinc-700/50 px-4 py-4 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <span className="text-sm text-zinc-300">
              <strong className="text-white">Current Status:</strong> Advanced
              rule-based code transformation platform.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400">
              AI integration roadmap available
            </span>
            <Link
              to="#technology"
              className="inline-flex items-center gap-1 text-sm text-white font-medium hover:text-zinc-300 transition-colors"
            >
              Learn more
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
