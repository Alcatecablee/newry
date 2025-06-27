export async function transform(code: string): Promise<string> {
  let transformed = code;

  try {
    console.log("Layer 4 - Adding SSR guards...");
    transformed = addSSRGuards(transformed);
    
    console.log("Layer 4 - Adding mounted states...");
    transformed = addMountedStates(transformed);
    
    console.log("Layer 4 - Adding use client directive...");  
    transformed = addUseClientDirective(transformed);
    
    console.log("Layer 4 - Transformation completed successfully");
  } catch (error) {
    console.warn("Layer 4 - Error during transformation, returning original code:", error);
    return code;
  }

  return transformed;
}

function addSSRGuards(code: string): string {
  let fixed = code;

  // Fix localStorage access with proper guards
  fixed = fixed.replace(
    /localStorage\.getItem\(/g,
    'typeof window !== "undefined" && localStorage.getItem(',
  );

  fixed = fixed.replace(
    /localStorage\.setItem\(/g,
    'typeof window !== "undefined" && localStorage.setItem(',
  );

  fixed = fixed.replace(
    /localStorage\.removeItem\(/g,
    'typeof window !== "undefined" && localStorage.removeItem(',
  );

  fixed = fixed.replace(
    /localStorage\.clear\(/g,
    'typeof window !== "undefined" && localStorage.clear(',
  );

  // Fix sessionStorage access
  fixed = fixed.replace(
    /sessionStorage\.getItem\(/g,
    'typeof window !== "undefined" && sessionStorage.getItem(',
  );

  fixed = fixed.replace(
    /sessionStorage\.setItem\(/g,
    'typeof window !== "undefined" && sessionStorage.setItem(',
  );

  // Fix window object access
  fixed = fixed.replace(
    /window\./g,
    'typeof window !== "undefined" && window.',
  );

  // Fix document access
  fixed = fixed.replace(
    /document\./g,
    'typeof document !== "undefined" && document.',
  );

  // Fix navigator access
  fixed = fixed.replace(
    /navigator\./g,
    'typeof navigator !== "undefined" && navigator.',
  );

  // Fix location access
  fixed = fixed.replace(
    /location\./g,
    'typeof window !== "undefined" && window.location.',
  );

  // Fix history access
  fixed = fixed.replace(
    /history\./g,
    'typeof window !== "undefined" && window.history.',
  );

  return fixed;
}

function addMountedStates(code: string): string {
  const needsMountedState =
    (code.includes("localStorage") ||
      code.includes("sessionStorage") ||
      code.includes("window.") ||
      code.includes("document.") ||
      code.includes("navigator.")) &&
    code.includes("useState") &&
    !code.includes("mounted");

  if (needsMountedState) {
    // Add mounted state and proper hydration pattern
    const statePattern = /const \[([^,]+),\s*set[^\]]+\] = useState/;
    const match = code.match(statePattern);

    if (match) {
      let result = code.replace(
        match[0],
        `const [mounted, setMounted] = useState(false);\n  ${match[0]}`,
      );

      // Add useEffect for mounted state if not present
      if (!result.includes("setMounted(true)")) {
        // Look for existing useEffect or add new one
        const useEffectPattern = /useEffect\(\(\) => \{/;
        if (useEffectPattern.test(result)) {
          result = result.replace(
            useEffectPattern,
            "useEffect(() => {\n    setMounted(true);\n  }, []);\n\n  useEffect(() => {\n    if (!mounted) return;",
          );
        } else {
          // Add new useEffect
          const functionBodyStart = result.indexOf(
            "{",
            result.indexOf("function"),
          );
          if (functionBodyStart > -1) {
            const insertPos = result.indexOf("\n", functionBodyStart) + 1;
            result =
              result.slice(0, insertPos) +
              "\n  useEffect(() => {\n    setMounted(true);\n  }, []);\n" +
              result.slice(insertPos);
          }
        }
      }

      // Add conditional rendering for hydration safety
      if (!result.includes("if (!mounted)")) {
        const returnPattern = /return\s*\(/;
        if (returnPattern.test(result)) {
          result = result.replace(
            returnPattern,
            "if (!mounted) {\n    return null;\n  }\n\n  return (",
          );
        }
      }

      return result;
    }
  }

  return code;
}

function addUseClientDirective(code: string): string {
  const needsUseClient =
    code.includes("useState") ||
    code.includes("useEffect") ||
    code.includes("localStorage") ||
    code.includes("window.") ||
    code.includes("document.") ||
    code.includes("onClick") ||
    code.includes("onChange") ||
    code.includes("onSubmit");

  if (
    needsUseClient &&
    !code.includes("'use client'") &&
    !code.includes('"use client"')
  ) {
    return "'use client';\n\n" + code;
  }

  return code;
}
