
import { CheckCircle } from "lucide-react";

interface UploadStatus {
  total: number;
  processed: number;
  files: string[];
}

interface GitHubUploadProgressProps {
  uploadStatus: UploadStatus;
}

export function GitHubUploadProgress({ uploadStatus }: GitHubUploadProgressProps) {
  return (
    <div className="mt-4 p-3 bg-charcoal/50 border border-charcoal-lighter rounded-lg">
      <div className="flex items-center gap-2 text-sm text-white mb-2">
        <CheckCircle className="w-4 h-4" />
        Progress: {uploadStatus.processed}/{uploadStatus.total} files
      </div>
      <div className="text-xs text-gray-400">
        Latest: {uploadStatus.files[uploadStatus.files.length - 1] || "Starting..."}
      </div>
    </div>
  );
}
