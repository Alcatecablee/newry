export interface TestCase {
  name: string;
  description: string;
  input: string;
  expectedFixes: string[];
  category: "config" | "pattern" | "component" | "hydration";
}

export interface TestResult {
  testCase: TestCase;
  passed: boolean;
  transformedCode: string;
  detectedFixes: string[];
  missingFixes: string[];
  executionTime: number;
}

// Enhanced test suite with comprehensive coverage for key layers
export const TEST_CASES: TestCase[] = [
  // === Layer 1 - Configuration Optimization Tests ===
  {
    name: "TypeScript Compiler Target Upgrade",
    description:
      "Ensures tsconfig.json target is set to ES2022 with modern configuration.",
    category: "config",
    input: `{
  "compilerOptions": {
    "target": "es5",
    "strict": true
  }
}`,
    expectedFixes: ["Upgraded TypeScript target to ES2022"],
  },
  {
    name: "Modern Next.js Config Export",
    description:
      "Ensures next.config.js uses modern module.exports pattern with reactStrictMode.",
    category: "config",
    input: `module.exports = {
  reactStrictMode: false,
  experimental: {}
};`,
    expectedFixes: ["Enabled reactStrictMode", "Optimized next.config.js"],
  },
  {
    name: "Package Scripts Upgrade",
    description:
      "Ensures package.json scripts include essential development and build commands.",
    category: "config",
    input: `{
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}`,
    expectedFixes: ["Added lint:fix script", "Added type-check script"],
  },
  {
    name: "TypeScript Strict Mode Configuration",
    description:
      "Validates TypeScript strict mode and modern compiler options are enabled.",
    category: "config",
    input: `{
  "compilerOptions": {
    "target": "ES2015",
    "strict": false,
    "noImplicitAny": false
  }
}`,
    expectedFixes: ["Upgraded TypeScript target to ES2022"],
  },

  // === Layer 2 - Pattern & Entity Fixes Tests ===
  {
    name: "HTML Entity Correction",
    description:
      "Replaces corrupted entities such as &quot; and &amp; in code.",
    category: "pattern",
    input: `
const title = &quot;Welcome &amp; Enjoy!&quot;;
// Hello &gt; Goodbye
`,
    expectedFixes: ["Fixed HTML entities in source"],
  },
  {
    name: "Complex HTML Entity Replacement",
    description:
      "Handles multiple types of HTML entities including currency and typography symbols.",
    category: "pattern",
    input: `
const price = &quot;$99.99&quot;;
const note = &ldquo;Hello&rdquo; &amp; &quot;World&quot;;
const math = 5 &gt; 3 &amp; 2 &lt; 4;
`,
    expectedFixes: ["Fixed HTML entities in source"],
  },
  {
    name: "Nested Entity Pattern Cleanup",
    description:
      "Fixes nested and overlapping HTML entity patterns in complex code structures.",
    category: "pattern",
    input: `
const config = {
  message: &quot;App &amp; Company&quot;,
  description: &quot;Hello &gt; World &amp; More&quot;
};
`,
    expectedFixes: ["Fixed HTML entities in source"],
  },

  // === Layer 4 - Hydration & SSR Guard Tests ===
  {
    name: "LocalStorage SSR Guard",
    description:
      "Protects localStorage access with SSR guard (typeof window check).",
    category: "hydration",
    input: `
const value = localStorage.getItem("something");
`,
    expectedFixes: ["Added SSR guard for localStorage"],
  },
  {
    name: "Multiple Browser API Guards",
    description:
      "Adds SSR guards for window, document, and localStorage access.",
    category: "hydration",
    input: `
const userAgent = navigator.userAgent;
const title = document.title;
const storage = localStorage.getItem("key");
const url = window.location.href;
`,
    expectedFixes: ["Added SSR guard for localStorage"],
  },
  {
    name: "SessionStorage Protection",
    description:
      "Ensures sessionStorage access is protected with proper SSR guards.",
    category: "hydration",
    input: `
sessionStorage.setItem("temp", "value");
const temp = sessionStorage.getItem("temp");
`,
    expectedFixes: ["Added SSR guard for localStorage"],
  },
  {
    name: "Complex Hydration Pattern",
    description:
      "Tests hydration safety in components with mixed client-side API usage.",
    category: "hydration",
    input: `
function Component() {
  const handleClick = () => {
    localStorage.setItem("clicked", "true");
    window.analytics.track("click");
  };
  return <button onClick={handleClick}>Click</button>;
}
`,
    expectedFixes: ["Added SSR guard for localStorage"],
  },

  // === Layer 3 - Component Best Practices Tests ===
  {
    name: "Missing Key Prop Correction",
    description:
      "Adds missing key prop to mapped elements in React components.",
    category: "component",
    input: `
function List({ items }) {
  return <ul>{items.map(item => <li>{item.name}</li>)}</ul>;
}
`,
    expectedFixes: ["Added missing key prop in mapped elements"],
  },
  {
    name: "Complex List Rendering",
    description:
      "Handles missing keys in nested and complex mapping scenarios.",
    category: "component",
    input: `
function ComplexList({ data }) {
  return (
    <div>
      {data.categories.map(category => (
        <div>
          <h3>{category.title}</h3>
          {category.items.map(item => <span>{item.label}</span>)}
        </div>
      ))}
    </div>
  );
}
`,
    expectedFixes: ["Added missing key prop in mapped elements"],
  },
];

// --- Update validateTestResult --
export function validateTestResult(
  testCase: TestCase,
  transformedCode: string,
): {
  passed: boolean;
  detectedFixes: string[];
  missingFixes: string[];
} {
  const detectedFixes: string[] = [];
  const missingFixes: string[] = [];

  // Checks for config optimizations only
  const checks: Record<string, boolean> = {
    // --- Layer 1 (config) ---
    "Upgraded TypeScript target to ES2022":
      transformedCode.includes('"target": "ES2022"') ||
      transformedCode.includes('"target":"ES2022"'),

    "Enabled reactStrictMode":
      transformedCode.includes("reactStrictMode: true") ||
      transformedCode.includes("reactStrictMode:true"),
    "Optimized next.config.js":
      !transformedCode.includes("experimental: {}") &&
      transformedCode.includes("module.exports"),

    "Added lint:fix script":
      transformedCode.includes('"lint:fix":') ||
      transformedCode.includes("'lint:fix':"),
    "Added type-check script":
      transformedCode.includes('"type-check":') ||
      transformedCode.includes("'type-check':"),

    // --- Layer 2: Pattern/entity fixes ---
    "Fixed HTML entities in source":
      transformedCode.includes('const title = "Welcome & Enjoy!";') &&
      transformedCode.includes("// Hello > Goodbye"),

    // --- Layer 3: Missing key prop ---
    "Added missing key prop in mapped elements": /<li key=/.test(
      transformedCode,
    ),

    // --- Layer 4: SSR guard for localStorage ---
    "Added SSR guard for localStorage":
      transformedCode.includes(
        'typeof window !== "undefined" && localStorage',
      ) ||
      transformedCode.includes(
        'typeof window !== "undefined" && sessionStorage',
      ) ||
      transformedCode.includes('typeof document !== "undefined"') ||
      transformedCode.includes('typeof navigator !== "undefined"'),
  };

  testCase.expectedFixes.forEach((expectedFix) => {
    if (checks[expectedFix]) {
      detectedFixes.push(expectedFix);
    } else {
      missingFixes.push(expectedFix);
    }
  });

  const passed = missingFixes.length === 0;

  return { passed, detectedFixes, missingFixes };
}
