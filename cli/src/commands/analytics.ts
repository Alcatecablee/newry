import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import { readConfig } from "../utils/config";
import { validateApiConnection } from "../utils/validation";

interface AnalyticsData {
  summary: {
    totalAnalyses: number;
    successRate: number;
    averageFixTime: number;
    codeQualityScore: number;
    teamProductivity: number;
  };
  trends: {
    dailyAnalyses: Array<{ date: string; count: number }>;
    qualityTrend: Array<{ date: string; score: number }>;
    errorReduction: Array<{ date: string; errors: number }>;
  };
  teams: Array<{
    name: string;
    members: number;
    analyses: number;
    quality: number;
  }>;
  compliance: {
    soc2: { status: string; score: number };
    gdpr: { status: string; score: number };
    iso27001: { status: string; score: number };
  };
}

export async function analyticsCommand(options: any) {
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

  if (options.export) {
    await exportAnalytics(options.format || "json", options.output);
  } else if (options.dashboard) {
    await showDashboard();
  } else if (options.compliance) {
    await showComplianceReport();
  } else if (options.teams) {
    await showTeamAnalytics();
  } else {
    await interactiveAnalytics();
  }
}

async function exportAnalytics(format: string, outputPath?: string) {
  const spinner = ora("Fetching analytics data...").start();

  try {
    const config = readConfig();
    const response = await fetch(`${config.apiUrl}/api/enterprise/analytics/export`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const analytics: AnalyticsData = await response.json();
    spinner.stop();

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = outputPath || `neurolint-analytics-${timestamp}.${format}`;

    let data: string;
    switch (format.toLowerCase()) {
      case 'json':
        data = JSON.stringify(analytics, null, 2);
        break;
      case 'csv':
        data = convertToCSV(analytics);
        break;
      case 'txt':
        data = convertToText(analytics);
        break;
      default:
        console.log(chalk.white("Unsupported format. Use: json, csv, txt"));
        return;
    }

    await fs.writeFile(filename, data, 'utf8');
    console.log(chalk.white(`Analytics exported to: ${filename}`));
    console.log(chalk.gray(`Format: ${format.toUpperCase()}`));

  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to export analytics"));
    console.log(chalk.gray(`Error: ${error instanceof Error ? error.message : String(error)}`));
  }
}

async function showDashboard() {
  const spinner = ora("Loading dashboard...").start();

  try {
    const config = readConfig();
    const response = await fetch(`${config.apiUrl}/api/enterprise/analytics/dashboard`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const analytics: AnalyticsData = await response.json();
    spinner.stop();

    console.log(chalk.white.bold("\nNeuroLint Analytics Dashboard\n"));

    // Summary Section
    console.log(chalk.white.bold("Executive Summary:"));
    console.log(chalk.white(`  Total Analyses: ${analytics.summary.totalAnalyses.toLocaleString()}`));
    console.log(chalk.white(`  Success Rate: ${analytics.summary.successRate}%`));
    console.log(chalk.white(`  Avg Fix Time: ${analytics.summary.averageFixTime}s`));
    console.log(chalk.white(`  Quality Score: ${analytics.summary.codeQualityScore}/100`));
    console.log(chalk.white(`  Team Productivity: +${analytics.summary.teamProductivity}%`));
    console.log();

    // Team Performance
    console.log(chalk.white.bold("Team Performance:"));
    analytics.teams.forEach(team => {
      console.log(chalk.white(`  ${team.name}:`));
      console.log(chalk.gray(`    Members: ${team.members}, Analyses: ${team.analyses}, Quality: ${team.quality}%`));
    });
    console.log();

    // Compliance Status
    console.log(chalk.white.bold("Compliance Status:"));
    Object.entries(analytics.compliance).forEach(([framework, data]) => {
      const statusColor = data.status === 'compliant' ? chalk.gray : chalk.gray;
      console.log(chalk.white(`  ${framework.toUpperCase()}: ${statusColor(data.status)} (${data.score}%)`));
    });

  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to load dashboard"));
    console.log(chalk.gray(`Error: ${error instanceof Error ? error.message : String(error)}`));
  }
}

async function showComplianceReport() {
  const spinner = ora("Generating compliance report...").start();

  try {
    const config = readConfig();
    const response = await fetch(`${config.apiUrl}/api/enterprise/analytics/compliance`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const compliance = await response.json();
    spinner.stop();

    console.log(chalk.white.bold("\nCompliance Report\n"));

    Object.entries(compliance).forEach(([framework, data]: [string, any]) => {
      console.log(chalk.white.bold(`${framework.toUpperCase()}:`));
      console.log(chalk.white(`  Status: ${data.status}`));
      console.log(chalk.white(`  Score: ${data.score}%`));
      console.log(chalk.white(`  Last Audit: ${data.lastAudit}`));
      console.log(chalk.white(`  Next Audit: ${data.nextAudit}`));

      if (data.requirements) {
        console.log(chalk.gray(`  Requirements:`));
        data.requirements.forEach((req: any) => {
          const statusIcon =
            req.status === "met" ? "MET" : req.status === "partial" ? "PARTIAL" : "NOT MET";
          console.log(chalk.gray(`    ${statusIcon} ${req.title}`));
      }
      console.log();
    });

  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to generate compliance report"));
    console.log(chalk.gray(`Error: ${error instanceof Error ? error.message : String(error)}`));
  }
}

async function showTeamAnalytics() {
  const spinner = ora("Loading team analytics...").start();

  try {
    const config = readConfig();
    const response = await fetch(`${config.apiUrl}/api/enterprise/analytics/teams`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const teams = await response.json();
    spinner.stop();

    console.log(chalk.white.bold("\nTeam Analytics\n"));

    teams.forEach((team: any) => {
      console.log(chalk.white.bold(`${team.name}:`));
      console.log(chalk.white(`  Members: ${team.members}`));
      console.log(chalk.white(`  Analyses: ${team.analyses.toLocaleString()}`));
      console.log(chalk.white(`  Success Rate: ${team.successRate}%`));
      console.log(chalk.white(`  Quality Score: ${team.qualityScore}/100`));
      console.log(chalk.white(`  Productivity: +${team.productivity}%`));
      console.log();
    });

  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to load team analytics"));
    console.log(chalk.gray(`Error: ${error instanceof Error ? error.message : String(error)}`));
  }
}

function convertToCSV(analytics: AnalyticsData): string {
  const headers = ["Metric", "Value"];
  const rows = [
    ["Total Analyses", analytics.summary.totalAnalyses.toString()],
    ["Success Rate", `${analytics.summary.successRate}%`],
    ["Average Fix Time", `${analytics.summary.averageFixTime}s`],
    ["Code Quality Score", `${analytics.summary.codeQualityScore}/100`],
    ["Team Productivity", `+${analytics.summary.teamProductivity}%`],
  ];

  return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
}

function convertToText(analytics: AnalyticsData): string {
  return `NeuroLint Analytics Report
Generated: ${new Date().toISOString()}

EXECUTIVE SUMMARY
=================
Total Analyses: ${analytics.summary.totalAnalyses.toLocaleString()}
Success Rate: ${analytics.summary.successRate}%
Average Fix Time: ${analytics.summary.averageFixTime}s
Code Quality Score: ${analytics.summary.codeQualityScore}/100
Team Productivity: +${analytics.summary.teamProductivity}%

TEAM PERFORMANCE
================
${analytics.teams.map(team =>
  `${team.name}: ${team.members} members, ${team.analyses} analyses, ${team.quality}% quality`
).join('\n')}

COMPLIANCE STATUS
=================
${Object.entries(analytics.compliance).map(([framework, data]) =>
  `${framework.toUpperCase()}: ${data.status} (${data.score}%)`
).join('\n')}
`;
}

async function interactiveAnalytics() {
  console.log(chalk.white.bold("NeuroLint Enterprise Analytics\n"));

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "View dashboard summary",
        "Export analytics data",
        "Show compliance report",
        "View team analytics",
        "Generate executive report",
        "Exit",
      ],
    },
  ]);

  switch (answers.action) {
    case "View dashboard summary":
      await showDashboard();
      break;
    case "Export analytics data":
      const exportOptions = await inquirer.prompt([
        {
          type: 'list',
          name: 'format',
          message: 'Export format:',
          choices: ['json', 'csv', 'txt'],
        },
        {
          type: 'input',
          name: 'filename',
          message: 'Output filename (optional):',
        },
      ]);
      await exportAnalytics(exportOptions.format, exportOptions.filename);
      break;
    case "Show compliance report":
      await showComplianceReport();
      break;
    case "View team analytics":
      await showTeamAnalytics();
      break;
    case "Generate executive report":
      await exportAnalytics("txt", `executive-report-${new Date().toISOString().split('T')[0]}.txt`);
      break;
    default:
      console.log(chalk.gray("Goodbye"));
      process.exit(0);
  }
}