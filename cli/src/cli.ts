#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { analyzeCommand } from "./commands/analyze";
import { fixCommand } from "./commands/fix";
import { configCommand } from "./commands/config";
import { initCommand } from "./commands/init";
import { statusCommand } from "./commands/status";

const program = new Command();

program
  .name("neurolint")
  .description("NeuroLint CLI - AI-powered code analysis and transformation")
  .version("1.0.0");

// Welcome message
console.log(chalk.blue.bold("🧠 NeuroLint CLI"));
console.log(chalk.gray("AI-powered code analysis and transformation\n"));

// Initialize project command
program
  .command("init")
  .description("Initialize NeuroLint in your project")
  .option("-f, --force", "Overwrite existing configuration")
  .action(initCommand);

// Authentication handled via web interface

// Analysis command
program
  .command("analyze [files...]")
  .alias("scan")
  .description("Analyze code files for issues and improvements")
  .option("-l, --layers <layers>", "Specify layers to run (1-6)", "1,2,3,4")
  .option(
    "-o, --output <format>",
    "Output format (json|table|summary)",
    "table",
  )
  .option("-r, --recursive", "Analyze files recursively")
  .option("--include <patterns>", "Include file patterns (comma-separated)")
  .option("--exclude <patterns>", "Exclude file patterns (comma-separated)")
  .option("--config <path>", "Configuration file path")
  .action(analyzeCommand);

// Fix command
program
  .command("fix [files...]")
  .description("Fix code issues automatically")
  .option("-l, --layers <layers>", "Specify layers to run (1-6)", "1,2,3,4")
  .option("-r, --recursive", "Fix files recursively")
  .option("--dry-run", "Preview changes without applying them")
  .option("--backup", "Create backup files before fixing")
  .option("--include <patterns>", "Include file patterns (comma-separated)")
  .option("--exclude <patterns>", "Exclude file patterns (comma-separated)")
  .option("--config <path>", "Configuration file path")
  .action(fixCommand);

// Status command
program
  .command("status")
  .description("Show project analysis status and statistics")
  .option("--detailed", "Show detailed statistics")
  .action(statusCommand);

// Configuration management
program
  .command("config")
  .description("Manage NeuroLint configuration")
  .option("--set <key=value>", "Set configuration value")
  .option("--get <key>", "Get configuration value")
  .option("--list", "List all configuration")
  .option("--reset", "Reset to default configuration")
  .action(configCommand);

// Interactive mode
program
  .command("interactive")
  .alias("i")
  .description("Run NeuroLint in interactive mode")
  .action(async () => {
    console.log(chalk.cyan("🚀 Welcome to NeuroLint Interactive Mode\n"));

    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          "Analyze code files",
          "Fix code issues",
          "View project status",
          "Configure settings",
          "Exit",
        ],
      },
    ]);

    switch (answers.action) {
      case "Analyze code files":
        console.log(chalk.green("Starting code analysis..."));
        // Launch interactive analysis
        break;
      case "Fix code issues":
        console.log(chalk.green("Starting code fixes..."));
        // Launch interactive fixing
        break;
      case "View project status":
        await statusCommand({});
        break;
      case "Configure settings":
        await configCommand({});
        break;
      default:
        console.log(chalk.yellow("Goodbye! 👋"));
        process.exit(0);
    }
  });

// Help command
program
  .command("help")
  .description("Show help and examples")
  .action(() => {
    console.log(chalk.blue.bold("\n📖 NeuroLint CLI Examples:\n"));

    console.log(chalk.white("Initialize project:"));
    console.log(chalk.gray("  neurolint init\n"));

    console.log(chalk.white("Analyze specific files:"));
    console.log(chalk.gray("  neurolint analyze src/components/*.tsx\n"));

    console.log(chalk.white("Fix all TypeScript files:"));
    console.log(
      chalk.gray('  neurolint fix --recursive --include="**/*.ts,**/*.tsx"\n'),
    );

    console.log(chalk.white("Run specific layers:"));
    console.log(chalk.gray("  neurolint analyze --layers=1,3,4 src/\n"));

    console.log(chalk.white("Preview fixes without applying:"));
    console.log(chalk.gray("  neurolint fix --dry-run src/components/\n"));

    console.log(chalk.white("Interactive mode:"));
    console.log(chalk.gray("  neurolint interactive\n"));
  });

program.parse();
