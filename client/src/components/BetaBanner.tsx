import { X } from "lucide-react";
import { useState } from "react";

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-black border-b border-zinc-800 px-4 py-2 relative">
      <div className="text-center">
        <span className="text-sm text-white">
          <span className="font-semibold">Beta Version</span> — NeuroLint is
          currently in development.
          <span className="text-zinc-400 ml-1">Feedback welcome!</span>
        </span>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
        aria-label="Close banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
