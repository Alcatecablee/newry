import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { readConfig, writeConfig } from "../utils/config";
import { validateApiConnection } from "../utils/validation";

interface TeamMember {
  id: string;
  email: string;
  role: "admin" | "member" | "viewer";
  status: "active" | "pending" | "suspended";
  lastActivity: string;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  settings: {
    defaultRole: string;
    requireApproval: boolean;
    ssoEnabled: boolean;
  };
}

export async function teamCommand(options: any) {
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
    await listTeams();
  } else if (options.members) {
    await listMembers(options.team);
  } else if (options.invite) {
    await inviteMember(options.team, options.invite, options.role || "member");
  } else if (options.remove) {
    await removeMember(options.team, options.remove);
  } else if (options.create) {
    await createTeam(options.create);
  } else {
    await interactiveTeamManagement();
  }
}

async function listTeams() {
  const spinner = ora("Fetching teams...").start();

  try {
    const config = readConfig();
    const response = await fetch(`${config.apiUrl}/api/teams`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const teams: Team[] = await response.json();
    spinner.stop();

    if (teams.length === 0) {
      console.log(chalk.white("No teams found"));
      console.log(
        chalk.gray("Create a team with: neurolint team --create <name>"),
      );
      return;
    }

    console.log(chalk.white.bold("\nTeams:\n"));

    teams.forEach((team) => {
      console.log(chalk.white(`${team.name} (${team.id})`));
      console.log(chalk.gray(`  Members: ${team.members.length}`));
      console.log(
        chalk.gray(
          `  SSO: ${team.settings.ssoEnabled ? "Enabled" : "Disabled"}`,
        ),
      );
      console.log();
    });
  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to fetch teams"));
    console.log(
      chalk.gray(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

async function listMembers(teamId?: string) {
  if (!teamId) {
    console.log(chalk.white("Team ID required"));
    console.log(chalk.gray("Usage: neurolint team --members <team-id>"));
    return;
  }

  const spinner = ora("Fetching team members...").start();

  try {
    const config = readConfig();
    const response = await fetch(
      `${config.apiUrl}/api/teams/${teamId}/members`,
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

    const members: TeamMember[] = await response.json();
    spinner.stop();

    if (members.length === 0) {
      console.log(chalk.white("No team members found"));
      return;
    }

    console.log(chalk.white.bold("\nTeam Members:\n"));

    const table = members.map((member) => ({
      Email: member.email,
      Role: member.role,
      Status: member.status,
      "Last Activity": member.lastActivity,
    }));

    console.table(table);
  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to fetch team members"));
    console.log(
      chalk.gray(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

async function inviteMember(
  teamId?: string,
  email?: string,
  role: string = "member",
) {
  if (!teamId || !email) {
    console.log(chalk.white("Team ID and email required"));
    console.log(
      chalk.gray(
        "Usage: neurolint team --invite <email> --team <team-id> --role <role>",
      ),
    );
    return;
  }

  const spinner = ora(`Inviting ${email} to team...`).start();

  try {
    const config = readConfig();
    const response = await fetch(
      `${config.apiUrl}/api/teams/${teamId}/invite`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    spinner.stop();
    console.log(chalk.white(`Successfully invited ${email} as ${role}`));
  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to invite team member"));
    console.log(
      chalk.gray(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

async function removeMember(teamId?: string, email?: string) {
  if (!teamId || !email) {
    console.log(chalk.white("Team ID and email required"));
    console.log(
      chalk.gray("Usage: neurolint team --remove <email> --team <team-id>"),
    );
    return;
  }

  const confirm = await inquirer.prompt([
    {
      type: "confirm",
      name: "proceed",
      message: `Remove ${email} from team?`,
      default: false,
    },
  ]);

  if (!confirm.proceed) {
    console.log(chalk.gray("Operation cancelled"));
    return;
  }

  const spinner = ora(`Removing ${email} from team...`).start();

  try {
    const config = readConfig();
    const response = await fetch(
      `${config.apiUrl}/api/teams/${teamId}/members/${email}`,
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
    console.log(chalk.white(`Successfully removed ${email} from team`));
  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to remove team member"));
    console.log(
      chalk.gray(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

async function createTeam(name?: string) {
  if (!name) {
    console.log(chalk.white("Team name required"));
    console.log(chalk.gray("Usage: neurolint team --create <name>"));
    return;
  }

  const spinner = ora(`Creating team "${name}"...`).start();

  try {
    const config = readConfig();
    const response = await fetch(`${config.apiUrl}/api/teams`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const team = await response.json();
    spinner.stop();
    console.log(chalk.white(`Successfully created team "${name}"`));
    console.log(chalk.gray(`Team ID: ${team.id}`));
  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to create team"));
    console.log(
      chalk.gray(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

async function interactiveTeamManagement() {
  console.log(chalk.white.bold("NeuroLint Team Management\n"));

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "List teams",
        "View team members",
        "Invite team member",
        "Remove team member",
        "Create new team",
        "Configure team settings",
        "Exit",
      ],
    },
  ]);

  switch (answers.action) {
    case "List teams":
      await listTeams();
      break;
    case "View team members":
      const teamId = await inquirer.prompt([
        {
          type: "input",
          name: "teamId",
          message: "Enter team ID:",
          validate: (input) => input.length > 0 || "Team ID is required",
        },
      ]);
      await listMembers(teamId.teamId);
      break;
    case "Invite team member":
      const inviteData = await inquirer.prompt([
        {
          type: "input",
          name: "teamId",
          message: "Enter team ID:",
          validate: (input) => input.length > 0 || "Team ID is required",
        },
        {
          type: "input",
          name: "email",
          message: "Enter email address:",
          validate: (input) => input.includes("@") || "Valid email is required",
        },
        {
          type: "list",
          name: "role",
          message: "Select role:",
          choices: ["admin", "member", "viewer"],
        },
      ]);
      await inviteMember(inviteData.teamId, inviteData.email, inviteData.role);
      break;
    case "Remove team member":
      const removeData = await inquirer.prompt([
        {
          type: "input",
          name: "teamId",
          message: "Enter team ID:",
          validate: (input) => input.length > 0 || "Team ID is required",
        },
        {
          type: "input",
          name: "email",
          message: "Enter email address to remove:",
          validate: (input) => input.includes("@") || "Valid email is required",
        },
      ]);
      await removeMember(removeData.teamId, removeData.email);
      break;
    case "Create new team":
      const teamName = await inquirer.prompt([
        {
          type: "input",
          name: "name",
          message: "Enter team name:",
          validate: (input) => input.length > 0 || "Team name is required",
        },
      ]);
      await createTeam(teamName.name);
      break;
    case "Configure team settings":
      console.log(chalk.white("Team settings configuration"));
      console.log(chalk.gray("This feature is coming soon."));
      break;
    default:
      console.log(chalk.gray("Goodbye"));
      process.exit(0);
  }
}
