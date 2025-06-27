export async function transform(code: string): Promise<string> {
  let transformed = code;

  // Apply Next.js specific fixes
  transformed = fixUseClientDirectives(transformed);
  transformed = fixCorruptedImports(transformed);
  transformed = addMissingUseClient(transformed);
  transformed = fixImportOrder(transformed);
  transformed = fixAppRouterPatterns(transformed);

  return transformed;
}

function fixUseClientDirectives(code: string): string {
  const lines = code.split("\n");
  const useClientIndices = [];

  // Find all 'use client' directives
  lines.forEach((line, index) => {
    if (line.trim() === "'use client';" || line.trim() === '"use client";') {
      useClientIndices.push(index);
    }
  });

  if (useClientIndices.length === 0) return code;

  // Remove all 'use client' directives
  const filteredLines = lines.filter(
    (line) =>
      line.trim() !== "'use client';" && line.trim() !== '"use client";',
  );

  // Find the first non-comment, non-empty line
  let insertIndex = 0;
  for (let i = 0; i < filteredLines.length; i++) {
    const line = filteredLines[i].trim();
    if (line && !line.startsWith("//") && !line.startsWith("/*")) {
      insertIndex = i;
      break;
    }
  }

  // Insert 'use client' at the top
  filteredLines.splice(insertIndex, 0, "'use client';", "");

  return filteredLines.join("\n");
}

function fixCorruptedImports(code: string): string {
  let fixed = code;

  // Fix pattern: import {\n import { ... } from "..."
  fixed = fixed.replace(
    /import\s*{\s*\n\s*import\s*{([^}]+)}\s*from\s*["']([^"']+)["']/gm,
    'import { $1 } from "$2"',
  );

  // Fix pattern: import {\n  SomeComponent,\n} from "..."
  fixed = fixed.replace(
    /import\s*{\s*\n\s*([^}]+)\n\s*}\s*from\s*["']([^"']+)["']/gm,
    'import {\n  $1\n} from "$2"',
  );

  // Fix standalone import { without closing
  fixed = fixed.replace(/^import\s*{\s*$/gm, "");

  // Clean up duplicate imports
  const lines = fixed.split("\n");
  const cleanedLines = [];
  const seenImports = new Set();

  for (const line of lines) {
    if (line.trim().startsWith("import ")) {
      const importKey = line.trim().replace(/\s+/g, " ");
      if (!seenImports.has(importKey)) {
        seenImports.add(importKey);
        cleanedLines.push(line);
      }
    } else {
      cleanedLines.push(line);
    }
  }

  return cleanedLines.join("\n");
}

function addMissingUseClient(code: string): string {
  // More conservative: only add use client if absolutely necessary
  const hasHooks = /use(State|Effect|Reducer)/.test(code); // Only core hooks
  const hasUseClient =
    code.includes("'use client'") || code.includes('"use client"');
  const isComponent =
    code.includes("export default function") ||
    code.includes("export function");
  const hasEventHandlers = /onClick|onChange|onSubmit/g.test(code); // Only common handlers
  const hasBrowserAPIs =
    code.includes("localStorage") ||
    code.includes("window.location") ||
    code.includes("document.getElementById");

  // Only add if it's clearly a client component AND doesn't already have the directive
  if (
    (hasHooks || hasEventHandlers || hasBrowserAPIs) &&
    !hasUseClient &&
    isComponent
  ) {
    // Extra safety: don't add if this looks like a server component
    if (
      code.includes("getServerSideProps") ||
      code.includes("getStaticProps") ||
      code.includes("generateMetadata")
    ) {
      return code;
    }

    return "'use client';\n\n" + code;
  }

  return code;
}

function fixImportOrder(code: string): string {
  if (code.startsWith("'use client';")) {
    // Ensure proper spacing after 'use client'
    return code.replace(/^'use client';\n+/, "'use client';\n\n");
  }

  return code;
}

function fixAppRouterPatterns(code: string): string {
  let fixed = code;

  // Only apply App Router patterns if this is clearly an App Router file
  const isAppRouterFile =
    code.includes("export default function Page") ||
    code.includes("export default function Layout") ||
    code.includes("generateMetadata") ||
    code.includes("export const metadata");

  if (!isAppRouterFile) {
    return code; // Don't modify non-App Router files
  }

  // Fix page.tsx exports (only if clearly needed)
  if (
    code.includes("export default function") &&
    /function\s+\w*Page\w*/.test(code)
  ) {
    fixed = fixed.replace(
      /export default function (\w*Page\w*)/g,
      "export default function Page",
    );
  }

  // Fix layout.tsx exports (only if clearly needed)
  if (
    code.includes("export default function") &&
    /function\s+\w*Layout\w*/.test(code)
  ) {
    fixed = fixed.replace(
      /export default function (\w*Layout\w*)/g,
      "export default function Layout",
    );
  }

  // Only add metadata if it's clearly a page file and missing metadata
  if (
    code.includes("export default function Page") &&
    !code.includes("export const metadata") &&
    !code.includes("generateMetadata") &&
    code.length < 500
  ) {
    // Only for simple pages
    const metadataExport = `export const metadata = {
  title: 'Page',
  description: 'Page description',
};

`;
    fixed = metadataExport + fixed;
  }

  return fixed;
}
