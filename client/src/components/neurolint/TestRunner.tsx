"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  PlayCircle,
  CheckCircle,
  XCircle,
  Clock,
  Code,
  Zap,
  Settings,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  Layers,
  Wrench,
  ShieldCheck,
} from "lucide-react";
import {
  NeuroLintOrchestrator,
  LAYER_LIST,
} from "@/lib/neurolint/orchestrator";
import {
  TEST_CASES,
  validateTestResult,
  TestResult,
} from "@/lib/neurolint/testSuite";
import { LayerSelector } from "./LayerSelector";

export function TestRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResultWithLayers[]>([]);
  const [currentTest, setCurrentTest] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [useAST, setUseAST] = useState(true);
  // Track enabled layers
  const [enabledLayers, setEnabledLayers] = useState(
    LAYER_LIST.map((l) => l.id),
  );

  // Store per-layer pipeline output for each test
  const [pipelineStates, setPipelineStates] = useState<string[][]>([]);

  // We need to store the enabledLayers used for each test run, so we update TestResult type below
  type TestResultWithLayers = TestResult & {
    pipeline: string[];
    testEnabledLayers: number[];
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);
    setPipelineStates([]);

    const testResults: TestResultWithLayers[] = [];
    const layerPipelines: string[][] = [];

    for (let i = 0; i < TEST_CASES.length; i++) {
      const testCase = TEST_CASES[i];
      setCurrentTest(testCase.name);
      setProgress((i / TEST_CASES.length) * 100);

      // Capture enabledLayers for this test run
      const testEnabledLayers = [...enabledLayers];

      const startTime = Date.now();
      try {
        // Pass enabledLayers to orchestrator
        const { transformed, layers, layerOutputs } =
          await NeuroLintOrchestrator(
            testCase.input,
            undefined,
            useAST,
            testEnabledLayers,
          );
        const validation = validateTestResult(testCase, transformed);
        const executionTime = Date.now() - startTime;

        testResults.push({
          testCase,
          transformedCode: transformed,
          passed: validation.passed,
          detectedFixes: validation.detectedFixes,
          missingFixes: validation.missingFixes,
          executionTime,
          // Store per-test pipeline and enabled layers
          pipeline: layerOutputs,
          testEnabledLayers,
        });
        layerPipelines.push(layerOutputs);
      } catch (error) {
        const executionTime = Date.now() - startTime;
        testResults.push({
          testCase,
          transformedCode: testCase.input,
          passed: false,
          detectedFixes: [],
          missingFixes: testCase.expectedFixes,
          executionTime,
          pipeline: [testCase.input],
          testEnabledLayers,
        });
        layerPipelines.push([testCase.input]);
      }
      setResults([...testResults]);
      setPipelineStates([...layerPipelines]);
    }

    setProgress(100);
    setCurrentTest("");
    setIsRunning(false);
  };

  const passedTests = results.filter((r) => r.passed).length;
  const totalTests = results.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  // Key layer insights (config, pattern, hydration)
  const keyLayers = [1, 2, 4]; // Config, Pattern, Hydration
  const keyLayerResults = useMemo(() => {
    const layerStats = keyLayers.map((layerId) => {
      const layerTests = results.filter(
        (r) => r.testCase.category === getCategoryForLayer(layerId),
      );
      const passed = layerTests.filter((r) => r.passed).length;
      const total = layerTests.length;
      const avgTime =
        total > 0
          ? layerTests.reduce((sum, r) => sum + r.executionTime, 0) / total
          : 0;

      return {
        layerId,
        name: LAYER_LIST.find((l) => l.id === layerId)?.name || "",
        category: getCategoryForLayer(layerId),
        passed,
        total,
        passRate: total > 0 ? (passed / total) * 100 : 0,
        avgTime: Math.round(avgTime),
        icon: getLayerIcon(layerId),
      };
    });
    return layerStats;
  }, [results]);

  function getCategoryForLayer(layerId: number): string {
    switch (layerId) {
      case 1:
        return "config";
      case 2:
        return "pattern";
      case 4:
        return "hydration";
      default:
        return "component";
    }
  }

  function getLayerIcon(layerId: number) {
    switch (layerId) {
      case 1:
        return Settings;
      case 2:
        return Wrench;
      case 4:
        return ShieldCheck;
      default:
        return Layers;
    }
  }

  // Performance insights
  const performanceInsights = useMemo(() => {
    if (results.length === 0) return [];

    const insights: string[] = [];
    const avgExecutionTime =
      results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;

    if (avgExecutionTime > 100) {
      insights.push(
        "Consider optimizing transformation algorithms - average execution time is above 100ms",
      );
    }

    const failedTests = results.filter((r) => !r.passed);
    if (failedTests.length > 0) {
      const commonFailures = failedTests.reduce(
        (acc, test) => {
          test.missingFixes.forEach((fix) => {
            acc[fix] = (acc[fix] || 0) + 1;
          });
          return acc;
        },
        {} as Record<string, number>,
      );

      const mostCommonFailure = Object.entries(commonFailures).sort(
        ([, a], [, b]) => b - a,
      )[0];
      if (mostCommonFailure) {
        insights.push(
          `Most common failure: "${mostCommonFailure[0]}" (${mostCommonFailure[1]} occurrences)`,
        );
      }
    }

    const keyLayerEnabled = enabledLayers.some((id) => keyLayers.includes(id));
    if (!keyLayerEnabled) {
      insights.push(
        "Enable config, pattern, or hydration layers for comprehensive testing",
      );
    }

    return insights;
  }, [results, enabledLayers]);

  return (
    <div className="space-y-6">
      {/* Test Configuration - Moved to Top */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-zinc-400" />
            Test Configuration
            <Badge variant="outline" className="ml-auto">
              {useAST ? "AST-based" : "Regex-based"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Layer selector UI */}
          <div className="my-3 flex flex-col sm:flex-row gap-3 items-center">
            <LayerSelector
              enabledLayers={enabledLayers}
              setEnabledLayers={setEnabledLayers}
            />
            <Button
              variant="outline"
              onClick={() => setEnabledLayers(LAYER_LIST.map((l) => l.id))}
              disabled={enabledLayers.length === LAYER_LIST.length}
              className="ml-auto"
            >
              All Layers
            </Button>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={runAllTests}
              disabled={isRunning || enabledLayers.length === 0}
              className="flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              {isRunning
                ? "Running Tests..."
                : `Run ${enabledLayers.length === LAYER_LIST.length ? "All" : "Selected"} Layer${enabledLayers.length !== 1 ? "s" : ""} Tests`}
            </Button>

            <Button
              variant="outline"
              onClick={() => setUseAST(!useAST)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {useAST ? "Switch to Regex" : "Switch to AST"}
            </Button>

            {results.length > 0 && (
              <div className="flex items-center gap-4">
                <Badge
                  variant={
                    passRate === 100
                      ? "default"
                      : passRate > 50
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {passedTests}/{totalTests} Passed ({passRate.toFixed(1)}%)
                </Badge>
              </div>
            )}
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Running: {currentTest}
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Layers Performance Dashboard */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {keyLayerResults.map((layer) => {
            const IconComponent = layer.icon;
            return (
              <Card key={layer.layerId} className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-white" />
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <IconComponent className="w-4 h-4" />
                    Layer {layer.layerId}: {layer.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Pass Rate
                      </span>
                      <Badge
                        variant={
                          layer.passRate === 100
                            ? "default"
                            : layer.passRate >= 50
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {layer.passed}/{layer.total} (
                        {layer.passRate.toFixed(0)}%)
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Avg Time
                      </span>
                      <span className="text-xs font-mono">
                        {layer.avgTime}ms
                      </span>
                    </div>
                    <Progress value={layer.passRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Performance Insights */}
      {performanceInsights.length > 0 && (
        <Alert className="border-zinc-200 bg-zinc-50">
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <strong>Performance Insights:</strong>
              <ul className="list-disc list-inside space-y-1 mt-2">
                {performanceInsights.map((insight, idx) => (
                  <li key={idx} className="text-sm">
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {results.length > 0 && (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Tests ({results.length})</TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-1">
              <Settings className="w-3 h-3" />
              Config (
              {results.filter((r) => r.testCase.category === "config").length})
            </TabsTrigger>
            <TabsTrigger value="pattern" className="flex items-center gap-1">
              <Wrench className="w-3 h-3" />
              Pattern (
              {results.filter((r) => r.testCase.category === "pattern").length})
            </TabsTrigger>
            <TabsTrigger value="hydration" className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Hydration (
              {
                results.filter((r) => r.testCase.category === "hydration")
                  .length
              }
              )
            </TabsTrigger>
          </TabsList>

          {["all", "config", "pattern", "hydration"].map((category) => {
            const filteredResults =
              category === "all"
                ? results
                : results.filter((r) => r.testCase.category === category);

            return (
              <TabsContent
                key={category}
                value={category}
                className="space-y-4"
              >
                <div className="grid gap-4">
                  {filteredResults.map((result, index) => {
                    const isKeyLayer = keyLayers.some(
                      (layerId) =>
                        getCategoryForLayer(layerId) ===
                        result.testCase.category,
                    );

                    return (
                      <Card
                        key={index}
                        className={`${result.passed ? "border-green-200" : "border-red-200"} ${
                          isKeyLayer ? "ring-2 ring-blue-200 shadow-lg" : ""
                        }`}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {result.passed ? (
                                <CheckCircle className="w-5 h-5 text-zinc-400" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                              <span className="text-base">
                                {result.testCase.name}
                              </span>
                              {isKeyLayer && (
                                <Badge variant="default" className="text-xs">
                                  <Target className="w-3 h-3 mr-1" />
                                  Key Layer
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`${getCategoryColor(result.testCase.category)}`}
                              >
                                {result.testCase.category}
                              </Badge>
                              <Badge variant="secondary">
                                <Clock className="w-3 h-3 mr-1" />
                                {result.executionTime}ms
                              </Badge>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            {result.testCase.description}
                          </p>
                          {/* Pipeline diffs */}
                          {result.pipeline && result.pipeline.length > 1 && (
                            <div className="mb-4">
                              <div className="flex flex-col md:flex-row gap-2">
                                {result.pipeline.map((codeSnap, i) => (
                                  <div key={i} className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {i === 0
                                          ? "Original"
                                          : `After L${result.testEnabledLayers[i - 1]}`}
                                      </Badge>
                                      {i > 0 && (
                                        <span className="text-xs text-muted-foreground">
                                          {
                                            LAYER_LIST.find(
                                              (l) =>
                                                l.id ===
                                                result.testEnabledLayers[i - 1],
                                            )?.name
                                          }
                                        </span>
                                      )}
                                    </div>
                                    <ScrollArea className="h-28 rounded border bg-muted p-1">
                                      <pre className="text-xs whitespace-pre-wrap break-all">
                                        <code>{codeSnap}</code>
                                      </pre>
                                    </ScrollArea>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <Tabs defaultValue="results">
                            <TabsList>
                              <TabsTrigger value="results">Results</TabsTrigger>
                              <TabsTrigger value="code">Code Diff</TabsTrigger>
                            </TabsList>

                            <TabsContent value="results" className="space-y-3">
                              {result.detectedFixes.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Detected Fixes (
                                    {result.detectedFixes.length})
                                  </h4>
                                  <div className="grid gap-1">
                                    {result.detectedFixes.map((fix, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center gap-2 text-sm text-green-600"
                                      >
                                        <CheckCircle className="w-3 h-3" />
                                        {fix}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {result.missingFixes.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                                    <XCircle className="w-4 h-4" />
                                    Missing Fixes ({result.missingFixes.length})
                                  </h4>
                                  <div className="grid gap-1">
                                    {result.missingFixes.map((fix, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center gap-2 text-sm text-red-600"
                                      >
                                        <XCircle className="w-3 h-3" />
                                        {fix}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </TabsContent>

                            <TabsContent value="code">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <Code className="w-4 h-4" />
                                    Original
                                  </h4>
                                  <ScrollArea className="h-64 rounded border bg-muted p-3">
                                    <pre className="text-xs">
                                      <code>{result.testCase.input}</code>
                                    </pre>
                                  </ScrollArea>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <Code className="w-4 h-4" />
                                    Transformed
                                  </h4>
                                  <ScrollArea className="h-64 rounded border bg-muted p-3">
                                    <pre className="text-xs">
                                      <code>{result.transformedCode}</code>
                                    </pre>
                                  </ScrollArea>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "config":
      return "border-blue-500 text-blue-700";
    case "pattern":
      return "border-purple-500 text-purple-700";
    case "hydration":
      return "border-green-500 text-green-700";
    case "component":
      return "border-orange-500 text-orange-700";
    default:
      return "border-gray-500 text-gray-700";
  }
}
