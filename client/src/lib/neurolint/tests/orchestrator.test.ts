/**
 * Comprehensive test suite for NeuroLint orchestrator
 */

import { NeuroLintOrchestrator } from "../orchestrator";
import { CodeValidator } from "../validation/codeValidator";

describe("NeuroLint Orchestrator", () => {
  // Test data
  const validReactComponent = `
import React from 'react';

export default function TestComponent() {
  const items = [1, 2, 3];
  return (
    <div>
      {items.map(item => <div>{item}</div>)}
    </div>
  );
}
`;

  const invalidCode = `
import React from 'react';
export default function BrokenComponent() {
  return (
    <div onClick={(() => {}) => ()} // Broken handler
      {incomplete jsx
  );
}
`;

  const maliciousCode = `
import React from 'react';
eval('alert("XSS")');
export default function MaliciousComponent() {
  return <div>Test</div>;
}
`;

  describe("Security Validation", () => {
    test("should reject malicious code", async () => {
      await expect(NeuroLintOrchestrator(maliciousCode)).rejects.toThrow();
    });

    test("should handle file size limits", async () => {
      const largeCode = 'const x = "a".repeat(11 * 1024 * 1024);'; // 11MB
      await expect(NeuroLintOrchestrator(largeCode)).rejects.toThrow();
    });

    test("should sanitize dangerous patterns", () => {
      const result = CodeValidator.validate(maliciousCode);
      expect(result.securityIssues.length).toBeGreaterThan(0);
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid code gracefully", async () => {
      const result = await NeuroLintOrchestrator(
        invalidCode,
        undefined,
        true,
        [1, 2],
      );
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.transformed).toBeDefined();
    });

    test("should recover from layer failures", async () => {
      // Test with layers that might conflict
      const result = await NeuroLintOrchestrator(
        validReactComponent,
        undefined,
        true,
        [1, 2, 3, 4, 5, 6],
      );
      expect(result.layers.some((l) => l.success)).toBe(true);
    });

    test("should respect timeout limits", async () => {
      // This would need to be tested with actual slow transformations
      const startTime = Date.now();
      await NeuroLintOrchestrator(validReactComponent);
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(300000); // 5 minutes max
    });
  });

  describe("Performance", () => {
    test("should complete transformations within reasonable time", async () => {
      const startTime = performance.now();
      const result = await NeuroLintOrchestrator(validReactComponent);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(30000); // 30 seconds
      expect(result.performance.totalDuration).toBeLessThan(30000);
    });

    test("should use caching effectively", async () => {
      // First run
      await NeuroLintOrchestrator(validReactComponent);

      // Second run should be faster due to caching
      const startTime = performance.now();
      const result = await NeuroLintOrchestrator(validReactComponent);
      const duration = performance.now() - startTime;

      expect(result.cacheHits).toBeGreaterThan(0);
      expect(duration).toBeLessThan(5000); // Should be much faster
    });

    test("should handle memory efficiently", async () => {
      const result = await NeuroLintOrchestrator(validReactComponent);
      expect(result.performance.memoryPeak).toBeLessThan(100 * 1024 * 1024); // 100MB
    });
  });

  describe("Layer Validation", () => {
    test("should apply layers in correct order", async () => {
      const result = await NeuroLintOrchestrator(
        validReactComponent,
        undefined,
        true,
        [1, 2, 3, 4],
      );
      expect(result.layers).toHaveLength(4);
      expect(result.layers[0].name).toContain("Configuration");
      expect(result.layers[1].name).toContain("Pattern");
      expect(result.layers[2].name).toContain("Component");
      expect(result.layers[3].name).toContain("Hydration");
    });

    test("should skip dangerous transformations", async () => {
      const corruptedCode = invalidCode;
      const result = await NeuroLintOrchestrator(
        corruptedCode,
        undefined,
        true,
        [5, 6],
      );

      // Layers 5-6 should be more cautious with corrupted code
      const layer5 = result.layers.find((l) => l.name.includes("Next.js"));
      const layer6 = result.layers.find((l) => l.name.includes("Quality"));

      // At least one should skip or fail safely
      expect([layer5?.success, layer6?.success].includes(false)).toBe(true);
    });

    test("should revert dangerous transformations", async () => {
      // Test case where transformation would break code
      const result = await NeuroLintOrchestrator(validReactComponent);

      // All successful transformations should maintain code validity
      for (const layer of result.layers) {
        if (layer.success) {
          const validation = CodeValidator.validate(layer.code);
          expect(validation.corruptionDetected).toBe(false);
        }
      }
    });
  });

  describe("Rate Limiting", () => {
    test("should enforce rate limits", async () => {
      const userId = "test-user-123";

      // Make multiple requests rapidly
      const promises = Array(60)
        .fill(null)
        .map(() =>
          NeuroLintOrchestrator(
            validReactComponent,
            undefined,
            true,
            [1],
            userId,
          ),
        );

      const results = await Promise.allSettled(promises);
      const rejectedCount = results.filter(
        (r) => r.status === "rejected",
      ).length;

      expect(rejectedCount).toBeGreaterThan(0); // Some should be rate limited
    });
  });

  describe("Code Quality", () => {
    test("should improve code quality metrics", async () => {
      const poorQualityCode = `
import React from 'react';
export default function Component() {
  const items = [1,2,3];
  return <div>{items.map(item => <span>{item}</span>)}</div>;
}
`;

      const result = await NeuroLintOrchestrator(
        poorQualityCode,
        undefined,
        true,
        [3],
      );

      // Should add missing key props
      expect(result.transformed).toContain("key=");
      expect(result.layers[0].changeCount).toBeGreaterThan(0);
    });

    test("should maintain JSX validity", async () => {
      const result = await NeuroLintOrchestrator(validReactComponent);

      // Final output should still be valid JSX
      expect(result.transformed).toContain("<div>");
      expect(result.transformed).toContain("</div>");
      expect(result.transformed).toContain("export default");
    });

    test("should preserve original functionality", async () => {
      const result = await NeuroLintOrchestrator(validReactComponent);

      // Should still export a component
      expect(result.transformed).toContain("export default");
      expect(result.transformed).toContain("function");
      expect(result.transformed).toContain("return");
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty code", async () => {
      await expect(NeuroLintOrchestrator("")).rejects.toThrow();
    });

    test("should handle non-string input", async () => {
      await expect(NeuroLintOrchestrator(null as any)).rejects.toThrow();
      await expect(NeuroLintOrchestrator(undefined as any)).rejects.toThrow();
    });

    test("should handle very long lines", async () => {
      const longLineCode = `const x = "${"a".repeat(10000)}";`;
      const result = await NeuroLintOrchestrator(longLineCode);
      expect(result.transformed).toBeDefined();
    });

    test("should handle deeply nested code", async () => {
      const deeplyNested = `
function a() {
  function b() {
    function c() {
      function d() {
        function e() {
          return "deep";
        }
        return e();
      }
      return d();
    }
    return c();
  }
  return b();
}
`;
      const result = await NeuroLintOrchestrator(deeplyNested);
      expect(result.transformed).toBeDefined();
    });
  });
});

// Mock data and utilities for testing
export const TestUtils = {
  mockValidCode: validReactComponent,
  mockInvalidCode: invalidCode,
  mockMaliciousCode: maliciousCode,

  createLargeCode: (sizeMB: number) => {
    return `const data = "${Array(sizeMB * 1024 * 1024)
      .fill("a")
      .join("")}";`;
  },

  createComplexComponent: (depth: number) => {
    let code =
      'import React from "react";\n\nexport default function Component() {\n';
    for (let i = 0; i < depth; i++) {
      code += `  if (condition${i}) {\n`;
    }
    code += "    return <div>Complex</div>;\n";
    for (let i = 0; i < depth; i++) {
      code += "  }\n";
    }
    code += "}";
    return code;
  },
};
