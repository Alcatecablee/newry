// Browser-compatible config layer - no Node.js dependencies

interface TSConfig {
  compilerOptions?: Record<string, any>;
  include?: string[];
  exclude?: string[];
}

interface NextConfig {
  experimental?: Record<string, any>;
  typescript?: Record<string, any>;
  eslint?: Record<string, any>;
  [key: string]: any;
}

export async function transform(
  code: string,
  filePath?: string,
): Promise<string> {
  // Work with the code content directly (browser-compatible)
  return performCodeBasedTransforms(code);
}

function performCodeBasedTransforms(code: string): Promise<string> {
  // Detect file type from content and apply appropriate transforms
  if (code.includes('"compilerOptions"') || code.includes("compilerOptions")) {
    return Promise.resolve(fixTSConfigContent(code));
  } else if (code.includes("nextConfig") || code.includes("module.exports")) {
    return Promise.resolve(fixNextConfigContent(code));
  } else if (code.includes('"scripts"')) {
    return Promise.resolve(fixPackageJsonContent(code));
  }

  return Promise.resolve(code);
}

function fixTSConfigContent(content: string): string {
  try {
    const tsConfig: TSConfig = JSON.parse(content);

    // Enhanced TypeScript configuration with modern best practices
    tsConfig.compilerOptions = {
      ...tsConfig.compilerOptions,
      target: "ES2022",
      lib: ["dom", "dom.iterable", "ES2022"],
      allowJs: true,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      incremental: true,
      isolatedModules: true,
      jsx: "preserve",
      module: "esnext",
      moduleResolution: "node",
      noEmit: true,
      resolveJsonModule: true,
      skipLibCheck: true,
      strict: true,
      // Modern TypeScript features
      exactOptionalPropertyTypes: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      noUncheckedIndexedAccess: true,
      // Path mapping
      baseUrl: ".",
      paths: {
        "@/*": ["./src/*"],
        "~/*": ["./public/*"],
      },
    };

    // Ensure proper include/exclude patterns
    if (!tsConfig.include) {
      tsConfig.include = ["next-env.d.ts", "**/*.ts", "**/*.tsx"];
    }

    if (!tsConfig.exclude) {
      tsConfig.exclude = ["node_modules"];
    }

    return JSON.stringify(tsConfig, null, 2);
  } catch (error) {
    console.error("Error parsing tsconfig.json:", error);
    return content;
  }
}

function fixNextConfigContent(content: string): string {
  // Basic Next.js config template for browser context
  const nextConfigTemplate = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  swcMinify: true,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
}

module.exports = nextConfig`;

  return nextConfigTemplate;
}

function fixPackageJsonContent(content: string): string {
  try {
    const packageJson = JSON.parse(content);

    // Update scripts with better commands
    packageJson.scripts = {
      ...packageJson.scripts,
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "next lint",
      "lint:fix": "next lint --fix",
      "type-check": "tsc --noEmit",
      "format": "prettier --write .",
      "format:check": "prettier --check .",
    };

    // Ensure modern Node.js version
    if (!packageJson.engines) {
      packageJson.engines = {};
    }
    packageJson.engines.node = ">=18.0.0";

    return JSON.stringify(packageJson, null, 2);
  } catch (error) {
    console.error("Error parsing package.json:", error);
    return content;
  }
}