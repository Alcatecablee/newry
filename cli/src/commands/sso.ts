import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { readConfig, writeConfig } from "../utils/config";
import { validateApiConnection } from "../utils/validation";

interface SSOProvider {
  id: string;
  name: string;
  type: "saml" | "oidc" | "oauth2";
  domain: string;
  enabled: boolean;
  userCount: number;
  lastSync: string;
  settings: {
    entityId?: string;
    ssoUrl?: string;
    certificate?: string;
    issuer?: string;
    authUrl?: string;
    tokenUrl?: string;
    clientId?: string;
    clientSecret?: string;
  };
}

export async function ssoCommand(options: any) {
  const config = readConfig();

  if (!config.apiKey) {
    console.log(chalk.white("Enterprise authentication required."));
    console.log(chalk.gray("Run 'neurolint login --enterprise' first."));
    return;
  }

  try {
    await validateApiConnection(config);
  } catch (error) {
    console.log(chalk.white("Failed to connect to NeuroLint API"));
    console.log(chalk.gray("Check your internet connection and API key"));
    return;
  }

  if (options.list) {
    await listSSOProviders();
  } else if (options.setup) {
    await setupSSO(options.setup, options.domain);
  } else if (options.test) {
    await testSSO(options.test);
  } else if (options.sync) {
    await syncUsers(options.sync);
  } else if (options.disable) {
    await disableSSO(options.disable);
  } else {
    await interactiveSSOManagement();
  }
}

async function listSSOProviders() {
  const spinner = ora("Fetching SSO providers...").start();

  try {
    const config = readConfig();
    const response = await fetch(
      `${config.apiUrl}/api/enterprise/sso-providers`,
      {
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const providers: SSOProvider[] = await response.json();
    spinner.stop();

    if (providers.length === 0) {
      console.log(chalk.white("No SSO providers configured"));
      console.log(
        chalk.gray(
          "Set up SSO with: neurolint sso --setup <type> --domain <domain>",
        ),
      );
      return;
    }

    console.log(chalk.white.bold("\nSSO Providers:\n"));

    providers.forEach((provider) => {
      const statusColor = provider.enabled ? chalk.gray : chalk.gray;
      console.log(chalk.white(`${provider.name} (${provider.id})`));
      console.log(chalk.gray(`  Type: ${provider.type.toUpperCase()}`));
      console.log(chalk.gray(`  Domain: ${provider.domain}`));
      console.log(
        statusColor(`  Status: ${provider.enabled ? "Enabled" : "Disabled"}`),
      );
      console.log(chalk.gray(`  Users: ${provider.userCount}`));
      if (provider.lastSync) {
        console.log(chalk.gray(`  Last sync: ${provider.lastSync}`));
      }
      console.log();
    });
  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to fetch SSO providers"));
    console.log(
      chalk.gray(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

async function setupSSO(type?: string, domain?: string) {
  if (!type || !domain) {
    console.log(chalk.white("SSO type and domain required"));
    console.log(
      chalk.gray(
        "Usage: neurolint sso --setup <saml|oidc|oauth2> --domain <domain>",
      ),
    );
    return;
  }

  const validTypes = ["saml", "oidc", "oauth2"];
  if (!validTypes.includes(type)) {
    console.log(chalk.white("Invalid SSO type"));
    console.log(chalk.gray("Supported types: saml, oidc, oauth2"));
    return;
  }

  console.log(
    chalk.white.bold(`Setting up ${type.toUpperCase()} SSO for ${domain}\n`),
  );

  let settings: any = {};

  switch (type) {
    case "saml":
      settings = await promptSAMLSettings();
      break;
    case "oidc":
      settings = await promptOIDCSettings();
      break;
    case "oauth2":
      settings = await promptOAuth2Settings();
      break;
  }

  const spinner = ora("Configuring SSO provider...").start();

  try {
    const config = readConfig();
    const response = await fetch(
      `${config.apiUrl}/api/enterprise/sso-providers`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          domain,
          settings,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const provider = await response.json();
    spinner.stop();

    console.log(chalk.white("SSO provider configured successfully"));
    console.log(chalk.gray(`Provider ID: ${provider.id}`));
    console.log(chalk.gray(`Type: ${provider.type.toUpperCase()}`));
    console.log(chalk.gray(`Domain: ${provider.domain}`));
    console.log(
      chalk.gray(`Status: ${provider.enabled ? "Enabled" : "Disabled"}`),
    );
  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to configure SSO provider"));
    console.log(
      chalk.gray(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

async function promptSAMLSettings() {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "entityId",
      message: "SAML Entity ID:",
      validate: (input) => input.length > 0 || "Entity ID is required",
    },
    {
      type: "input",
      name: "ssoUrl",
      message: "SAML SSO URL:",
      validate: (input) =>
        input.startsWith("http") || "URL must start with http:// or https://",
    },
    {
      type: "editor",
      name: "certificate",
      message: "SAML Certificate (X.509):",
      validate: (input) =>
        input.includes("BEGIN CERTIFICATE") ||
        "Valid X.509 certificate required",
    },
  ]);

  return answers;
}

async function promptOIDCSettings() {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "issuer",
      message: "OIDC Issuer URL:",
      validate: (input) =>
        input.startsWith("http") || "URL must start with http:// or https://",
    },
    {
      type: "input",
      name: "clientId",
      message: "Client ID:",
      validate: (input) => input.length > 0 || "Client ID is required",
    },
    {
      type: "password",
      name: "clientSecret",
      message: "Client Secret:",
      validate: (input) => input.length > 0 || "Client Secret is required",
    },
  ]);

  return answers;
}

async function promptOAuth2Settings() {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "authUrl",
      message: "Authorization URL:",
      validate: (input) =>
        input.startsWith("http") || "URL must start with http:// or https://",
    },
    {
      type: "input",
      name: "tokenUrl",
      message: "Token URL:",
      validate: (input) =>
        input.startsWith("http") || "URL must start with http:// or https://",
    },
    {
      type: "input",
      name: "clientId",
      message: "Client ID:",
      validate: (input) => input.length > 0 || "Client ID is required",
    },
    {
      type: "password",
      name: "clientSecret",
      message: "Client Secret:",
      validate: (input) => input.length > 0 || "Client Secret is required",
    },
  ]);

  return answers;
}

async function testSSO(providerId: string) {
  const spinner = ora("Testing SSO configuration...").start();

  try {
    const config = readConfig();
    const response = await fetch(
      `${config.apiUrl}/api/enterprise/sso-providers/${providerId}/test`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    spinner.stop();

    if (result.success) {
      console.log(chalk.white("SSO test successful"));
      console.log(chalk.gray(`Connection: ${result.status}`));
      console.log(chalk.gray(`Response time: ${result.responseTime}ms`));
    } else {
      console.log(chalk.white("SSO test failed"));
      console.log(chalk.gray(`Error: ${result.error}`));
      console.log(
        chalk.gray(`Details: ${result.details || "No additional details"}`),
      );
    }
  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to test SSO"));
    console.log(
      chalk.gray(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

async function syncUsers(providerId: string) {
  const spinner = ora("Syncing users...").start();

  try {
    const config = readConfig();
    const response = await fetch(
      `${config.apiUrl}/api/enterprise/sso-providers/${providerId}/sync`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    spinner.stop();

    console.log(chalk.white("User sync completed"));
    console.log(chalk.gray(`Added: ${result.added} users`));
    console.log(chalk.gray(`Updated: ${result.updated} users`));
    console.log(chalk.gray(`Removed: ${result.removed} users`));
    console.log(chalk.gray(`Total: ${result.total} users`));
  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to sync users"));
    console.log(
      chalk.gray(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

async function disableSSO(providerId: string) {
  const confirm = await inquirer.prompt([
    {
      type: "confirm",
      name: "proceed",
      message: `Disable SSO provider ${providerId}? Users will no longer be able to sign in via SSO.`,
      default: false,
    },
  ]);

  if (!confirm.proceed) {
    console.log(chalk.gray("Operation cancelled"));
    return;
  }

  const spinner = ora("Disabling SSO provider...").start();

  try {
    const config = readConfig();
    const response = await fetch(
      `${config.apiUrl}/api/enterprise/sso-providers/${providerId}/disable`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    spinner.stop();
    console.log(chalk.white("SSO provider disabled successfully"));
  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to disable SSO provider"));
    console.log(
      chalk.gray(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

async function interactiveSSOManagement() {
  console.log(chalk.white.bold("NeuroLint SSO Management\n"));

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "List SSO providers",
        "Setup new SSO provider",
        "Test SSO configuration",
        "Sync users from SSO",
        "Disable SSO provider",
        "Exit",
      ],
    },
  ]);

  switch (answers.action) {
    case "List SSO providers":
      await listSSOProviders();
      break;
    case "Setup new SSO provider":
      const setupData = await inquirer.prompt([
        {
          type: "list",
          name: "type",
          message: "SSO Provider type:",
          choices: ["saml", "oidc", "oauth2"],
        },
        {
          type: "input",
          name: "domain",
          message: "Organization domain:",
          validate: (input) =>
            input.includes(".") || "Valid domain is required",
        },
      ]);
      await setupSSO(setupData.type, setupData.domain);
      break;
    case "Test SSO configuration":
      const testId = await inquirer.prompt([
        {
          type: "input",
          name: "providerId",
          message: "Enter SSO provider ID:",
          validate: (input) => input.length > 0 || "Provider ID is required",
        },
      ]);
      await testSSO(testId.providerId);
      break;
    case "Sync users from SSO":
      const syncId = await inquirer.prompt([
        {
          type: "input",
          name: "providerId",
          message: "Enter SSO provider ID:",
          validate: (input) => input.length > 0 || "Provider ID is required",
        },
      ]);
      await syncUsers(syncId.providerId);
      break;
    case "Disable SSO provider":
      const disableId = await inquirer.prompt([
        {
          type: "input",
          name: "providerId",
          message: "Enter SSO provider ID to disable:",
          validate: (input) => input.length > 0 || "Provider ID is required",
        },
      ]);
      await disableSSO(disableId.providerId);
      break;
    default:
      console.log(chalk.gray("Goodbye"));
      process.exit(0);
  }
}
