import chalk from "chalk";
import { loadConfig, saveConfig, validateConfig } from "../utils/config";
import { validateApiUrl } from "../utils/validation";

interface ConfigOptions {
  set?: string;
  get?: string;
  list?: boolean;
  reset?: boolean;
}

export async function configCommand(options: ConfigOptions) {
  try {
    const config = await loadConfig();

    if (options.list) {
      console.log(chalk.white.bold("\nNeuroLint Configuration:\n"));
      console.log(
        chalk.white("API URL:"),
        chalk.gray(config.apiUrl || "Not set"),
      );
      console.log(
        chalk.white("API Key:"),
        chalk.gray(config.apiKey ? "***" + config.apiKey.slice(-4) : "Not set"),
      );
      console.log(
        chalk.white("Default Layers:"),
        chalk.gray(config.defaultLayers?.join(",") || "1,2,3,4"),
      );
      return;
    }

    if (options.get) {
      const value = (config as any)[options.get];
      if (value) {
        console.log(chalk.white(value));
      } else {
        console.log(
          chalk.white(`Configuration key "${options.get}" not found`),
        );
      }
      return;
    }

    if (options.set) {
      const [key, value] = options.set.split("=");
      if (!key || !value) {
        console.log(chalk.white("Invalid format. Use: --set key=value"));
        return;
      }

      // Validate specific configuration values
      if (key === "apiUrl" || key === "api.url") {
        const urlValidation = validateApiUrl(value);
        if (!urlValidation.valid) {
          console.log(chalk.white(`ERROR: ${urlValidation.errors[0]}`));
          return;
        }
      }

      // Build nested configuration object if needed
      let newConfig = { ...config };
      if (key.includes(".")) {
        const keys = key.split(".");
        let current = newConfig;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
      } else {
        newConfig[key] = value;
      }

      // Validate the entire configuration
      const configValidation = await validateConfig(newConfig);
      if (!configValidation.valid) {
        console.log(chalk.white("Configuration validation failed:"));
        configValidation.errors.forEach((error) =>
          console.log(chalk.white(`  ${error}`)),
        );
        return;
      }

      await saveConfig(newConfig);
      console.log(chalk.white(`Set ${key} = ${value}`));

      if (configValidation.errors.length > 0) {
        console.log(chalk.white("Configuration warnings:"));
        configValidation.errors.forEach((warning) =>
          console.log(chalk.white(`  ${warning}`)),
        );
      }

      return;
    }

    if (options.reset) {
      await saveConfig({
        apiUrl: "http://localhost:5000",
        apiKey: "",
        defaultLayers: [1, 2, 3, 4],
      });
      console.log(chalk.white("Configuration reset to defaults"));
      return;
    }

    // Default: show help
    console.log(chalk.white.bold("\nConfiguration Management:\n"));
    console.log(
      chalk.white("neurolint config --list"),
      chalk.gray("# Show all configuration"),
    );
    console.log(
      chalk.white("neurolint config --get apiUrl"),
      chalk.gray("# Get specific value"),
    );
    console.log(
      chalk.white("neurolint config --set apiUrl=http://localhost:5000"),
      chalk.gray("# Set value"),
    );
    console.log(
      chalk.white("neurolint config --reset"),
      chalk.gray("# Reset to defaults"),
    );
  } catch (error) {
    console.error(chalk.white("Configuration error:"), error.message);
    process.exit(1);
  }
}
