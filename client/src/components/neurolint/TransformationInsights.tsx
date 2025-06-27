import React from "react";
import { NeuroLintLayerResult } from "@/lib/neurolint/orchestrator";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Code, Zap } from "lucide-react";

interface TransformationInsightsProps {
  insights: NeuroLintLayerResult[];
}

export function TransformationInsights({
  insights,
}: TransformationInsightsProps) {
  // Add null check to prevent undefined errors
  if (!insights || !Array.isArray(insights)) {
    return <div className="text-gray-400">No insights available</div>;
  }

  const totalChanges = insights.reduce(
    (sum, result) => sum + (result.changeCount || 0),
    0,
  );
  const totalTime = insights.reduce(
    (sum, result) => sum + (result.executionTime || 0),
    0,
  );
  const successfulLayers = insights.filter((r) => r.success).length;
  const allImprovements = insights.flatMap((r) => r.improvements || []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="font-medium text-lg">Transformation Pipeline</div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Code className="w-4 h-4" />
            {totalChanges} changes
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {totalTime}ms
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            {successfulLayers}/{insights.length} layers
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {insights.map((result, idx) => (
          <div
            key={result.name}
            className="rounded-lg bg-charcoal border border-zinc-800er px-4 py-3 shadow transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                Layer {idx + 1}
              </Badge>
              <span className="font-semibold text-sm text-white">
                {result.name}
              </span>
            </div>

            <div className="text-xs text-zinc-400 mb-2">
              {result.description}
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-white">
                {result.changeCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <Code className="w-3 h-3" />
                    {result.changeCount} changes
                  </span>
                )}
                {result.executionTime !== undefined && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {result.executionTime}ms
                  </span>
                )}
              </div>

              {result.success &&
                result.improvements &&
                result.improvements.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    {result.improvements.length} improvements
                  </Badge>
                )}
            </div>

            {result.improvements && result.improvements.length > 0 && (
              <div className="mt-2 pt-2 border-t border-zinc-800er">
                <div className="text-xs text-green-400">
                  {result.improvements.slice(0, 2).map((improvement, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {improvement}
                    </div>
                  ))}
                  {result.improvements.length > 2 && (
                    <div className="text-zinc-400">
                      +{result.improvements.length - 2} more...
                    </div>
                  )}
                </div>
              </div>
            )}

            {result.message && (
              <div className="mt-2 pt-2 border-t border-red-400/30">
                <div className="text-xs text-red-400">{result.message}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {allImprovements.length > 0 && (
        <div className="rounded-lg bg-green-500/20 border border-green-400/30 p-4">
          <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Key Improvements Applied
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm text-green-300">
            {[...new Set(allImprovements)].slice(0, 6).map((improvement, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 flex-shrink-0" />
                {improvement}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
