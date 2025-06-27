import fs from 'fs-extra';
import path from 'path';

export interface NeuroLintConfig {
  version: string;
  layers: {
    enabled: number[];
    config: Record<number, { name: string; timeout: number; enabled?: boolean }>;
  };
  files: {
    include: string[];
    exclude: string[];
  };
  output: {
    format: 'table' | 'json' | 'summary';
    verbose: boolean;
  };
  api: {
    url: string;
    timeout: number;
  };
  apiKey?: string;
}

export async function loadConfig(configPath?: string): Promise<NeuroLintConfig> {
  const defaultConfig: NeuroLintConfig = {
    version: "1.0.0",
    layers: {
      enabled: [1, 2, 3, 4],
      config: {
        1: { name: "Configuration Validation", timeout: 30000 },
        2: { name: "Pattern & Entity Fixes", timeout: 45000 },
        3: { name: "Component Best Practices", timeout: 60000 },
        4: { name: "Hydration & SSR Guard", timeout: 45000 },
        5: { name: "Next.js Optimization", timeout: 30000, enabled: false },
        6: { name: "Quality & Performance", timeout: 30000, enabled: false }
      }
    },
    files: {
      include: ["**/*.{ts,tsx,js,jsx}"],
      exclude: ["node_modules/**", "dist/**", "build/**", ".next/**", "coverage/**"]
    },
    output: {
      format: "table",
      verbose: false
    },
    api: {
      url: "http://localhost:5000",
      timeout: 60000
    }
  };

  // Try multiple config file locations
  const configPaths = [
    configPath,
    path.join(process.cwd(), '.neurolint.json'),
    path.join(process.cwd(), 'neurolint.config.json'),
    path.join(process.cwd(), 'package.json')
  ].filter(Boolean);

  for (const filePath of configPaths) {
    if (await fs.pathExists(filePath)) {
      try {
        const fileContent = await fs.readJson(filePath);
        
        if (filePath.endsWith('package.json')) {
          // Extract neurolint config from package.json
          if (fileContent.neurolint) {
            return { ...defaultConfig, ...fileContent.neurolint };
          }
        } else {
          return { ...defaultConfig, ...fileContent };
        }
      } catch (error) {
        console.warn(`Failed to load config from ${filePath}:`, error);
      }
    }
  }

  return defaultConfig;
}