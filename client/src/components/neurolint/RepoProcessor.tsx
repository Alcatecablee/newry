import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileCode,
  Zap,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  NeuroLintOrchestrator,
  NeuroLintLayerResult,
} from "@/lib/neurolint/orchestrator";

interface RepoFile {
  path: string;
  content: string;
  transformed?: string;
  insights?: NeuroLintLayerResult[];
}

interface RepoProcessorProps {
  files: RepoFile[];
  enabledLayers: number[];
  onProcessingComplete: (processedFiles: RepoFile[]) => void;
}

export function RepoProcessor({
  files,
  enabledLayers,
  onProcessingComplete,
}: RepoProcessorProps) {
  const [processing, setProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<RepoFile[]>([]);
  const [currentFile, setCurrentFile] = useState<string>("");
  const [progress, setProgress] = useState({ current: 0, total: files.length });

  const processRepository = async () => {
    setProcessing(true);
    setProcessedFiles([]);

    const results: RepoFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentFile(file.path);
      setProgress({ current: i + 1, total: files.length });

      try {
        const { transformed, layers } = await NeuroLintOrchestrator.processCode(
          file.content,
          file.path,
          true,
          enabledLayers,
        );

        results.push({
          ...file,
          transformed,
          insights: layers,
        });
      } catch (error) {
        console.error(`Error processing ${file.path}:`, error);
        results.push({
          ...file,
          transformed: file.content,
          insights: [],
        });
      }

      setProcessedFiles([...results]);
    }

    setProcessing(false);
    setCurrentFile("");
    onProcessingComplete(results);
  };

  const downloadResults = () => {
    const summary = {
      repository: "GitHub Repository Analysis",
      processedAt: new Date().toISOString(),
      totalFiles: processedFiles.length,
      layersUsed: enabledLayers,
      summary: {
        totalChanges: processedFiles.reduce(
          (sum, file) =>
            sum +
            (file.insights?.reduce(
              (s, insight) => s + (insight.changeCount || 0),
              0,
            ) || 0),
          0,
        ),
        filesModified: processedFiles.filter(
          (file) => file.transformed !== file.content,
        ).length,
        successfulLayers: processedFiles.reduce(
          (sum, file) =>
            sum +
            (file.insights?.filter((insight) => insight.success).length || 0),
          0,
        ),
      },
      files: processedFiles.map((file) => ({
        path: file.path,
        hasChanges: file.transformed !== file.content,
        changeCount:
          file.insights?.reduce(
            (sum, insight) => sum + (insight.changeCount || 0),
            0,
          ) || 0,
        layers:
          file.insights?.map((insight) => ({
            name: insight.name,
            success: insight.success,
            changeCount: insight.changeCount,
            improvements: insight.improvements,
          })) || [],
      })),
    };

    const blob = new Blob([JSON.stringify(summary, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neurolint-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalChanges = processedFiles.reduce(
    (sum, file) =>
      sum +
      (file.insights?.reduce(
        (s, insight) => s + (insight.changeCount || 0),
        0,
      ) || 0),
    0,
  );

  const filesWithChanges = processedFiles.filter(
    (file) => file.transformed !== file.content,
  ).length;

  const successfulLayers = processedFiles.reduce(
    (sum, file) =>
      sum + (file.insights?.filter((insight) => insight.success).length || 0),
    0,
  );

  const progressPercentage = Math.round(
    (progress.current / Math.max(progress.total, 1)) * 100,
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-white tracking-tight">
          Repository Analysis Engine
        </h3>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Advanced multi-layer code analysis and transformation for your entire
          repository
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="border border-zinc-800 rounded-2xl p-6 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-zinc-800/50 rounded-xl">
              <FileCode className="w-5 h-5 text-zinc-400" />
            </div>
            <span className="text-zinc-300 font-semibold">Total Files</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {files.length}
          </div>
          <div className="text-sm text-zinc-500">Ready for processing</div>
        </div>

        <div className="border border-zinc-800 rounded-2xl p-6 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-zinc-800/50 rounded-xl">
              <TrendingUp className="w-5 h-5 text-zinc-400" />
            </div>
            <span className="text-zinc-300 font-semibold">Modified</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {filesWithChanges}
          </div>
          <div className="text-sm text-zinc-500">Files with changes</div>
        </div>

        <div className="border border-zinc-800 rounded-2xl p-6 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-zinc-800/50 rounded-xl">
              <BarChart3 className="w-5 h-5 text-zinc-400" />
            </div>
            <span className="text-zinc-300 font-semibold">Changes</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {totalChanges}
          </div>
          <div className="text-sm text-zinc-500">Total improvements</div>
        </div>

        <div className="border border-zinc-800 rounded-2xl p-6 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-zinc-800/50 rounded-xl">
              <Activity className="w-5 h-5 text-zinc-400" />
            </div>
            <span className="text-zinc-300 font-semibold">Success Rate</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {processedFiles.length > 0
              ? Math.round(
                  (successfulLayers /
                    (processedFiles.length * enabledLayers.length)) *
                    100,
                )
              : 0}
            %
          </div>
          <div className="text-sm text-zinc-500">Layer completion</div>
        </div>
      </div>

      {/* Processing Section */}
      <div className="max-w-4xl mx-auto">
        <div className="border border-zinc-800 rounded-3xl p-8 bg-black/50 backdrop-blur-sm">
          {!processing && processedFiles.length === 0 && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-white">
                  Ready to Process Repository
                </h4>
                <p className="text-zinc-400 max-w-md mx-auto">
                  Launch the multi-layer analysis engine to transform all{" "}
                  {files.length} files using {enabledLayers.length} advanced
                  optimization layers.
                </p>
              </div>

              <Button
                onClick={processRepository}
                className="h-14 px-8 bg-white text-black hover:bg-gray-100 font-semibold text-lg shadow-lg"
              >
                <Zap className="w-5 h-5 mr-3" />
                Start Analysis ({files.length} files)
              </Button>
            </div>
          )}

          {processing && (
            <div className="space-y-6">
              {/* Processing Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
                    <Zap className="absolute inset-0 w-6 h-6 m-auto text-white animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-white">
                      Processing Repository
                    </div>
                    <div className="text-sm text-zinc-400">
                      Running {enabledLayers.length} optimization layers on each
                      file
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-white">
                    {progressPercentage}%
                  </div>
                  <div className="text-sm text-zinc-500">
                    {progress.current}/{progress.total} files
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 bg-white rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {currentFile && (
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span className="truncate">Processing: {currentFile}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {processedFiles.length > 0 && !processing && (
            <div className="space-y-6">
              {/* Completion Header */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white">
                      Analysis Complete
                    </h4>
                    <p className="text-zinc-400">
                      Successfully processed {processedFiles.length} files
                    </p>
                  </div>
                </div>
              </div>

              {/* Download Results */}
              <div className="flex justify-center">
                <Button
                  onClick={downloadResults}
                  className="h-12 px-6 bg-white text-black hover:bg-gray-100 font-semibold"
                >
                  <Download className="w-5 h-5 mr-3" />
                  Download Analysis Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Preview */}
      {processedFiles.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <div className="border border-zinc-800 rounded-3xl p-8 bg-black/50 backdrop-blur-sm">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-semibold text-white">
                  Analysis Results Preview
                </h4>
                <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700">
                  {processedFiles.length} files processed
                </Badge>
              </div>

              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {processedFiles
                  .filter((file) => file.transformed !== file.content)
                  .slice(0, 8)
                  .map((file, index) => {
                    const changeCount =
                      file.insights?.reduce(
                        (sum, insight) => sum + (insight.changeCount || 0),
                        0,
                      ) || 0;

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileCode className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              {file.path}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {file.insights?.filter((i) => i.success).length ||
                                0}
                              /{enabledLayers.length} layers successful
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {changeCount > 0 ? (
                            <Badge className="bg-zinc-700 text-zinc-300 border-zinc-600">
                              {changeCount} changes
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-zinc-700 text-zinc-500"
                            >
                              No changes
                            </Badge>
                          )}

                          {file.insights?.every((i) => i.success) ? (
                            <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-zinc-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}

                {processedFiles.filter(
                  (file) => file.transformed !== file.content,
                ).length > 8 && (
                  <div className="text-center text-sm text-zinc-500 py-4">
                    ... and{" "}
                    {processedFiles.filter(
                      (file) => file.transformed !== file.content,
                    ).length - 8}{" "}
                    more files with changes
                  </div>
                )}

                {processedFiles.filter(
                  (file) => file.transformed !== file.content,
                ).length === 0 && (
                  <div className="text-center text-zinc-500 py-8">
                    No files required changes - your code is already optimized!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
