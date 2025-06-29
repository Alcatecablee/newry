import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { NeuroLintOrchestrator } from "@/lib/neurolint/orchestrator";
import { NeuroLintLayerResult } from "@/lib/neurolint/orchestrator";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { ReloadIcon } from "@radix-ui/react-icons";

interface ProcessingResults {
  original: string;
  transformed: string;
  layers: NeuroLintLayerResult[];
  processingTime: number;
}

export default function AppPage() {
  const [code, setCode] = useState(`
  import React from 'react';

  const MyComponent = () => {
    return (
      <div>
        <h1>Hello, world!</h1>
      </div>
    );
  };

  export default MyComponent;
  `);
  const [fileName, setFileName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ProcessingResults | null>(null);
  const [error, setError] = useState("");
  const [enabledLayers, setEnabledLayers] = useState([1, 2, 3, 4]);

  const processCode = async () => {
    if (!code.trim()) return;

    setIsProcessing(true);
    setResults(null);
    setError("");

    try {
      const startTime = Date.now();
      const { transformed, layers } = await NeuroLintOrchestrator.processCode(
        code,
        fileName || "input.tsx",
        true,
        enabledLayers,
      );
      const processingTime = Date.now() - startTime;

      setResults({
        original: code,
        transformed,
        layers,
        processingTime,
      });
    } catch (err: any) {
      setError(err.message || "Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">NeuroLint Playground</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <Label htmlFor="file-name">File Name (optional)</Label>
              <Input
                id="file-name"
                placeholder="Component.tsx"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>
            <Textarea
              className="h-96"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code here..."
            />
            <div className="flex justify-end mt-2">
              <Button onClick={processCode} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Process Code"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Output Code</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {results ? (
              <>
                <Textarea
                  className="h-96"
                  value={results.transformed}
                  readOnly
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    Processing Time: {results.processingTime}ms
                  </p>
                  <CopyButton text={results.transformed} />
                </div>
              </>
            ) : (
              <div className="text-gray-500">
                Enter code and click "Process Code" to see the transformed
                output.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Layer Configuration */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Enabled Layers</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((layerId) => (
            <div key={layerId} className="flex items-center space-x-2">
              <Switch
                id={`layer-${layerId}`}
                checked={enabledLayers.includes(layerId)}
                onCheckedChange={(checked) => {
                  setEnabledLayers((prev) =>
                    checked
                      ? [...prev, layerId]
                      : prev.filter((id) => id !== layerId),
                  );
                }}
              />
              <Label htmlFor={`layer-${layerId}`}>Layer {layerId}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Layer Results */}
      {results && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Layer Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.layers.map((layer) => (
                <div key={layer.id} className="p-4 border rounded-md">
                  <h3 className="font-semibold">{layer.name}</h3>
                  <p className="text-sm text-gray-500">{layer.description}</p>
                  <Badge variant={layer.success ? "success" : "destructive"}>
                    {layer.success ? "Success" : "Failed"}
                  </Badge>
                  {layer.changeCount !== undefined && (
                    <p className="text-sm">
                      Changes: {layer.changeCount}
                    </p>
                  )}
                  {layer.executionTime !== undefined && (
                    <p className="text-sm">
                      Time: {layer.executionTime}ms
                    </p>
                  )}
                  {layer.message && (
                    <p className="text-sm text-red-500">{layer.message}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
