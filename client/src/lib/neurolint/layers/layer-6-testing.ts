export async function transform(code: string): Promise<string> {
  let transformed = code;

  // Apply only safe, non-conflicting improvements
  // Skip aggressive transformations that might conflict with other layers

  // Only add error boundaries for clearly risky components
  transformed = addErrorBoundaries(transformed);

  // Skip prop validation - too aggressive and conflicts with Layer 3
  // transformed = addPropValidation(transformed);

  // Only add loading states if clearly needed
  transformed = addLoadingStates(transformed);

  // Validate exports but don't add new ones
  transformed = validateExports(transformed);

  // Only apply performance optimizations for simple cases
  transformed = addPerformanceOptimizations(transformed);

  // Skip error handling - too aggressive
  // transformed = addErrorHandling(transformed);

  // Only fix obvious TypeScript issues
  transformed = fixTypeScriptIssues(transformed);

  // Clean up only obvious issues
  transformed = cleanupCodeStructure(transformed);

  return transformed;
}

function addErrorBoundaries(code: string): string {
  // Only add error boundaries for high-risk components
  const isHighRisk =
    code.includes("fetch(") ||
    code.includes("axios.") ||
    code.includes("upload") ||
    code.includes("PDF") ||
    code.includes("WebSocket") ||
    code.includes("EventSource");

  if (
    code.includes("export default function") &&
    isHighRisk &&
    !code.includes("ErrorBoundary") &&
    !code.includes("try")
  ) {
    const componentMatch = code.match(/export default function (\w+)/);
    if (componentMatch) {
      const componentName = componentMatch[1];

      // Add simple error boundary wrapper
      const errorBoundaryWrapper = `// Error boundary wrapper for ${componentName}
function ${componentName}WithErrorBoundary(props: any) {
  try {
    return <${componentName} {...props} />;
  } catch (error) {
    console.error('${componentName} error:', error);
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg border border-red-200">
        <h3 className="font-semibold">Something went wrong</h3>
        <p className="text-sm mt-1">Please try refreshing the page.</p>
      </div>
    );
  }
}

`;

      return (
        code.replace(
          `export default function ${componentName}`,
          `${errorBoundaryWrapper}function ${componentName}`,
        ) + `\n\nexport default ${componentName}WithErrorBoundary;`
      );
    }
  }

  return code;
}

function addPropValidation(code: string): string {
  // Add interface definitions for components missing them
  const componentMatch = code.match(
    /export default function (\w+)\(\s*{\s*([^}]+)\s*}/,
  );
  if (
    componentMatch &&
    !code.includes("interface") &&
    !code.includes("type Props")
  ) {
    const [, componentName, props] = componentMatch;
    const propNames = props
      .split(",")
      .map((p) => p.trim().split(":")[0].trim());

    const interfaceDefinition = `interface ${componentName}Props {
  ${propNames.map((prop) => `${prop}: any; // TODO: Define proper type`).join("\n  ")}
}

`;

    return (
      interfaceDefinition +
      code.replace(
        `export default function ${componentName}({ ${props} }`,
        `export default function ${componentName}({ ${props} }: ${componentName}Props`,
      )
    );
  }

  return code;
}

function addLoadingStates(code: string): string {
  // Only add loading states for obvious async operations with fetch/API calls
  const hasAsyncOperation =
    code.includes("fetch(") || code.includes("axios.") || code.includes("api.");

  if (
    hasAsyncOperation &&
    code.includes("useState") &&
    !code.includes("loading") &&
    !code.includes("isLoading") &&
    code.length < 300
  ) {
    // Only for smaller components

    const stateMatch = code.match(/const \[([^,]+),\s*set[^\]]+\] = useState/);
    if (stateMatch) {
      return code.replace(
        stateMatch[0],
        `const [isLoading, setIsLoading] = useState(false);\n  ${stateMatch[0]}`,
      );
    }
  }

  return code;
}

function validateExports(code: string): string {
  // Ensure components have proper default exports
  const functionMatch = code.match(/function (\w+)\s*\(/);
  if (
    functionMatch &&
    !code.includes(`export default ${functionMatch[1]}`) &&
    !code.includes("export default function")
  ) {
    return code + `\n\nexport default ${functionMatch[1]};`;
  }

  return code;
}

function addPerformanceOptimizations(code: string): string {
  // Only add React.memo for components that clearly benefit from it
  const isPureComponent =
    code.includes("export default function") &&
    code.includes("props") &&
    !code.includes("useState") &&
    !code.includes("useEffect") &&
    !code.includes("useContext") &&
    !code.includes("useReducer") &&
    !code.includes("React.memo") &&
    !code.includes("forwardRef");

  // Additional check: component should be simple enough to benefit from memo
  const linesOfCode = code.split("\n").length;
  const hasComplexLogic =
    code.includes("for ") || code.includes("while ") || code.includes("switch");

  if (isPureComponent && linesOfCode < 50 && !hasComplexLogic) {
    const componentMatch = code.match(/export default function (\w+)/);
    if (componentMatch) {
      const componentName = componentMatch[1];

      // Add React import if needed
      if (!code.includes("import React")) {
        code = "import React from 'react';\n" + code;
      }

      return code
        .replace(
          `export default function ${componentName}`,
          `const ${componentName} = React.memo(function ${componentName}`,
        )
        .replace(/}\s*$/, "});\n\nexport default " + componentName + ";");
    }
  }

  return code;
}

function addErrorHandling(code: string): string {
  // Wrap async operations in try-catch
  if (
    code.includes("async") &&
    code.includes("await") &&
    !code.includes("try") &&
    !code.includes("catch")
  ) {
    const asyncFunctionMatch = code.match(
      /(const \w+ = async \([^)]*\) => {[\s\S]*?})/,
    );
    if (asyncFunctionMatch) {
      const asyncFunction = asyncFunctionMatch[1];
      const wrappedFunction = asyncFunction.replace(
        /(async \([^)]*\) => {)([\s\S]*)(})/,
        '$1\n    try {$2\n    } catch (error) {\n      console.error("Error:", error);\n      // Handle error appropriately\n    }\n  $3',
      );
      return code.replace(asyncFunction, wrappedFunction);
    }
  }

  return code;
}

function fixTypeScriptIssues(code: string): string {
  let fixed = code;

  // Only fix obvious TypeScript issues, don't change 'any' types
  // as they might be intentional

  // Add proper typing for event handlers (only if missing types)
  fixed = fixed.replace(/onClick=\{([^}]+)\}/g, (match, handler) => {
    // Only add types if handler is a simple function call without existing types
    if (
      !handler.includes("React.MouseEvent") &&
      !handler.includes("=>") &&
      handler.includes("(")
    ) {
      return `onClick={(e: React.MouseEvent) => ${handler}(e)}`;
    }
    return match;
  });

  // Fix missing semicolons in interface definitions
  fixed = fixed.replace(/interface\s+\w+\s*{([^}]+)}/g, (match, body) => {
    const fixedBody = body.replace(/([^;}\n])\n/g, "$1;\n");
    return match.replace(body, fixedBody);
  });

  return fixed;
}

function cleanupCodeStructure(code: string): string {
  // Remove duplicate exports
  const exportMatches = code.match(/export default \w+;/g) || [];
  if (exportMatches.length > 1) {
    // Keep only the last export default
    const lastExport = exportMatches[exportMatches.length - 1];
    let cleanedCode = code;

    exportMatches.slice(0, -1).forEach((exportStatement) => {
      cleanedCode = cleanedCode.replace(exportStatement, "");
    });

    return cleanedCode;
  }

  return code;
}
