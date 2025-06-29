import { LayerOne } from "./layers/layer1";
import { LayerTwo } from "./layers/layer2";
import { LayerThree } from "./layers/layer3";
import { LayerFour } from "./layers/layer4";
import { LayerFive } from "./layers/layer5";
import { LayerSix } from "./layers/layer6";
import { ASTOrchestrator } from "./ast";

export interface NeuroLintLayer {
  id: number;
  name: string;
  description: string;
  process: (code: string, filePath?: string) => Promise<string>;
}

export interface NeuroLintLayerResult {
  id: number;
  name: string;
  description: string;
  success: boolean;
  message?: string;
  changeCount?: number;
  executionTime?: number;
  improvements?: string[];
}

export const LAYER_LIST: NeuroLintLayer[] = [
  {
    id: 1,
    name: "Syntax and Formatting",
    description: "Corrects syntax errors and formats code for readability.",
    process: async (code: string) => LayerOne.process(code),
  },
  {
    id: 2,
    name: "Error Detection",
    description: "Identifies common errors and potential bugs.",
    process: async (code: string) => LayerTwo.process(code),
  },
  {
    id: 3,
    name: "Component Best Practices",
    description: "Enforces best practices for React component structure.",
    process: async (code: string) => LayerThree.process(code),
  },
  {
    id: 4,
    name: "Performance Optimization",
    description: "Optimizes code for better performance and efficiency.",
    process: async (code: string) => LayerFour.process(code),
  },
  {
    id: 5,
    name: "Security Vulnerabilities",
    description: "Detects potential security vulnerabilities in the code.",
    process: async (code: string) => LayerFive.process(code),
  },
  {
    id: 6,
    name: "Code Modernization",
    description: "Modernizes code by applying the latest language features.",
    process: async (code: string) => LayerSix.process(code),
  },
];

export class NeuroLintOrchestrator {
  private static cache = new Map<string, { result: string; timestamp: number }>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private astOrchestrator: ASTOrchestrator;
  private enabledLayers: number[];

  constructor(enabledLayers: number[] = [1, 2, 3, 4]) {
    this.astOrchestrator = new ASTOrchestrator();
    this.enabledLayers = enabledLayers;
  }

  static async processCode(
    code: string,
    filePath?: string,
    useCache: boolean = true,
    enabledLayers: number[] = [1, 2, 3, 4],
  ): Promise<{ transformed: string; layers: NeuroLintLayerResult[] }> {
    const orchestrator = new NeuroLintOrchestrator(enabledLayers);
    return orchestrator.process(code, filePath, useCache);
  }

  private static generateCacheKey(code: string, enabledLayers: number[]): string {
    const layerKey = enabledLayers.sort((a, b) => a - b).join(',');
    return `${code}-${layerKey}`;
  }

  private static getCachedResult(cacheKey: string): string | undefined {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp <= this.CACHE_DURATION) {
      return cached.result;
    }
    return undefined;
  }

  private static setCachedResult(cacheKey: string, result: string): void {
    this.cache.set(cacheKey, { result, timestamp: Date.now() });
    this.clearExpiredCache();
  }

  private static clearExpiredCache(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }

  async process(
    code: string,
    filePath?: string,
    useCache: boolean = true,
    enabledLayers: number[] = [1, 2, 3, 4],
  ): Promise<{ transformed: string; layers: NeuroLintLayerResult[] }> {
    this.enabledLayers = enabledLayers;
    const cacheKey = NeuroLintOrchestrator.generateCacheKey(code, enabledLayers);

    if (useCache) {
      const cachedResult = NeuroLintOrchestrator.getCachedResult(cacheKey);
      if (cachedResult) {
        return { transformed: cachedResult, layers: [] };
      }
    }

    let transformedCode = code;
    const layerResults: NeuroLintLayerResult[] = [];

    for (const layer of LAYER_LIST) {
      if (!this.enabledLayers.includes(layer.id)) {
        continue;
      }

      const startTime = Date.now();
      let layerResult: NeuroLintLayerResult = {
        id: layer.id,
        name: layer.name,
        description: layer.description,
        success: false,
      };

      try {
        const originalCode = transformedCode;
        transformedCode = await this.processWithAST(transformedCode, filePath);
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        const changeCount =
          originalCode !== transformedCode
            ? this.countCodeChanges(originalCode, transformedCode)
            : 0;

        layerResult = {
          ...layerResult,
          success: true,
          changeCount,
          executionTime,
        };
        layerResults.push(layerResult);
      } catch (e: any) {
        layerResult = {
          ...layerResult,
          success: false,
          message: e.message || "Layer processing failed",
        };
        layerResults.push(layerResult);
      }
    }

    if (useCache) {
      NeuroLintOrchestrator.setCachedResult(cacheKey, transformedCode);
    }

    return { transformed: transformedCode, layers: layerResults };
  }

  private countCodeChanges(originalCode: string, transformedCode: string): number {
    // Simple diff counting - can be enhanced with more sophisticated diffing
    const originalLines = originalCode.split('\n');
    const transformedLines = transformedCode.split('\n');
    let changes = 0;

    for (let i = 0; i < Math.max(originalLines.length, transformedLines.length); i++) {
      if (originalLines[i] !== transformedLines[i]) {
        changes++;
      }
    }

    return changes;
  }

  private async processWithAST(code: string, filePath?: string): Promise<string> {
    try {
      return await this.astOrchestrator.process(code, filePath, this.enabledLayers);
    } catch (astError: unknown) {
      console.warn('AST processing failed, falling back to regex:', astError);
      return code;
    }
  }

  // Fallback to regex-based processing if AST fails
  private async processWithRegex(code: string, layer: NeuroLintLayer): Promise<string> {
    try {
      return await layer.process(code);
    } catch (regexError: any) {
      console.error(`Regex processing failed for layer ${layer.id}:`, regexError);
      throw new Error(`Regex processing failed for layer ${layer.id}: ${regexError.message}`);
    }
  }
}

export async function NeuroLintOrchestratorSimple(
  code: string,
  filePath?: string,
  useCache: boolean = true,
  enabledLayers: number[] = [1, 2, 3, 4],
): Promise<{ transformed: string; layers: NeuroLintLayerResult[] }> {
  return NeuroLintOrchestrator.processCode(code, filePath, useCache, enabledLayers);
}
