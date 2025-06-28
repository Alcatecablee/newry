import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Github,
  Upload,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useGitHubUpload } from "@/hooks/useGitHubUpload";

interface GitHubUploadProps {
  onRepoUpload: (files: { path: string; content: string }[]) => void;
  processing?: boolean;
}

export function GitHubUpload({ onRepoUpload, processing }: GitHubUploadProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const {
    uploading,
    uploadStatus,
    demoMode,
    uploadRepository,
    loadDemoRepository,
  } = useGitHubUpload();

  const handleUpload = async () => {
    await uploadRepository(repoUrl, onRepoUpload);
    setRepoUrl("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !uploading && !processing && repoUrl.trim()) {
      handleUpload();
    }
  };

  const progressPercentage = uploadStatus
    ? Math.round(
        (uploadStatus.processed / Math.max(uploadStatus.total, 1)) * 100,
      )
    : 0;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <Github className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              GitHub Repository Import
            </h3>
            <p className="text-zinc-400 text-sm">
              Import and analyze entire repositories with advanced code
              transformation
            </p>
          </div>
        </div>
      </div>

      {/* URL Input Section */}
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="relative">
          <Input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://github.com/username/repository"
            className="h-14 pl-12 pr-4 bg-black border-zinc-800 text-white placeholder-zinc-500 text-lg focus:border-zinc-700 focus:ring-0"
            disabled={uploading || processing}
          />
          <Github className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleUpload}
            disabled={!repoUrl.trim() || uploading || processing}
            className="w-full h-14 bg-white text-black hover:bg-gray-100 font-semibold text-lg shadow-lg disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Clock className="w-5 h-5 mr-3 animate-spin" />
                {demoMode ? "Loading Demo..." : "Importing Repository..."}
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-3" />
                Import Repository
              </>
            )}
          </Button>

          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-zinc-800"></div>
              <span className="text-sm text-zinc-500">OR</span>
              <div className="flex-1 h-px bg-zinc-800"></div>
            </div>

            <Button
              onClick={() => loadDemoRepository(onRepoUpload)}
              disabled={uploading || processing}
              className="w-full h-12 bg-zinc-900 border border-zinc-700 text-white hover:bg-zinc-800 font-medium"
            >
              <Github className="w-4 h-4 mr-2" />
              Try Demo Repository
              <span className="ml-2 text-xs bg-zinc-700 px-2 py-1 rounded">
                No API limits
              </span>
            </Button>

            <div className="text-center text-xs text-zinc-500 mt-2">
              Perfect for testing • 5 realistic React/TypeScript files
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-medium text-white">
                Supported Files
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              .js, .jsx, .ts, .tsx, .json files
            </p>
          </div>

          <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-medium text-white">
                Rate Limits
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              60 requests/hour • Use demo if exceeded
            </p>
          </div>

          <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-medium text-white">
                Public Only
              </span>
            </div>
            <p className="text-xs text-zinc-500">Public repositories only</p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      {uploadStatus && (
        <div className="max-w-2xl mx-auto">
          <div className="border border-zinc-800 rounded-3xl p-8 bg-black/50 backdrop-blur-sm">
            <div className="space-y-6">
              {/* Progress Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {uploading ? (
                      <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
                    ) : (
                      <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      {uploading
                        ? demoMode
                          ? "Loading Demo Files..."
                          : "Importing Files..."
                        : demoMode
                          ? "Demo Complete"
                          : "Import Complete"}
                    </div>
                    <div className="text-sm text-zinc-400">
                      {uploadStatus.processed} of {uploadStatus.total} files
                      processed
                      {demoMode && (
                        <span className="ml-2 text-zinc-500">(Demo Mode)</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {progressPercentage}%
                  </div>
                  <div className="text-xs text-zinc-500">Complete</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 bg-white rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Processing repository files</span>
                  <span>
                    {uploadStatus.processed}/{uploadStatus.total}
                  </span>
                </div>
              </div>

              {/* File List */}
              {uploadStatus.files.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-zinc-300">
                    Recently Processed:
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {uploadStatus.files.slice(-5).map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-xs text-zinc-500 py-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-zinc-600 flex-shrink-0" />
                        <span className="truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
