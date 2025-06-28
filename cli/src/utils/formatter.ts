import chalk from "chalk";

export function formatResults(results: any[], format: string) {
  switch (format) {
    case "json":
      console.log(JSON.stringify(results, null, 2));
      break;
    case "summary":
      formatSummary(results);
      break;
    case "table":
    default:
      formatTable(results);
      break;
  }
}

function formatTable(results: any[]) {
  console.log(chalk.white("\nAnalysis Results:\n"));

  results.forEach((result, index) => {
    const status = result.success ? chalk.green("✓") : chalk.red("✗");
    console.log(`${status} ${result.file}`);

    if (result.success && result.layers) {
      result.layers.forEach((layer) => {
        const layerStatus =
          layer.status === "success" ? chalk.green("✓") : chalk.yellow("~");
        const changes = layer.changes || 0;
        console.log(
          `   ${layerStatus} Layer ${layer.id}: ${layer.name} ${changes > 0 ? chalk.cyan(`(${changes} changes)`) : ""}`,
        );

        if (layer.insights && layer.insights.length > 0) {
          layer.insights.forEach((insight) => {
            const severity =
              insight.severity === "error"
                ? chalk.red("●")
                : insight.severity === "warning"
                  ? chalk.yellow("●")
                  : chalk.blue("●");
            console.log(`     ${severity} ${insight.message}`);
          });
        }
      });
    } else if (!result.success) {
      console.log(`     ${chalk.red("Error:")} ${result.error}`);
    }

    if (index < results.length - 1) {
      console.log("");
    }
  });
}

function formatSummary(results: any[]) {
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(chalk.blue("\n📊 Analysis Summary\n"));
  console.log(`${chalk.green("Files processed:")} ${results.length}`);
  console.log(`${chalk.green("Successful:")} ${successful.length}`);
  if (failed.length > 0) {
    console.log(`${chalk.red("Failed:")} ${failed.length}`);
  }

  if (successful.length > 0) {
    // Calculate layer statistics
    const layerStats = {};
    let totalIssues = 0;

    successful.forEach((result) => {
      if (result.layers) {
        result.layers.forEach((layer) => {
          if (!layerStats[layer.id]) {
            layerStats[layer.id] = {
              name: layer.name,
              files: 0,
              changes: 0,
              issues: 0,
            };
          }
          layerStats[layer.id].files++;
          layerStats[layer.id].changes += layer.changes || 0;

          if (layer.insights) {
            layerStats[layer.id].issues += layer.insights.length;
            totalIssues += layer.insights.length;
          }
        });
      }
    });

    console.log(`${chalk.blue("Total issues found:")} ${totalIssues}`);

    console.log(chalk.blue("\nLayer Performance:"));
    Object.entries(layerStats).forEach(([layerId, stats]: [string, any]) => {
      console.log(`Layer ${layerId} (${stats.name}):`);
      console.log(
        `  Files: ${stats.files}, Changes: ${stats.changes}, Issues: ${stats.issues}`,
      );
    });
  }
}
