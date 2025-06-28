import chalk from "chalk";
import ora from "ora";
import { glob } from "glob";
import fs from "fs-extra";
import path from "path";
import axios from "axios";
import inquirer from "inquirer";
import { loadConfig, validateConfig } from "../utils/config";
import { createBackup } from "../utils/backup";
import { validateFiles, validateLayerNumbers } from "../utils/validation";
import { withRetry } from "../utils/retry";
import { ProgressTracker, resumeOperation } from "../utils/progress";

interface FixOptions {
  layers?: string;
  recursive?: boolean;
  dryRun?: boolean;
  backup?: boolean;
  include?: string;
  exclude?: string;
  config?: string;
}

export async function fixCommand(files: string[], options: FixOptions) {
  const spinner = ora("Initializing NeuroLint fixes...").start();

  try {
    // Load and validate configuration
    const config = await loadConfig(options.config);
    const configValidation = await validateConfig(config);

    if (!configValidation.valid) {
      spinner.fail("Configuration validation failed");
      configValidation.errors.forEach((error) =>
        console.log(chalk.red(`❌ ${error}`)),
      );
      return;
    }

    // Check authentication
    if (!config.apiKey) {
      spinner.fail("Authentication required");
      console.log(
        chalk.yellow('💡 Run "neurolint login" to authenticate first'),
      );
      return;
    }

    // Validate input parameters
    const layersValidation = validateLayerNumbers(options.layers || "1,2,3,4");
    if (!layersValidation.valid) {
      spinner.fail("Invalid layer specification");
      layersValidation.errors.forEach((error) =>
        console.log(chalk.red(`❌ ${error}`)),
      );
      return;
    }

    // Resolve file patterns
    const filePatterns =
      files.length > 0
        ? files
        : config.files?.include || ["**/*.{ts,tsx,js,jsx}"];
    const includePatterns = options.include?.split(",") || [];
    const excludePatterns = options.exclude?.split(",") ||
      config.files?.exclude || ["node_modules/**", "dist/**", "build/**"];

    spinner.text = "Discovering files...";

    // Find all matching files
    const allFiles = [];
    for (const pattern of [...filePatterns, ...includePatterns]) {
      const matches = await glob(pattern, {
        ignore: excludePatterns,
        absolute: true,
      });
      allFiles.push(...matches);
    }

    const uniqueFiles = [...new Set(allFiles)];

    if (uniqueFiles.length === 0) {
      spinner.fail("No files found matching the specified patterns");
      return;
    }

    spinner.succeed(`Found ${uniqueFiles.length} files to fix`);

    // Parse layers
    const layers = options.layers
      ?.split(",")
      .map((l) => parseInt(l.trim())) || [1, 2, 3, 4];

    if (options.dryRun) {
      console.log(
        chalk.yellow("\n🔍 DRY RUN MODE - No files will be modified\n"),
      );
    }

    console.log(chalk.blue(`\n🔧 Fixing with layers: ${layers.join(", ")}\n`));

    const results = [];
    const fixedFiles = [];

    // Process files in batches
    const BATCH_SIZE = 5; // Smaller batch for fixes
    for (let i = 0; i < uniqueFiles.length; i += BATCH_SIZE) {
      const batch = uniqueFiles.slice(i, i + BATCH_SIZE);
      const batchSpinner = ora(
        `Processing files ${i + 1}-${Math.min(i + BATCH_SIZE, uniqueFiles.length)} of ${uniqueFiles.length}...`,
      ).start();

      const batchResults = await Promise.all(
        batch.map(async (filePath) => {
          try {
            const content = await fs.readFile(filePath, "utf-8");
            const relativePath = path.relative(process.cwd(), filePath);

            // Call NeuroLint transformation API
            const response = await axios.post(
              `${config.apiUrl || "http://localhost:5000"}/api/transform`,
              {
                code: content,
                filePath: relativePath,
                layers,
              },
              {
                headers: {
                  Authorization: `Bearer ${config.apiKey}`,
                  "Content-Type": "application/json",
                },
                timeout: 60000, // Longer timeout for transformations
              },
            );

            const { transformed, layers: layerResults } = response.data;

            // Check if any changes were made
            const hasChanges = transformed !== content;

            if (hasChanges && !options.dryRun) {
              // Create backup if requested
              if (options.backup) {
                await createBackup(filePath);
              }

              // Write fixed content
              await fs.writeFile(filePath, transformed, "utf-8");
              fixedFiles.push(relativePath);
            }

            return {
              file: relativePath,
              success: true,
              hasChanges,
              layers: layerResults,
              originalSize: content.length,
              transformedSize: transformed.length,
            };
          } catch (error) {
            return {
              file: path.relative(process.cwd(), filePath),
              success: false,
              hasChanges: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        }),
      );

      results.push(...batchResults);
      batchSpinner.succeed(
        `Completed batch ${Math.ceil((i + 1) / BATCH_SIZE)}`,
      );
    }

    // Display results
    console.log(chalk.green("\n✅ Fix Operation Complete!\n"));

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    const withChanges = results.filter((r) => r.hasChanges);

    if (options.dryRun) {
      console.log(chalk.blue("📋 Dry Run Results:"));
      withChanges.forEach((result) => {
        console.log(`${chalk.yellow("~")} ${result.file} - Would be modified`);
      });
    } else {
      console.log(chalk.blue("📝 Fixed Files:"));
      fixedFiles.forEach((file) => {
        console.log(`${chalk.green("✓")} ${file}`);
      });
    }

    // Summary statistics
    console.log(chalk.blue("\n📊 Summary:"));
    console.log(
      `${chalk.green("✓")} Successfully processed: ${successful.length}`,
    );
    console.log(`${chalk.blue("~")} Files with changes: ${withChanges.length}`);
    if (failed.length > 0) {
      console.log(`${chalk.red("✗")} Failed: ${failed.length}`);
    }

    // Show layer performance
    if (successful.length > 0) {
      const layerStats = {};
      successful.forEach((result) => {
        if (result.layers) {
          result.layers.forEach((layer) => {
            if (!layerStats[layer.id]) {
              layerStats[layer.id] = { applied: 0, total: 0 };
            }
            layerStats[layer.id].total++;
            if (layer.status === "success" && layer.changes > 0) {
              layerStats[layer.id].applied++;
            }
          });
        }
      });

      console.log(chalk.blue("\n🎯 Layer Applications:"));
      Object.entries(layerStats).forEach(([layerId, stats]: [string, any]) => {
        console.log(
          `Layer ${layerId}: ${chalk.green(`${stats.applied}/${stats.total}`)} files modified`,
        );
      });
    }

    // Offer to run analysis after fixes
    if (!options.dryRun && fixedFiles.length > 0) {
      const { runAnalysis } = await inquirer.prompt([
        {
          type: "confirm",
          name: "runAnalysis",
          message:
            "Would you like to run analysis on the fixed files to verify improvements?",
          default: true,
        },
      ]);

      if (runAnalysis) {
        console.log(chalk.blue("\n🔍 Running verification analysis...\n"));
        const { analyzeCommand } = await import("./analyze");
        await analyzeCommand(fixedFiles, {
          layers: options.layers,
          output: "summary",
        });
      }
    }
  } catch (error) {
    spinner.fail(
      `Fix operation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );

    if (error instanceof Error && error.message.includes("ECONNREFUSED")) {
      console.log(
        chalk.yellow("\n💡 Tip: Make sure the NeuroLint server is running:"),
      );
      console.log(chalk.gray("   npm run dev (in the main project directory)"));
    }
  }
}
