import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import fs from "fs-extra";
import { readConfig } from "../utils/config";
import { validateApiConnection } from "../utils/validation";

interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
}

interface AuditReport {
  period: string;
  totalEvents: number;
  summary: {
    logins: number;
    failedLogins: number;
    dataAccess: number;
    configurations: number;
    userManagement: number;
    highRiskEvents: number;
  };
  events: AuditEvent[];
  compliance: {
    soc2: boolean;
    gdpr: boolean;
    iso27001: boolean;
  };
}

export async function auditCommand(options: any) {
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

  if (options.trail) {
    await showAuditTrail(options.user, options.action, options.days || 30);
  } else if (options.report) {
    await generateAuditReport(
      options.period || "month",
      options.format || "json",
    );
  } else if (options.search) {
    await searchAuditEvents(options.search, options.days || 30);
  } else if (options.compliance) {
    await generateComplianceReport(options.framework);
  } else if (options.alerts) {
    await showSecurityAlerts();
  } else {
    await interactiveAuditManagement();
  }
}

async function showAuditTrail(
  userId?: string,
  action?: string,
  days: number = 30,
) {
  const spinner = ora("Fetching audit trail...").start();

  try {
    const config = readConfig();
    const params = new URLSearchParams();
    params.append("days", days.toString());
    if (userId) params.append("userId", userId);
    if (action) params.append("action", action);

    const response = await fetch(
      `${config.apiUrl}/api/enterprise/audit/trail?${params}`,
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

    const events: AuditEvent[] = await response.json();
    spinner.stop();

    if (events.length === 0) {
      console.log(chalk.white("No audit events found"));
      return;
    }

    console.log(chalk.white.bold(`\nAudit Trail (Last ${days} days):\n`));

    events.forEach((event) => {
      const riskColor = getRiskColor(event.riskLevel);
      const statusIcon = event.success ? "SUCCESS" : "FAILED";

      console.log(chalk.white(`${event.timestamp} ${statusIcon}`));
      console.log(chalk.gray(`  User: ${event.userEmail} (${event.userId})`));
      console.log(chalk.gray(`  Action: ${event.action}`));
      console.log(chalk.gray(`  Resource: ${event.resource}`));
      console.log(riskColor(`  Risk: ${event.riskLevel}`));
      console.log(chalk.gray(`  IP: ${event.ipAddress}`));

      if (Object.keys(event.details).length > 0) {
        console.log(
          chalk.gray(`  Details: ${JSON.stringify(event.details, null, 2)}`),
        );
      }
      console.log();
    });
  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to fetch audit trail"));
    console.log(
      chalk.gray(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

async function generateAuditReport(period: string, format: string) {
  const spinner = ora("Generating audit report...").start();

  try {
    const config = readConfig();
    const response = await fetch(
      `${config.apiUrl}/api/enterprise/audit/report?period=${period}`,
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

    const report: AuditReport = await response.json();
    spinner.stop();

    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `audit-report-${period}-${timestamp}.${format}`;

    let data: string;
    switch (format.toLowerCase()) {
      case "json":
        data = JSON.stringify(report, null, 2);
        break;
      case "csv":
        data = convertAuditToCSV(report);
        break;
      case "txt":
        data = convertAuditToText(report);
        break;
      default:
        console.log(chalk.white("Unsupported format. Use: json, csv, txt"));
        return;
    }

    await fs.writeFile(filename, data, "utf8");
    console.log(chalk.white(`Audit report generated: ${filename}`));
    console.log(chalk.gray(`Period: ${report.period}`));
    console.log(
      chalk.gray(`Total events: ${report.totalEvents.toLocaleString()}`),
    );
    console.log(
      chalk.gray(`High risk events: ${report.summary.highRiskEvents}`),
    );
  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to generate audit report"));
    console.log(
      chalk.gray(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

async function searchAuditEvents(query: string, days: number) {
  const spinner = ora(`Searching audit events for "${query}"...`).start();

  try {
    const config = readConfig();
    const params = new URLSearchParams();
    params.append("q", query);
    params.append("days", days.toString());

    const response = await fetch(
      `${config.apiUrl}/api/enterprise/audit/search?${params}`,
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

    const results = await response.json();
    spinner.stop();

    if (results.events.length === 0) {
      console.log(chalk.white(`No audit events found matching "${query}"`));
      return;
    }

    console.log(chalk.white.bold(`\nSearch Results for "${query}":\n`));
    console.log(
      chalk.gray(
        `Found ${results.events.length} events (${results.total} total matches)\n`,
      ),
    );

    results.events.forEach((event: AuditEvent) => {
      const riskColor = getRiskColor(event.riskLevel);
      const statusIcon = event.success ? "SUCCESS" : "FAILED";

      console.log(chalk.white(`${event.timestamp} ${statusIcon}`));
      console.log(
        chalk.gray(
          `  ${event.userEmail}: ${event.action} on ${event.resource}`,
        ),
      );
      console.log(riskColor(`  Risk: ${event.riskLevel}`));
      console.log();
    });
  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to search audit events"));
    console.log(
      chalk.gray(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

async function generateComplianceReport(framework?: string) {
  const frameworks = framework ? [framework] : ["soc2", "gdpr", "iso27001"];

  const spinner = ora("Generating compliance report...").start();

  try {
    const config = readConfig();
    const response = await fetch(
      `${config.apiUrl}/api/enterprise/audit/compliance`,
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

    const compliance = await response.json();
    spinner.stop();

    console.log(chalk.white.bold("\nCompliance Audit Report\n"));

    frameworks.forEach((fw) => {
      if (compliance[fw]) {
        const status = compliance[fw].compliant ? "COMPLIANT" : "NON-COMPLIANT";
        const statusColor = compliance[fw].compliant ? chalk.gray : chalk.gray;

        console.log(chalk.white.bold(`${fw.toUpperCase()}:`));
        console.log(statusColor(`  Status: ${status}`));
        console.log(chalk.gray(`  Score: ${compliance[fw].score}%`));
        console.log(chalk.gray(`  Last audit: ${compliance[fw].lastAudit}`));
        console.log(chalk.gray(`  Next audit: ${compliance[fw].nextAudit}`));

        if (compliance[fw].violations?.length > 0) {
          console.log(chalk.gray(`  Violations:`));
          compliance[fw].violations.forEach((violation: any) => {
            console.log(
              chalk.gray(`    - ${violation.title}: ${violation.description}`),
            );
          });
        }
        console.log();
      }
    });

    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `compliance-report-${timestamp}.json`;
    await fs.writeFile(filename, JSON.stringify(compliance, null, 2), "utf8");
    console.log(chalk.gray(`Report saved to: ${filename}`));
  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to generate compliance report"));
    console.log(
      chalk.gray(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

async function showSecurityAlerts() {
  const spinner = ora("Fetching security alerts...").start();

  try {
    const config = readConfig();
    const response = await fetch(
      `${config.apiUrl}/api/enterprise/audit/alerts`,
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

    const alerts = await response.json();
    spinner.stop();

    if (alerts.length === 0) {
      console.log(chalk.white("No security alerts"));
      return;
    }

    console.log(chalk.white.bold("\nSecurity Alerts:\n"));

    alerts.forEach((alert: any) => {
      const severityColor = getSeverityColor(alert.severity);

      console.log(
        severityColor(`${alert.severity.toUpperCase()}: ${alert.title}`),
      );
      console.log(chalk.gray(`  Time: ${alert.timestamp}`));
      console.log(chalk.gray(`  Description: ${alert.description}`));
      console.log(chalk.gray(`  Affected: ${alert.affectedUsers} users`));

      if (alert.recommendations?.length > 0) {
        console.log(chalk.gray(`  Recommendations:`));
        alert.recommendations.forEach((rec: string) => {
          console.log(chalk.gray(`    - ${rec}`));
        });
      }
      console.log();
    });
  } catch (error) {
    spinner.stop();
    console.log(chalk.white("Failed to fetch security alerts"));
    console.log(
      chalk.gray(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

function getRiskColor(risk: string): typeof chalk.gray {
  switch (risk) {
    case "low":
      return chalk.gray;
    case "medium":
      return chalk.gray;
    case "high":
      return chalk.gray;
    case "critical":
      return chalk.gray;
    default:
      return chalk.gray;
  }
}

function getSeverityColor(severity: string): typeof chalk.gray {
  switch (severity) {
    case "low":
      return chalk.gray;
    case "medium":
      return chalk.gray;
    case "high":
      return chalk.gray;
    case "critical":
      return chalk.gray;
    default:
      return chalk.gray;
  }
}

function convertAuditToCSV(report: AuditReport): string {
  const headers = [
    "Timestamp",
    "User",
    "Action",
    "Resource",
    "Success",
    "Risk",
    "IP",
  ];
  const rows = report.events.map((event) => [
    event.timestamp,
    event.userEmail,
    event.action,
    event.resource,
    event.success ? "Yes" : "No",
    event.riskLevel,
    event.ipAddress,
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

function convertAuditToText(report: AuditReport): string {
  return `NeuroLint Audit Report
Generated: ${new Date().toISOString()}
Period: ${report.period}

SUMMARY
=======
Total Events: ${report.totalEvents.toLocaleString()}
Logins: ${report.summary.logins}
Failed Logins: ${report.summary.failedLogins}
Data Access: ${report.summary.dataAccess}
Configuration Changes: ${report.summary.configurations}
User Management: ${report.summary.userManagement}
High Risk Events: ${report.summary.highRiskEvents}

COMPLIANCE STATUS
================
SOC 2: ${report.compliance.soc2 ? "Compliant" : "Non-Compliant"}
GDPR: ${report.compliance.gdpr ? "Compliant" : "Non-Compliant"}
ISO 27001: ${report.compliance.iso27001 ? "Compliant" : "Non-Compliant"}

RECENT EVENTS
=============
${report.events
  .slice(0, 50)
  .map(
    (event) =>
      `${event.timestamp} - ${event.userEmail}: ${event.action} (${event.riskLevel} risk)`,
  )
  .join("\n")}
`;
}

async function interactiveAuditManagement() {
  console.log(chalk.white.bold("NeuroLint Audit Management\n"));

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "View audit trail",
        "Generate audit report",
        "Search audit events",
        "View security alerts",
        "Generate compliance report",
        "Exit",
      ],
    },
  ]);

  switch (answers.action) {
    case "View audit trail":
      const trailOptions = await inquirer.prompt([
        {
          type: "input",
          name: "days",
          message: "Number of days to look back:",
          default: "30",
          validate: (input) => !isNaN(parseInt(input)) || "Must be a number",
        },
        {
          type: "input",
          name: "userId",
          message: "Filter by user ID (optional):",
        },
        {
          type: "input",
          name: "action",
          message: "Filter by action (optional):",
        },
      ]);
      await showAuditTrail(
        trailOptions.userId || undefined,
        trailOptions.action || undefined,
        parseInt(trailOptions.days),
      );
      break;
    case "Generate audit report":
      const reportOptions = await inquirer.prompt([
        {
          type: "list",
          name: "period",
          message: "Report period:",
          choices: ["week", "month", "quarter", "year"],
        },
        {
          type: "list",
          name: "format",
          message: "Output format:",
          choices: ["json", "csv", "txt"],
        },
      ]);
      await generateAuditReport(reportOptions.period, reportOptions.format);
      break;
    case "Search audit events":
      const searchOptions = await inquirer.prompt([
        {
          type: "input",
          name: "query",
          message: "Search query:",
          validate: (input) => input.length > 0 || "Search query is required",
        },
        {
          type: "input",
          name: "days",
          message: "Number of days to search:",
          default: "30",
          validate: (input) => !isNaN(parseInt(input)) || "Must be a number",
        },
      ]);
      await searchAuditEvents(
        searchOptions.query,
        parseInt(searchOptions.days),
      );
      break;
    case "View security alerts":
      await showSecurityAlerts();
      break;
    case "Generate compliance report":
      const complianceOptions = await inquirer.prompt([
        {
          type: "list",
          name: "framework",
          message: "Compliance framework:",
          choices: ["All frameworks", "soc2", "gdpr", "iso27001"],
        },
      ]);
      await generateComplianceReport(
        complianceOptions.framework === "All frameworks"
          ? undefined
          : complianceOptions.framework,
      );
      break;
    default:
      console.log(chalk.gray("Goodbye"));
      process.exit(0);
  }
}
