import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { loadConfig, validateConfig } from "../utils/config";
import { withRetry } from "../utils/retry";

interface StatusOptions {
  detailed?: boolean;
}

export async function statusCommand(options: StatusOptions) {
  console.log(chalk.blue.bold("🧠 NeuroLint Project Status\n"));

  try {
    // Check configuration
    const configPath = path.join(process.cwd(), ".neurolint.json");
    const hasConfig = await fs.pathExists(configPath);

    console.log(chalk.white("Configuration:"));
    if (hasConfig) {
      console.log(
        `${chalk.green("✓")} Configuration file found: .neurolint.json`,
      );

      const config = await loadConfig();
      console.log(`${chalk.blue("  API URL:")} ${config.api.url}`);
      console.log(
        `${chalk.blue("  Enabled Layers:")} ${config.layers.enabled.join(", ")}`,
      );
      console.log(`${chalk.blue("  Output Format:")} ${config.output.format}`);

      if (config.apiKey) {
        console.log(`${chalk.green("✓")} API key configured`);
      } else {
        console.log(
          `${chalk.yellow("⚠")} No API key configured (run: neurolint login)`,
        );
      }
    } else {
      console.log(
        `${chalk.yellow("⚠")} No configuration found (run: neurolint init)`,
      );
    }

    // Check project structure
    console.log(chalk.white("\nProject Structure:"));
    const packageJsonPath = path.join(process.cwd(), "package.json");
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      console.log(`${chalk.green("✓")} package.json found`);

      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      if (deps.typescript) {
        console.log(`${chalk.green("✓")} TypeScript project detected`);
      }
      if (deps.react) {
        console.log(`${chalk.green("✓")} React project detected`);
      }
      if (deps.next) {
        console.log(`${chalk.green("✓")} Next.js project detected`);
      }
    }

    // Check for TypeScript config
    const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
    if (await fs.pathExists(tsconfigPath)) {
      console.log(`${chalk.green("✓")} tsconfig.json found`);
    }

    // Scan for files
    const { glob } = await import("glob");
    const jsFiles = await glob("**/*.{js,jsx}", {
      ignore: ["node_modules/**", "dist/**", "build/**"],
    });
    const tsFiles = await glob("**/*.{ts,tsx}", {
      ignore: ["node_modules/**", "dist/**", "build/**"],
    });

    console.log(chalk.white("\nFile Statistics:"));
    console.log(`${chalk.blue("  JavaScript files:")} ${jsFiles.length}`);
    console.log(`${chalk.blue("  TypeScript files:")} ${tsFiles.length}`);
    console.log(
      `${chalk.blue("  Total files:")} ${jsFiles.length + tsFiles.length}`,
    );

    if (options.detailed) {
      console.log(chalk.white("\nDetailed Analysis:"));

      // Analyze file extensions
      const extensions = {};
      [...jsFiles, ...tsFiles].forEach((file) => {
        const ext = path.extname(file);
        extensions[ext] = (extensions[ext] || 0) + 1;
      });

      Object.entries(extensions).forEach(([ext, count]) => {
        console.log(`${chalk.blue(`  ${ext} files:`)} ${count}`);
      });

      // Check for common patterns
      console.log(chalk.white("\nCommon Patterns:"));
      const componentFiles = [...jsFiles, ...tsFiles].filter(
        (f) =>
          f.includes("component") ||
          f.includes("Component") ||
          /\/[A-Z]/.test(f),
      );
      console.log(
        `${chalk.blue("  Component files:")} ${componentFiles.length}`,
      );

      const testFiles = [...jsFiles, ...tsFiles].filter(
        (f) =>
          f.includes(".test.") ||
          f.includes(".spec.") ||
          f.includes("__tests__"),
      );
      console.log(`${chalk.blue("  Test files:")} ${testFiles.length}`);
    }

    // Health check with retry logic
    console.log(chalk.white("\nHealth Check:"));
    try {
      const axios = await import("axios");
      const config = await loadConfig();

      await withRetry(
        async () => {
          const response = await axios.default.get(
            `${config.api?.url || "http://localhost:5000"}/health`,
            {
              timeout: 5000,
            },
          );

          if (response.status === 200) {
            console.log(`${chalk.green("✓")} NeuroLint API is accessible`);
            if (response.data?.version) {
              console.log(
                `${chalk.blue("  Version:")} ${response.data.version}`,
              );
            }
            if (response.data?.status) {
              console.log(`${chalk.blue("  Status:")} ${response.data.status}`);
            }
          }
        },
        {
          maxAttempts: 2,
          delay: 1000,
        },
      );

      // Test authentication if API key is configured
      if (config.apiKey) {
        try {
          const authResponse = await axios.default.get(
            `${config.api?.url || "http://localhost:5000"}/api/auth/verify`,
            {
              headers: { Authorization: `Bearer ${config.apiKey}` },
              timeout: 5000,
            },
          );

          if (authResponse.status === 200) {
            console.log(`${chalk.green("✓")} Authentication is valid`);
          }
        } catch (authError) {
          console.log(`${chalk.red("✗")} Authentication failed`);
          console.log(
            `${chalk.gray('  Run "neurolint login" to re-authenticate')}`,
          );
        }
      }
    } catch (error) {
      console.log(`${chalk.red("✗")} NeuroLint API is not accessible`);
      if (error instanceof Error) {
        if (error.message.includes("ECONNREFUSED")) {
          console.log(
            `${chalk.gray("  Make sure the server is running: npm run dev")}`,
          );
        } else if (error.message.includes("ENOTFOUND")) {
          console.log(
            `${chalk.gray("  Check the API URL in your configuration")}`,
          );
        } else {
          console.log(`${chalk.gray(`  Error: ${error.message}`)}`);
        }
      }
    }

    // Recommendations
    console.log(chalk.white("\nRecommendations:"));
    if (!hasConfig) {
      console.log(
        `${chalk.yellow("•")} Run ${chalk.white("neurolint init")} to set up configuration`,
      );
    }

    const config = await loadConfig();
    if (!config.apiKey) {
      console.log(
        `${chalk.yellow("•")} Run ${chalk.white("neurolint login")} to authenticate`,
      );
    }

    if (jsFiles.length + tsFiles.length > 0) {
      console.log(
        `${chalk.yellow("•")} Run ${chalk.white("neurolint analyze")} to check your code`,
      );
    }
  } catch (error) {
    console.error(
      chalk.red(
        `Status check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      ),
    );
  }
}
