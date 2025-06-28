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
      console.log(chalk.blue.bold("\n📋 NeuroLint Configuration:\n"));
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
        console.log(chalk.green(value));
      } else {
        console.log(chalk.red(`Configuration key "${options.get}" not found`));
      }
      return;
    }

    if (options.set) {
      const [key, value] = options.set.split("=");
      if (!key || !value) {
        console.log(chalk.red("Invalid format. Use: --set key=value"));
        return;
      }

      const newConfig = { ...config, [key]: value };
      await saveConfig(newConfig);
      console.log(chalk.green(`✅ Set ${key} = ${value}`));
      return;
    }

    if (options.reset) {
      await saveConfig({
        apiUrl: "http://localhost:5000",
        apiKey: "",
        defaultLayers: [1, 2, 3, 4],
      });
      console.log(chalk.green("✅ Configuration reset to defaults"));
      return;
    }

    // Default: show help
    console.log(chalk.blue.bold("\n⚙️  Configuration Management:\n"));
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
    console.error(chalk.red("Configuration error:"), error.message);
    process.exit(1);
  }
}
