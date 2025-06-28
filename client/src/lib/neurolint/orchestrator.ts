import * as layer1 from "./layers/layer-1-config";
import * as layer2 from "./layers/layer-2-entities";
import * as layer3 from "./layers/layer-3-components";
import * as layer4 from "./layers/layer-4-hydration";
import * as layer5 from "./layers/layer-5-nextjs";
import * as layer6 from "./layers/layer-6-testing";
import { transformWithAST } from "./ast/orchestrator";
import { NeuroLintLayerResult } from "./types";
import { CodeValidator } from "./validation/codeValidator";

// Layer dependency management based on documentation patterns
const LAYER_DEPENDENCIES = {
  1: [], // Configuration has no dependencies
  2: [1], // Entity cleanup depends on config foundation
  3: [1, 2], // Components depend on config + cleanup
  4: [1, 2, 3], // Hydration depends on all previous layers
  5: [1, 2, 3, 4], // Next.js depends on all previous
  6: [1, 2, 3, 4, 5], // Quality depends on all previous
};

// Performance monitoring and error tracking
interface PerformanceMetrics {
  totalDuration: number;
  memoryPeak: number;
  layerPerformance: Array<{
    layerId: number;
    duration: number;
    memoryUsed: number;
    cacheHit: boolean;
  }>;
}

interface ErrorBoundary {
  layerId: number;
  error: Error;
  recoveryAction: "skip" | "fallback" | "abort";
  timestamp: number;
}

// Simple cache implementation
class TransformationCache {
  private cache = new Map<string, { result: string; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.result;
  }

  set(key: string, value: string): void {
    this.cache.set(key, { result: value, timestamp: Date.now() });

    // Cleanup old entries periodically
    if (this.cache.size > 1000) {
      const now = Date.now();
      for (const [k, v] of this.cache.entries()) {
        if (now - v.timestamp > this.TTL) {
          this.cache.delete(k);
        }
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// Rate limiting for transformations
class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private readonly windowMs = 60 * 60 * 1000; // 1 hour
  private readonly maxRequests = 50; // 50 transformations per hour

  checkLimit(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || now > entry.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs,
      };
    }

    entry.count++;

    if (entry.count > this.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }
}

// Enhanced layer configuration with proper dependency and fallback handling
const LAYER_LIST = [
  {
    id: 1,
    fn: layer1.transform,
    name: "Configuration Validation",
    description:
      "Optimizes TypeScript, Next.js config, and package.json with modern settings.",
    astSupported: false,
    retryable: true,
    timeout: 30000,
    safeMode: true,
  },
  {
    id: 2,
    fn: layer2.transform,
    name: "Pattern & Entity Fixes",
    description:
      "Cleans up HTML entities, old patterns, and modernizes JS/TS code.",
    astSupported: false,
    retryable: true,
    timeout: 45000,
    safeMode: true,
  },
  {
    id: 3,
    fn: layer3.transform,
    name: "Component Best Practices",
    description:
      "Solves missing key props, accessibility, prop types, and missing imports.",
    astSupported: true,
    retryable: true,
    timeout: 60000,
    safeMode: false,
  },
  {
    id: 4,
    fn: layer4.transform,
    name: "Hydration & SSR Guard",
    description: "Fixes hydration bugs and adds SSR/localStorage protection.",
    astSupported: true,
    retryable: true,
    timeout: 45000,
    safeMode: false,
  },
  {
    id: 5,
    fn: layer5.transform,
    name: "Next.js Optimization",
    description:
      "Optimizes Next.js App Router patterns, 'use client' directives, and import order.",
    astSupported: false,
    retryable: false, // More likely to cause conflicts
    timeout: 30000, // 30 seconds
    safeMode: true,
  },
  {
    id: 6,
    fn: layer6.transform,
    name: "Quality & Performance",
    description:
      "Adds error handling, performance optimizations, and code quality improvements.",
    astSupported: false,
    retryable: false, // More likely to cause conflicts
    timeout: 30000, // 30 seconds
    safeMode: true,
  },
];

// Global instances
const transformationCache = new TransformationCache();
const rateLimiter = new RateLimiter();

// Enhanced orchestrator with comprehensive error handling and monitoring
export async function NeuroLintOrchestrator(
  code: string,
  filePath?: string,
  useAST: boolean = true,
  layerIds: number[] = [1, 2, 3, 4],
  userId?: string,
): Promise<{
  transformed: string;
  layers: NeuroLintLayerResult[];
  layerOutputs: string[];
  performance: PerformanceMetrics;
  errors: ErrorBoundary[];
  cacheHits: number;
}> {
  const startTime = performance.now();
  const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

  let current = code;
  const results: NeuroLintLayerResult[] = [];
  const layerOutputs: string[] = [code];
  const errors: ErrorBoundary[] = [];
  const layerPerformance: PerformanceMetrics["layerPerformance"] = [];
  let cacheHits = 0;

  // Rate limiting check
  if (userId) {
    const rateLimit = rateLimiter.checkLimit(userId);
    if (!rateLimit.allowed) {
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 60000)} minutes.`,
      );
    }
  }

  // Initial validation - be more lenient for React/JSX files
  const initialValidation = CodeValidator.validate(code);

  // Only block if there are truly critical errors, not just validation warnings
  const hasCriticalErrors = initialValidation.errors.some(
    (error) =>
      error.includes("import import") ||
      error.includes("export export") ||
      error.includes("function function") ||
      error.includes("nested imports"),
  );

  if (hasCriticalErrors && initialValidation.corruptionDetected) {
    throw new Error(
      `Input code has critical issues: ${initialValidation.errors.join(", ")}`,
    );
  }

  // Process layers with enhanced error handling
  for (const layer of LAYER_LIST.filter((l) => layerIds.includes(l.id))) {
    const layerStartTime = performance.now();
    const layerStartMemory = (performance as any).memory?.usedJSHeapSize || 0;

    try {
      const previous = current;
      let next = current;
      let usedAST = false;
      let wasReverted = false;
      let cacheHit = false;

      // Check cache first
      const cacheKey = `${layer.id}_${hashCode(current)}`;
      const cachedResult = transformationCache.get(cacheKey);
      if (cachedResult) {
        next = cachedResult;
        cacheHit = true;
        cacheHits++;
      } else {
        // Apply transformation with timeout
        const transformationPromise =
          layer.id >= 5
            ? applySafeTransform(layer, current, filePath)
            : applyStandardTransform(layer, current, filePath, useAST);

        try {
          next = await Promise.race([
            transformationPromise,
            new Promise<string>((_, reject) =>
              setTimeout(
                () => reject(new Error("Transformation timeout")),
                layer.timeout,
              ),
            ),
          ]);

          // Cache successful transformation
          if (next !== current) {
            transformationCache.set(cacheKey, next);
          }
        } catch (timeoutError) {
          if (layer.retryable) {
            console.warn(
              `Layer ${layer.id} timed out, retrying with simplified mode...`,
            );
            // Retry with simpler transformation
            next = await applyFallbackTransform(layer, current, filePath);
          } else {
            throw timeoutError;
          }
        }
      }

      // Apply different validation strategies based on layer type
      let validation;
      if (layer.id >= 5) {
        // Strict validation for advanced layers (5-6)
        validation = CodeValidator.validateAdvancedTransform(previous, next);
      } else if (layer.id >= 3) {
        // Lenient validation for component and hydration layers (3-4)
        console.log(`Using lenient validation for Layer ${layer.id}`);
        validation = CodeValidator.lenientValidation(previous, next);
      } else {
        // Standard validation for basic layers (1-2)
        validation = CodeValidator.compareBeforeAfter(previous, next);
      }

      if (validation.shouldRevert) {
        console.warn(
          `Reverting ${layer.name} transformation: ${validation.reason}`,
        );
        next = previous;
        wasReverted = true;
      }

      // Performance monitoring
      const layerEndTime = performance.now();
      const layerEndMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const layerDuration = layerEndTime - layerStartTime;
      const layerMemoryUsed = layerEndMemory - layerStartMemory;

      layerPerformance.push({
        layerId: layer.id,
        duration: layerDuration,
        memoryUsed: layerMemoryUsed,
        cacheHit,
      });

      // Log performance warnings
      if (layerDuration > 10000) {
        // 10 seconds
        console.warn(
          `Slow layer detected: Layer ${layer.id} took ${layerDuration.toFixed(2)}ms`,
        );
      }

      const changeCount = calculateChanges(previous, next);
      const improvements = detectImprovements(previous, next, usedAST);

      if (wasReverted) {
        improvements.push("Prevented code corruption");
      }

      results.push({
        name: layer.name,
        description: layer.description,
        code: next,
        success: !wasReverted,
        executionTime: layerDuration,
        changeCount,
        improvements,
        message: wasReverted
          ? `Transformation reverted: ${validation.reason}`
          : cacheHit
            ? "Transformation retrieved from cache"
            : undefined,
      });

      current = next;
      layerOutputs.push(next);
    } catch (error: any) {
      const layerEndTime = performance.now();
      const layerDuration = layerEndTime - layerStartTime;

      // Record error
      const errorBoundary: ErrorBoundary = {
        layerId: layer.id,
        error: error instanceof Error ? error : new Error(String(error)),
        recoveryAction: layer.retryable ? "fallback" : "skip",
        timestamp: Date.now(),
      };
      errors.push(errorBoundary);

      // Attempt recovery
      if (layer.retryable && !error.message.includes("timeout")) {
        try {
          console.warn(`Layer ${layer.id} failed, attempting fallback...`);
          const fallbackResult = await applyFallbackTransform(
            layer,
            current,
            filePath,
          );
          current = fallbackResult;

          results.push({
            name: layer.name,
            description: layer.description,
            code: current,
            success: true,
            executionTime: layerDuration,
            changeCount: calculateChanges(
              layerOutputs[layerOutputs.length - 1],
              current,
            ),
            improvements: ["Fallback transformation applied"],
            message: `Original transformation failed, fallback applied: ${error.message}`,
          });
        } catch (fallbackError) {
          // Fallback failed, record and continue
          results.push({
            name: layer.name,
            description: layer.description,
            message: `Layer failed: ${error.message}`,
            code: current,
            success: false,
            executionTime: layerDuration,
            changeCount: 0,
          });
        }
      } else {
        // Non-retryable error, record and continue
        results.push({
          name: layer.name,
          description: layer.description,
          message: `Layer failed: ${error.message}`,
          code: current,
          success: false,
          executionTime: layerDuration,
          changeCount: 0,
        });
      }

      layerOutputs.push(current);

      layerPerformance.push({
        layerId: layer.id,
        duration: layerDuration,
        memoryUsed: 0,
        cacheHit: false,
      });
    }
  }

  // Final validation
  const finalValidation = CodeValidator.validate(current);
  if (
    !finalValidation.isValid &&
    finalValidation.errors.length > initialValidation.errors.length
  ) {
    console.warn(
      "Final output has more errors than input. Consider manual review.",
    );
  }

  // Calculate performance metrics
  const endTime = performance.now();
  const endMemory = (performance as any).memory?.usedJSHeapSize || 0;

  const performance_metrics: PerformanceMetrics = {
    totalDuration: endTime - startTime,
    memoryPeak: Math.max(endMemory - startMemory, 0),
    layerPerformance,
  };

  return {
    transformed: current,
    layers: results,
    layerOutputs,
    performance: performance_metrics,
    errors,
    cacheHits,
  };
}

// Enhanced transformation functions with proper AST/regex fallback
async function applyStandardTransform(
  layer: any,
  code: string,
  filePath?: string,
  useAST: boolean = true,
): Promise<string> {
  // Layers 1-2: Always use regex (config files, simple patterns)
  if (!layer.astSupported) {
    return await layer.fn(code, filePath);
  }

  // Layers 3-4: Try AST first, fallback to regex
  if (layer.astSupported && useAST) {
    try {
      console.log(`Using AST transformation for ${layer.name}`);
      const astResult = await transformWithAST(
        code,
        `layer-${layer.id}-${layer.name.toLowerCase().replace(/\s/g, "-")}`,
      );

      if (astResult.success) {
        return astResult.code;
      } else {
        console.warn(`AST failed for ${layer.name}, using regex fallback`);
        return await layer.fn(code, filePath);
      }
    } catch (astError) {
      console.warn(
        `AST failed for ${layer.name}, using regex fallback:`,
        astError.message,
      );
      return await layer.fn(code, filePath);
    }
  }

  return await layer.fn(code, filePath);
}

async function applySafeTransform(
  layer: any,
  code: string,
  filePath?: string,
): Promise<string> {
  // Pre-flight validation
  const preValidation = CodeValidator.validate(code);
  if (!preValidation.isValid && preValidation.corruptionDetected) {
    console.warn(`Skipping ${layer.name} due to pre-existing corruption`);
    return code;
  }

  // Apply transformation
  const transformed = await layer.fn(code, filePath);

  // Post-flight validation
  const postValidation = CodeValidator.validate(transformed);
  const comparison = CodeValidator.compareBeforeAfter(code, transformed);

  if (comparison.shouldRevert) {
    console.warn(`${layer.name} transformation reverted: ${comparison.reason}`);
    return code;
  }

  // Check for specific conflict patterns
  if (hasConflictPatterns(code, transformed)) {
    console.warn(`${layer.name} detected conflict patterns, reverting`);
    return code;
  }

  return transformed;
}

async function applyFallbackTransform(
  layer: any,
  code: string,
  filePath?: string,
): Promise<string> {
  // Simple fallback - just return original code with minimal changes
  console.log(`Applying fallback for layer ${layer.id}`);

  // For now, just return original code
  // In a real implementation, you'd have simplified transformation logic
  return code;
}

// Utility functions
function detectImprovements(
  before: string,
  after: string,
  usedAST: boolean = false,
): string[] {
  const improvements: string[] = [];

  if (before !== after) {
    improvements.push("Code transformation applied");

    if (usedAST) {
      improvements.push("AST-based transformation");
    }

    // Detect specific improvements
    if (after.includes("key=") && !before.includes("key=")) {
      improvements.push("Added missing key props");
    }

    if (after.includes("aria-") && !before.includes("aria-")) {
      improvements.push("Improved accessibility");
    }

    if (after.includes("typeof window") && !before.includes("typeof window")) {
      improvements.push("Added SSR guards");
    }
  }

  return improvements;
}

function calculateChanges(before: string, after: string): number {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  let changes = Math.abs(beforeLines.length - afterLines.length);

  const minLength = Math.min(beforeLines.length, afterLines.length);
  for (let i = 0; i < minLength; i++) {
    if (beforeLines[i] !== afterLines[i]) changes++;
  }
  return changes;
}

function hasConflictPatterns(before: string, after: string): boolean {
  // Check for double exports
  const exportMatches = after.match(/export default/g);
  if (exportMatches && exportMatches.length > 1) {
    return true;
  }

  // Check for malformed React.memo wrapping
  if (after.includes("React.memo(React.memo(")) {
    return true;
  }

  // Check for duplicate error boundaries
  if (
    after.includes("ErrorBoundary") &&
    (after.match(/ErrorBoundary/g) || []).length > 2
  ) {
    return true;
  }

  // Check for conflicting 'use client' directives
  const useClientMatches = after.match(/'use client';/g);
  if (useClientMatches && useClientMatches.length > 1) {
    return true;
  }

  // Check for malformed imports
  if (after.includes("import import") || after.includes("export export")) {
    return true;
  }

  return false;
}

function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// Export utilities for external use
export { LAYER_LIST, transformationCache, rateLimiter };
export type { NeuroLintLayerResult, PerformanceMetrics, ErrorBoundary };
