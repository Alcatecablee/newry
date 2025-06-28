import { AlertCircle, ExternalLink, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function GitHubUploadInfo() {
  const exampleRepos = [
    "facebook/react",
    "microsoft/vscode",
    "vercel/next.js",
    "angular/angular",
  ];

  const copyExample = (repo: string) => {
    const url = `https://github.com/${repo}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied to clipboard",
      description: `${url} copied successfully`,
    });
  };

  return (
    <div className="space-y-3">
      {/* Requirements */}
      <div className="flex items-start gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
        <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-gray-300">
          <div className="font-medium mb-1">Requirements:</div>
          <ul className="space-y-1">
            <li>
              • Repository must be <strong>public</strong> (no authentication
              supported)
            </li>
            <li>• Only processes .js, .jsx, .ts, .tsx, and .json files</li>
            <li>
              • Excludes node_modules, dist, build, .git, .next directories
            </li>
            <li>• Large repositories may take longer to process</li>
          </ul>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="flex items-start gap-2 p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg">
        <HelpCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-200">
          <div className="font-medium mb-1">Common Issues:</div>
          <ul className="space-y-1">
            <li>
              • <strong>404 Error:</strong> Check repository spelling and ensure
              it exists
            </li>
            <li>
              • <strong>Private Repository:</strong> Make repository public in
              GitHub settings
            </li>
            <li>
              • <strong>Rate Limit:</strong> Wait a few minutes and try again
            </li>
            <li>
              • <strong>Wrong URL:</strong> Use format:
              https://github.com/username/repository
            </li>
          </ul>
        </div>
      </div>

      {/* Example repositories */}
      <div className="text-xs text-zinc-400">
        <p className="font-medium mb-2 text-zinc-300">
          Try these example repositories:
        </p>
        <div className="grid grid-cols-1 gap-1">
          {exampleRepos.map((repo) => (
            <Button
              key={repo}
              variant="ghost"
              size="sm"
              className="h-auto p-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 justify-between"
              onClick={() => copyExample(repo)}
            >
              <span>{repo}</span>
              <ExternalLink className="w-3 h-3" />
            </Button>
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          Click to copy URL to clipboard
        </p>
      </div>
    </div>
  );
}
