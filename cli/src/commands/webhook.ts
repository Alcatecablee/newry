import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { readConfig } from "../utils/config";
import { validateApiConnection } from "../utils/validation";

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
  stats: {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
  };
}

export async function webhookCommand(options: any) {
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
    await listWebhooks();
  } else if (options.create) {
    await createWebhook(
      options.url,
      options.events?.split(",") || [],
      options.secret,
    );
  } else if (options.delete) {
    await deleteWebhook(options.delete);
  } else if (options.test) {
    await testWebhook(options.test);
  } else if (options.logs) {
    await showWebhookLogs(options.logs);
  } else {
    await interactiveWebhookManagement();
  }
}

async function listWebhooks() {
  const spinner = ora("Fetching webhooks...").start();

  try {
    const config = readConfig();
    const response = await fetch(`${config.apiUrl}/api/enterprise/webhooks`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const webhooks: Webhook[] = await response.json();
    spinner.stop();

    if (webhooks.length === 0) {
      console.log(chalk.white("No webhooks configured"));
      console.log(
        chalk.gray(
          "Create a webhook with: neurolint webhook --create --url <url>",
        ),
      );
      return;
    }

    console.log(chalk.white.bold("\nConfigured Webhooks:\n"));

    webhooks.forEach((webhook) => {
      const statusColor = webhook.active ? chalk.gray : chalk.gray;
      console.log(chalk.white(`${webhook.id}`));
      console.log(chalk.gray(`  URL: ${webhook.url}`));
      console.log(chalk.gray(`  Events: ${webhook.events.join(", ")}`));
      console.log(
        statusColor(`  Status: ${webhook.active ? "Active" : "Inactive"}`),
      );
      console.log(
        chalk.gray(
          `  Deliveries: ${webhook.stats.successfulDeliveries}/${webhook.stats.totalDeliveries} successful`,
        ),
      );
      if (webhook.lastTriggered) {
        console.log(chalk.gray(`  Last triggered: ${webhook.lastTriggered}`));
      }
      console.log();
    });
  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to fetch webhooks"));
    console.log(
      chalk.gray(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

async function createWebhook(
  url?: string,
  events: string[] = [],
  secret?: string,
) {
  if (!url) {
    console.log(chalk.white("Webhook URL required"));
    console.log(
      chalk.gray(
        "Usage: neurolint webhook --create --url <url> --events <events> --secret <secret>",
      ),
    );
    return;
  }

  const availableEvents = [
    "analysis.completed",
    "analysis.failed",
    "fix.applied",
    "team.member.added",
    "team.member.removed",
    "compliance.updated",
    "security.alert",
  ];

  if (events.length === 0) {
    events = ["analysis.completed"];
  }

  const spinner = ora("Creating webhook...").start();

  try {
    const config = readConfig();
    const response = await fetch(`${config.apiUrl}/api/enterprise/webhooks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        events,
        secret: secret || generateSecret(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const webhook = await response.json();
    spinner.stop();

    console.log(chalk.white("Webhook created successfully"));
    console.log(chalk.gray(`ID: ${webhook.id}`));
    console.log(chalk.gray(`URL: ${webhook.url}`));
    console.log(chalk.gray(`Events: ${webhook.events.join(", ")}`));
    console.log(chalk.gray(`Secret: ${webhook.secret}`));
  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to create webhook"));
    console.log(
      chalk.gray(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

async function deleteWebhook(webhookId: string) {
  const confirm = await inquirer.prompt([
    {
      type: "confirm",
      name: "proceed",
      message: `Delete webhook ${webhookId}?`,
      default: false,
    },
  ]);

  if (!confirm.proceed) {
    console.log(chalk.gray("Operation cancelled"));
    return;
  }

  const spinner = ora("Deleting webhook...").start();

  try {
    const config = readConfig();
    const response = await fetch(
      `${config.apiUrl}/api/enterprise/webhooks/${webhookId}`,
      {
        method: "DELETE",
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
    console.log(chalk.white("Webhook deleted successfully"));
  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to delete webhook"));
    console.log(
      chalk.gray(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

async function testWebhook(webhookId: string) {
  const spinner = ora("Testing webhook...").start();

  try {
    const config = readConfig();
    const response = await fetch(
      `${config.apiUrl}/api/enterprise/webhooks/${webhookId}/test`,
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
      console.log(chalk.white("Webhook test successful"));
      console.log(
        chalk.gray(`Response: ${result.status} ${result.statusText}`),
      );
    } else {
      console.log(chalk.white("Webhook test failed"));
      console.log(chalk.gray(`Error: ${result.error}`));
    }
  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to test webhook"));
    console.log(
      chalk.gray(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

async function showWebhookLogs(webhookId: string) {
  const spinner = ora("Fetching webhook logs...").start();

  try {
    const config = readConfig();
    const response = await fetch(
      `${config.apiUrl}/api/enterprise/webhooks/${webhookId}/logs`,
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

    const logs = await response.json();
    spinner.stop();

    if (logs.length === 0) {
      console.log(chalk.white("No webhook logs found"));
      return;
    }

    console.log(chalk.white.bold(`\nWebhook Logs (${webhookId}):\n`));

    logs.forEach((log: any) => {
      const statusColor = log.success ? chalk.gray : chalk.gray;
      console.log(chalk.white(`${log.timestamp}`));
      console.log(chalk.gray(`  Event: ${log.event}`));
      console.log(
        statusColor(`  Status: ${log.status} (${log.responseTime}ms)`),
      );
      if (!log.success) {
        console.log(chalk.gray(`  Error: ${log.error}`));
      }
      console.log();
    });
  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to fetch webhook logs"));
    console.log(
      chalk.gray(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

function generateSecret(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function interactiveWebhookManagement() {
  console.log(chalk.white.bold("NeuroLint Webhook Management\n"));

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "List webhooks",
        "Create webhook",
        "Test webhook",
        "View webhook logs",
        "Delete webhook",
        "Exit",
      ],
    },
  ]);

  switch (answers.action) {
    case "List webhooks":
      await listWebhooks();
      break;
    case "Create webhook":
      const webhookData = await inquirer.prompt([
        {
          type: "input",
          name: "url",
          message: "Webhook URL:",
          validate: (input) =>
            input.startsWith("http") ||
            "URL must start with http:// or https://",
        },
        {
          type: "checkbox",
          name: "events",
          message: "Select events to subscribe to:",
          choices: [
            "analysis.completed",
            "analysis.failed",
            "fix.applied",
            "team.member.added",
            "team.member.removed",
            "compliance.updated",
            "security.alert",
          ],
        },
        {
          type: "input",
          name: "secret",
          message: "Webhook secret (optional):",
        },
      ]);
      await createWebhook(
        webhookData.url,
        webhookData.events,
        webhookData.secret,
      );
      break;
    case "Test webhook":
      const testId = await inquirer.prompt([
        {
          type: "input",
          name: "webhookId",
          message: "Enter webhook ID:",
          validate: (input) => input.length > 0 || "Webhook ID is required",
        },
      ]);
      await testWebhook(testId.webhookId);
      break;
    case "View webhook logs":
      const logsId = await inquirer.prompt([
        {
          type: "input",
          name: "webhookId",
          message: "Enter webhook ID:",
          validate: (input) => input.length > 0 || "Webhook ID is required",
        },
      ]);
      await showWebhookLogs(logsId.webhookId);
      break;
    case "Delete webhook":
      const deleteId = await inquirer.prompt([
        {
          type: "input",
          name: "webhookId",
          message: "Enter webhook ID to delete:",
          validate: (input) => input.length > 0 || "Webhook ID is required",
        },
      ]);
      await deleteWebhook(deleteId.webhookId);
      break;
    default:
      console.log(chalk.gray("Goodbye"));
      process.exit(0);
  }
}
