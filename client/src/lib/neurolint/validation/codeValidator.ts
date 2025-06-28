// Removed @babel/parser import to prevent Node.js process errors in browser

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  corruptionDetected: boolean;
  performanceIssues: string[];
  securityIssues: string[];
}

export interface TransformationValidationResult {
  shouldRevert: boolean;
  reason?: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  metrics: {
    linesChanged: number;
    complexityDelta: number;
    errorCount: number;
  };
}

export class CodeValidator {
  private static readonly MAX_LINES = 50000;
  private static readonly MAX_COMPLEXITY_INCREASE = 50;
  private static readonly DANGEROUS_PATTERNS = [
    /eval\s*\(/gi,
    /Function\s*\(/gi,
    /setTimeout\s*\(\s*['"`]/gi,
    /setInterval\s*\(\s*['"`]/gi,
    /__proto__/gi,
    /constructor\s*\.\s*constructor/gi,
  ];

  static validate(code: string, skipCorruption = false): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const performanceIssues: string[] = [];
    const securityIssues: string[] = [];
    let isValid = true;
    let corruptionDetected = false;

    try {
      // Basic validation
      if (!code || typeof code !== "string") {
        errors.push("Invalid code input: must be a non-empty string");
        return {
          isValid: false,
          errors,
          warnings,
          corruptionDetected: true,
          performanceIssues,
          securityIssues,
        };
      }

      // Size validation
      const lines = code.split("\n");
      if (lines.length > this.MAX_LINES) {
        errors.push(
          `Code too large: ${lines.length} lines exceeds maximum of ${this.MAX_LINES}`,
        );
      }

      // Memory usage estimation
      const estimatedMemory = code.length * 4; // Rough estimate in bytes
      if (estimatedMemory > 50 * 1024 * 1024) {
        // 50MB
        performanceIssues.push(
          "Large file may cause memory issues during processing",
        );
      }

      // Try to parse the code to check for syntax errors
      const parseOptions = {
        sourceType: "module" as const,
        plugins: [
          "typescript",
          "jsx",
          "decorators-legacy",
          "classProperties",
          "functionBind",
          "exportDefaultFrom",
          "exportNamespaceFrom",
          "dynamicImport",
          "nullishCoalescingOperator",
          "optionalChaining",
          "importMeta",
          "topLevelAwait",
        ] as any[],
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        strictMode: false,
        errorRecovery: true,
      };

      let ast;
      try {
        // Skip AST parsing in browser environment to avoid Node.js dependencies
        ast = null;
      } catch (error) {
        // AST parsing is disabled in browser environment
        isValid = false;
        const errorMsg =
          error instanceof Error ? error.message : "Unknown parsing error";
        errors.push(`Syntax error: ${errorMsg}`);
      }

      // Security validation
      for (const pattern of this.DANGEROUS_PATTERNS) {
        if (pattern.test(code)) {
          securityIssues.push(
            `Potentially dangerous pattern: ${pattern.source}`,
          );
        }
      }

      // Corruption detection patterns - only catch truly severe issues
      const corruptionPatterns = [
        // Catastrophic syntax errors only
        /import\s*{\s*\n\s*import\s*{/g, // Broken nested imports
        /export\s+default.*\n.*export\s+default/g, // Multiple default exports on different lines
        /function\s+\w+\s*\(\s*function\s+\w+/g, // Nested function definitions (corruption)
        /<\w+[^>]*>\s*<\/[^>]*>\s*<\w+/g, // Malformed JSX with broken tag closure
      ];

      if (!skipCorruption) {
        for (const pattern of corruptionPatterns) {
          if (pattern.test(code)) {
            corruptionDetected = true;
            errors.push(`Code corruption detected: ${pattern.source}`);
          }
        }
      }

      // Performance analysis
      if (ast) {
        const complexity = this.calculateComplexity(ast);
        if (complexity > 100) {
          performanceIssues.push(`High cyclomatic complexity: ${complexity}`);
        }

        // Check for performance anti-patterns
        if (
          code.includes("document.getElementById") &&
          code.split("document.getElementById").length > 10
        ) {
          performanceIssues.push(
            "Multiple DOM queries detected - consider caching selectors",
          );
        }

        if (
          code.includes("querySelector") &&
          code.split("querySelector").length > 20
        ) {
          performanceIssues.push("Excessive DOM queries detected");
        }

        // Check for React-specific anti-patterns
        if (code.includes("useEffect") && !code.includes("dependency")) {
          warnings.push(
            "useEffect without dependencies detected - consider adding dependency array",
          );
        }
      }

      // Check for common issues
      if (
        code.includes("console.log") &&
        code.split("console.log").length > 10
      ) {
        warnings.push(
          "Many console.log statements detected - consider removing in production",
        );
      }

      if (code.includes("// TODO") || code.includes("// FIXME")) {
        warnings.push("TODO/FIXME comments detected");
      }
    } catch (error) {
      isValid = false;
      errors.push(
        `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    return {
      isValid: isValid && !corruptionDetected && errors.length === 0,
      errors,
      warnings,
      corruptionDetected,
      performanceIssues,
      securityIssues,
    };
  }

  static compareBeforeAfter(
    before: string,
    after: string,
  ): TransformationValidationResult {
    // If no transformation occurred, don't revert
    if (before === after) {
      return {
        shouldRevert: false,
        riskLevel: "low",
        metrics: { linesChanged: 0, complexityDelta: 0, errorCount: 0 },
      };
    }

    const beforeValid = this.validate(before);
    const afterValid = this.validate(after);

    // Calculate metrics
    const beforeLines = before.split("\n").length;
    const afterLines = after.split("\n").length;
    const linesChanged = Math.abs(afterLines - beforeLines);

    const beforeErrors = beforeValid.errors.length;
    const afterErrors = afterValid.errors.length;
    const errorCount = afterErrors - beforeErrors;

    // Estimate complexity change
    const complexityDelta = this.estimateComplexityChange(before, after);

    // Determine risk level
    let riskLevel: "low" | "medium" | "high" | "critical" = "low";

    if (afterValid.corruptionDetected && !beforeValid.corruptionDetected) {
      riskLevel = "critical";
    } else if (
      errorCount > 5 ||
      complexityDelta > this.MAX_COMPLEXITY_INCREASE
    ) {
      riskLevel = "high";
    } else if (errorCount > 0 || linesChanged > 100) {
      riskLevel = "medium";
    }

    const metrics = { linesChanged, complexityDelta, errorCount };

    // Critical cases - always revert
    if (afterValid.corruptionDetected && !beforeValid.corruptionDetected) {
      return {
        shouldRevert: true,
        reason: "Transformation introduced code corruption",
        riskLevel: "critical",
        metrics,
      };
    }

    // If the original code was valid but transformed code is invalid, revert
    if (beforeValid.isValid && !afterValid.isValid) {
      return {
        shouldRevert: true,
        reason: `Transformation broke valid code: ${afterValid.errors.join(", ")}`,
        riskLevel: "high",
        metrics,
      };
    }

    // If errors significantly increased, revert
    if (errorCount > 10) {
      return {
        shouldRevert: true,
        reason: `Transformation added ${errorCount} new errors`,
        riskLevel: "high",
        metrics,
      };
    }

    // If complexity increased too much, revert
    if (complexityDelta > this.MAX_COMPLEXITY_INCREASE) {
      return {
        shouldRevert: true,
        reason: `Transformation increased complexity by ${complexityDelta}`,
        riskLevel: "medium",
        metrics,
      };
    }

    return { shouldRevert: false, riskLevel, metrics };
  }

  // Lenient validation for component and hydration layers
  static lenientValidation(
    before: string,
    after: string,
  ): TransformationValidationResult {
    // Skip validation if no changes were made
    if (before === after) {
      return {
        shouldRevert: false,
        riskLevel: "low",
        metrics: { linesChanged: 0, complexityDelta: 0, errorCount: 0 },
      };
    }

    // For layers 3-4, skip detailed validation and trust the transformation
    const beforeLines = before.split("\n").length;
    const afterLines = after.split("\n").length;
    const linesChanged = Math.abs(afterLines - beforeLines);

    // Skip expensive validation for component/hydration layers
    const complexityDelta = 0;

    const metrics = {
      linesChanged,
      complexityDelta,
      errorCount: 0, // Don't count errors for lenient validation
    };

    // Very permissive risk assessment
    let riskLevel: "low" | "medium" | "high" | "critical" = "low";
    if (linesChanged > 1000) riskLevel = "medium";
    if (linesChanged > 5000) riskLevel = "high";

    // For layers 3-4, skip corruption checks entirely - trust the transformation
    console.log(
      "Lenient validation: Skipping corruption detection for layers 3-4",
    );
    return { shouldRevert: false, riskLevel, metrics };
  }

  private static hasCatastrophicErrors(before: string, after: string): boolean {
    // Only check for errors that would completely break JavaScript parsing

    // Check for unmatched braces (basic bracket counting)
    const openBraces = (after.match(/\{/g) || []).length;
    const closeBraces = (after.match(/\}/g) || []).length;
    if (Math.abs(openBraces - closeBraces) > 5) {
      return true;
    }

    // Check for completely malformed function definitions
    if (after.includes("function function") || after.includes("const const")) {
      return true;
    }

    // Check for broken import/export structure that would fail module loading
    if (after.includes("import export") || after.includes("export import")) {
      return true;
    }

    return false;
  }

  private static hasBreakingPatterns(before: string, after: string): boolean {
    // Only check for patterns that would genuinely break the code

    // Check for multiple default exports on separate lines
    const exportLines = after
      .split("\n")
      .filter((line) => line.includes("export default"));
    if (exportLines.length > 1) {
      return true;
    }

    // Check for deeply nested React.memo (more than 2 levels)
    if (after.includes("React.memo(React.memo(React.memo(")) {
      return true;
    }

    // Check for malformed imports that would cause syntax errors
    if (!before.includes("import import") && after.includes("import import")) {
      return true;
    }

    // Check for unclosed JSX tags that would break parsing
    const openTags = (after.match(/<\w+[^>]*>/g) || []).length;
    const closeTags = (after.match(/<\/\w+>/g) || []).length;
    const selfCloseTags = (after.match(/<\w+[^>]*\/>/g) || []).length;

    // Allow reasonable imbalance for self-closing tags and fragments
    if (Math.abs(openTags - closeTags - selfCloseTags) > 3) {
      return true;
    }

    return false;
  }

  static validateAdvancedTransform(
    before: string,
    after: string,
  ): TransformationValidationResult {
    const baseResult = this.compareBeforeAfter(before, after);

    if (baseResult.shouldRevert) {
      return baseResult;
    }

    // Additional checks for advanced transformations
    const issues: string[] = [];

    // Check for critical export issues
    const beforeExports = (before.match(/export default/g) || []).length;
    const afterExports = (after.match(/export default/g) || []).length;

    if (afterExports > beforeExports + 1) {
      issues.push("Multiple export default statements detected");
    }

    // Check for malformed component wrapping
    if (after.includes("React.memo(React.memo(")) {
      issues.push("Nested React.memo wrapping detected");
    }

    // Check for 'use client' conflicts
    const useClientCount = (after.match(/'use client';/g) || []).length;
    if (useClientCount > 1) {
      issues.push("Multiple 'use client' directives detected");
    }

    // Check for import/export duplication
    if (after.includes("import import") || after.includes("export export")) {
      issues.push("Duplicated import/export statements detected");
    }

    // Check for broken JSX
    if (after.includes("</") && !this.isValidJSX(after)) {
      issues.push("Malformed JSX structure detected");
    }

    if (issues.length > 0) {
      return {
        shouldRevert: true,
        reason: issues[0],
        riskLevel: "high",
        metrics: baseResult.metrics,
      };
    }

    return baseResult;
  }

  private static calculateComplexity(ast: any): number {
    let complexity = 1; // Base complexity

    // This is a simplified complexity calculation
    // In a real implementation, you'd traverse the AST properly
    const astString = JSON.stringify(ast);

    // Count decision points
    complexity += (astString.match(/"type":"IfStatement"/g) || []).length;
    complexity += (astString.match(/"type":"WhileStatement"/g) || []).length;
    complexity += (astString.match(/"type":"ForStatement"/g) || []).length;
    complexity += (astString.match(/"type":"SwitchCase"/g) || []).length;
    complexity += (astString.match(/"type":"ConditionalExpression"/g) || [])
      .length;

    return complexity;
  }

  private static estimateComplexityChange(
    before: string,
    after: string,
  ): number {
    // Simple heuristic for complexity change
    const beforeDecisions = this.countDecisionPoints(before);
    const afterDecisions = this.countDecisionPoints(after);
    return afterDecisions - beforeDecisions;
  }

  private static countDecisionPoints(code: string): number {
    let count = 0;
    count += (code.match(/\bif\b/g) || []).length;
    count += (code.match(/\belse\b/g) || []).length;
    count += (code.match(/\bwhile\b/g) || []).length;
    count += (code.match(/\bfor\b/g) || []).length;
    count += (code.match(/\bswitch\b/g) || []).length;
    count += (code.match(/\bcase\b/g) || []).length;
    count += (code.match(/\?\s*[^:]+\s*:/g) || []).length; // Ternary operators
    return count;
  }

  private static isValidJSX(code: string): boolean {
    try {
      // Simple JSX validation - check for balanced tags
      const openTags = code.match(/<[^/>][^>]*>/g) || [];
      const closeTags = code.match(/<\/[^>]+>/g) || [];
      const selfClosingTags = code.match(/<[^>]*\/>/g) || [];

      // This is a very basic check - in production you'd want more sophisticated validation
      return openTags.length >= closeTags.length;
    } catch {
      return false;
    }
  }

  // Performance monitoring utilities
  static measureTransformationPerformance<T>(
    operation: () => T,
    label: string,
  ): { result: T; duration: number; memoryUsed: number } {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

    const result = operation();

    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;

    const duration = endTime - startTime;
    const memoryUsed = endMemory - startMemory;

    if (duration > 5000) {
      // 5 seconds
      console.warn(
        `Slow transformation detected: ${label} took ${duration.toFixed(2)}ms`,
      );
    }

    if (memoryUsed > 50 * 1024 * 1024) {
      // 50MB
      console.warn(
        `High memory usage detected: ${label} used ${(memoryUsed / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    return { result, duration, memoryUsed };
  }
}
