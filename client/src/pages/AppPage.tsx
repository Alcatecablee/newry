import { useState } from "react";
import { FileUploadZone } from "@/components/neurolint/FileUploadZone";
import { GitHubUpload } from "@/components/neurolint/GitHubUpload";
import { RepoProcessor } from "@/components/neurolint/RepoProcessor";
import { CodeDiffViewer } from "@/components/neurolint/CodeDiffViewer";
import { TransformationInsights } from "@/components/neurolint/TransformationInsights";
import {
  NeuroLintOrchestrator,
  NeuroLintLayerResult,
  LAYER_LIST,
} from "@/lib/neurolint/orchestrator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  FileCode,
  Github,
  Zap,
  Settings,
  Play,
  Sparkles,
  Check,
  Clock,
  TrendingUp,
} from "lucide-react";
import { BetaBanner } from "@/components/BetaBanner";

interface RepoFile {
  path: string;
  content: string;
  transformed?: string;
  insights?: NeuroLintLayerResult[];
}

const AppPage = () => {
  const [originalCode, setOriginalCode] = useState<string>("");
  const [transformedCode, setTransformedCode] = useState<string>("");
  const [insights, setInsights] = useState<NeuroLintLayerResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [enabledLayers, setEnabledLayers] = useState<number[]>([1, 2, 3, 4]);
  const [mode, setMode] = useState<"single" | "repo">("single");
  const [repoFiles, setRepoFiles] = useState<RepoFile[]>([]);

  const handleFileUpload = async (code: string) => {
    setOriginalCode(code);
    setProcessing(true);
    try {
      const startTime = Date.now();
      const { transformed, layers } = await NeuroLintOrchestrator(
        code,
        undefined,
        true,
        enabledLayers,
      );
      setTransformedCode(transformed);
      setInsights(layers);
      console.log(
        `NeuroLint ran in ${Date.now() - startTime}ms for layers`,
        enabledLayers,
      );
    } catch (error) {
      console.error("NeuroLint processing failed:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleRepoUpload = (files: { path: string; content: string }[]) => {
    setRepoFiles(files.map((f) => ({ ...f })));
    setMode("repo");
  };

  const handleRepoProcessingComplete = (processedFiles: RepoFile[]) => {
    setRepoFiles(processedFiles);
  };

  const stats =
    insights.length > 0
      ? {
          totalChanges: insights.reduce(
            (sum, r) => sum + (r.changeCount || 0),
            0,
          ),
          totalTime: insights.reduce(
            (sum, r) => sum + (r.executionTime || 0),
            0,
          ),
          successfulLayers: insights.filter((r) => r.success).length,
        }
      : null;

  const toggleLayer = (layerId: number) => {
    setEnabledLayers((prev) =>
      prev.includes(layerId)
        ? prev.filter((id) => id !== layerId)
        : [...prev, layerId].sort(),
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <div className="text-center mb-12">
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Transform your React & TypeScript code with AI-powered precision.
              Six intelligent layers of optimization, from configuration to
              performance.
            </p>
          </div>

          {/* Layer Selection */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6 justify-center">
              <Settings className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-white">
                Select Transformation Layers
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {LAYER_LIST.map((layer) => {
                const isEnabled = enabledLayers.includes(layer.id);
                return (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className={`group relative p-4 rounded-xl border transition-all duration-200 text-left transform active:scale-[0.98] ${
                      isEnabled
                        ? "bg-[#292939] border-[#342d66] shadow-lg shadow-purple-900/20"
                        : "bg-[#1a1b21] border-[#292939] hover:border-[#3a3a45] hover:bg-[#232329]"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold transition-all duration-200 ${
                          isEnabled
                            ? "bg-purple-600 text-white border border-purple-500"
                            : "bg-[#292939] text-gray-400 border border-[#3a3a45] group-hover:bg-[#343445] group-hover:text-gray-300"
                        }`}
                      >
                        {layer.id}
                      </div>
                      <div
                        className={`transition-all duration-200 ${isEnabled ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`}
                      >
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    <h3
                      className={`font-semibold mb-2 transition-colors ${
                        isEnabled
                          ? "text-white"
                          : "text-gray-300 group-hover:text-white"
                      }`}
                    >
                      {layer.name}
                    </h3>

                    <p
                      className={`text-sm leading-relaxed transition-colors ${
                        isEnabled
                          ? "text-gray-300"
                          : "text-gray-400 group-hover:text-gray-300"
                      }`}
                    >
                      {layer.description}
                    </p>

                    {isEnabled && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-black" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Selection */}
          <div className="max-w-2xl mx-auto">
            <Tabs
              value={mode}
              onValueChange={(value) => setMode(value as "single" | "repo")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-zinc-800er p-1">
                <TabsTrigger
                  value="single"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-zinc-400"
                >
                  <FileCode className="w-4 h-4" />
                  Single File
                </TabsTrigger>
                <TabsTrigger
                  value="repo"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black data-[state=inactive]:text-zinc-400"
                >
                  <Github className="w-4 h-4" />
                  Repository
                </TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="mt-8 space-y-8">
                <div className="bg-zinc-900/30 border border-zinc-800er rounded-2xl p-6">
                  <FileUploadZone
                    onFile={handleFileUpload}
                    processing={processing}
                  />
                </div>

                {processing && (
                  <div className="flex items-center justify-center gap-3 py-8">
                    <div className="relative">
                      <div className="w-8 h-8 border-4 border-zinc-800er border-t-white rounded-full animate-spin"></div>
                      <Sparkles className="absolute inset-0 w-4 h-4 m-auto text-white animate-pulse" />
                    </div>
                    <span className="text-zinc-400 font-medium">
                      Transforming with {enabledLayers.length} selected
                      layers...
                    </span>
                  </div>
                )}

                {stats && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-zinc-900 border border-zinc-800er rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-white" />
                        <span className="text-zinc-400 font-medium">
                          Changes
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {stats.totalChanges}
                      </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800er rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-white" />
                        <span className="text-zinc-400 font-medium">
                          Processing Time
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {stats.totalTime}ms
                      </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800er rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-white" />
                        <span className="text-zinc-400 font-medium">
                          Success Rate
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {stats.successfulLayers}/{enabledLayers.length}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-zinc-900/30 border border-zinc-800er rounded-2xl overflow-hidden">
                  <CodeDiffViewer
                    original={originalCode}
                    transformed={transformedCode}
                    loading={processing}
                  />
                </div>

                {insights.length > 0 && (
                  <div className="bg-zinc-900/30 border border-zinc-800er rounded-2xl p-6">
                    <TransformationInsights insights={insights} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="repo" className="mt-8 space-y-8">
                <div className="bg-zinc-900/30 border border-zinc-800er rounded-2xl p-6">
                  <GitHubUpload onRepoUpload={handleRepoUpload} />
                </div>

                {repoFiles.length > 0 && (
                  <div className="bg-zinc-900/30 border border-zinc-800er rounded-2xl p-6">
                    <RepoProcessor
                      files={repoFiles}
                      enabledLayers={enabledLayers}
                      onProcessingComplete={handleRepoProcessingComplete}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppPage;
