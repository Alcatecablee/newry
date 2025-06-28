import * as vscode from "vscode";
import { NeuroLintProvider } from "./providers/NeuroLintProvider";
import { NeuroLintCodeActionProvider } from "./providers/CodeActionProvider";
import { NeuroLintHoverProvider } from "./providers/HoverProvider";
import { NeuroLintDiagnosticProvider } from "./providers/DiagnosticProvider";
import { NeuroLintTreeDataProvider } from "./providers/TreeDataProvider";
import { NeuroLintStatusBar } from "./ui/StatusBar";
import { NeuroLintWebview } from "./ui/Webview";
import { ConfigurationManager } from "./utils/ConfigurationManager";
import { ApiClient } from "./utils/ApiClient";

let neurolintProvider: NeuroLintProvider;
let diagnosticProvider: NeuroLintDiagnosticProvider;
let statusBar: NeuroLintStatusBar;
let outputChannel: vscode.OutputChannel;
let webview: NeuroLintWebview;
let configManager: ConfigurationManager;
let apiClient: ApiClient;

export function activate(context: vscode.ExtensionContext) {
  try {
    // Initialize output channel
    outputChannel = vscode.window.createOutputChannel("NeuroLint");
    outputChannel.appendLine("NeuroLint extension activating...");

    // Initialize configuration manager
    configManager = new ConfigurationManager();
    outputChannel.appendLine("Configuration manager initialized");

    // Validate configuration on startup
    const configValidation = configManager.validateConfiguration();
    if (!configValidation.valid) {
      outputChannel.appendLine(
        `Configuration issues found: ${configValidation.errors.join(", ")}`,
      );
      statusBar?.updateStatus("Configuration Error");
    }
    if (configValidation.warnings.length > 0) {
      outputChannel.appendLine(
        `Configuration warnings: ${configValidation.warnings.join(", ")}`,
      );
    }

    // Initialize API client
    apiClient = new ApiClient(configManager);
    outputChannel.appendLine("API client initialized");

    // Initialize status bar early
    statusBar = new NeuroLintStatusBar();
    context.subscriptions.push(statusBar.statusBarItem);
    statusBar.updateStatus("Initializing...", true);

    // Initialize main provider
    neurolintProvider = new NeuroLintProvider(
      apiClient,
      configManager,
      outputChannel,
    );
    context.subscriptions.push(neurolintProvider);
    outputChannel.appendLine("Main provider initialized");

    // Initialize diagnostic provider
    diagnosticProvider = new NeuroLintDiagnosticProvider(
      apiClient,
      outputChannel,
    );
    context.subscriptions.push(diagnosticProvider);
    outputChannel.appendLine("Diagnostic provider initialized");

    // Initialize webview
    webview = new NeuroLintWebview();
    context.subscriptions.push(webview);
    outputChannel.appendLine("Webview initialized");

    // Register providers
    const selector = [
      { scheme: "file", language: "typescript" },
      { scheme: "file", language: "javascript" },
      { scheme: "file", language: "typescriptreact" },
      { scheme: "file", language: "javascriptreact" },
    ];

    // Code action provider (quick fixes)
    try {
      context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
          selector,
          new NeuroLintCodeActionProvider(apiClient, outputChannel),
        ),
      );
      outputChannel.appendLine("Code action provider registered");
    } catch (error) {
      outputChannel.appendLine(
        `Failed to register code action provider: ${error}`,
      );
    }

    // Hover provider (documentation)
    try {
      context.subscriptions.push(
        vscode.languages.registerHoverProvider(
          selector,
          new NeuroLintHoverProvider(apiClient),
        ),
      );
      outputChannel.appendLine("Hover provider registered");
    } catch (error) {
      outputChannel.appendLine(`Failed to register hover provider: ${error}`);
    }

    // Tree data provider (explorer view)
    try {
      const treeDataProvider = new NeuroLintTreeDataProvider(apiClient);
      context.subscriptions.push(
        vscode.window.createTreeView("neurolintExplorer", {
          treeDataProvider,
          showCollapseAll: true,
        }),
      );
      outputChannel.appendLine("Tree data provider registered");
    } catch (error) {
      outputChannel.appendLine(
        `Failed to register tree data provider: ${error}`,
      );
    }

    // Register core commands
    try {
      registerCoreCommands(context);
      outputChannel.appendLine("Core commands registered");
    } catch (error) {
      outputChannel.appendLine(`Failed to register core commands: ${error}`);
    }

    // Register enterprise commands if enabled
    if (configManager.isEnterpriseMode()) {
      try {
        registerEnterpriseCommands(context);
        outputChannel.appendLine("Enterprise commands registered");
      } catch (error) {
        outputChannel.appendLine(
          `Failed to register enterprise commands: ${error}`,
        );
      }
    }

    // Register event listeners
    try {
      registerEventListeners(context);
      outputChannel.appendLine("Event listeners registered");
    } catch (error) {
      outputChannel.appendLine(`Failed to register event listeners: ${error}`);
    }

    // Set context for when extension is enabled
    vscode.commands.executeCommand("setContext", "neurolint.enabled", true);

    // Perform async initialization
    initializeAsync(context).catch((error) => {
      outputChannel.appendLine(`Async initialization failed: ${error}`);
      statusBar.showError("Initialization failed");
    });

    outputChannel.appendLine("NeuroLint extension activated successfully");
    statusBar.updateStatus("Ready");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const fullError = `NeuroLint extension activation failed: ${errorMessage}`;

    outputChannel?.appendLine(fullError);
    console.error(fullError, error);

    // Show error to user with action buttons
    vscode.window
      .showErrorMessage(
        "NeuroLint extension failed to activate. Check output for details.",
        "View Output",
        "Report Issue",
      )
      .then((action) => {
        if (action === "View Output") {
          outputChannel?.show();
        } else if (action === "Report Issue") {
          vscode.env.openExternal(
            vscode.Uri.parse(
              "https://github.com/neurolint/neurolint-vscode/issues",
            ),
          );
        }
      });

    // Still try to initialize basic status bar for user feedback
    if (!statusBar) {
      try {
        statusBar = new NeuroLintStatusBar();
        context.subscriptions.push(statusBar.statusBarItem);
        statusBar.showError("Activation failed");
      } catch (statusBarError) {
        console.error("Failed to initialize status bar:", statusBarError);
      }
    }
  }
}

async function initializeAsync(
  context: vscode.ExtensionContext,
): Promise<void> {
  try {
    // Test API connection in background
    const connectionTest = apiClient.healthCheck();

    // Validate workspace configuration
    if (neurolintProvider) {
      await neurolintProvider.validateWorkspace();
    }

    // Wait for connection test
    const isConnected = await connectionTest;
    if (!isConnected) {
      outputChannel.appendLine(
        "Warning: Cannot connect to NeuroLint API server",
      );
      statusBar.showWarning("API server not connected");
    } else {
      outputChannel.appendLine(
        "Successfully connected to NeuroLint API server",
      );
    }

    // Show enterprise welcome message if first time
    if (
      configManager.isEnterpriseMode() &&
      !context.globalState.get("neurolint.enterprise.welcomed")
    ) {
      await showEnterpriseWelcome(context);
    }
  } catch (error) {
    outputChannel.appendLine(
      `Async initialization error: ${error instanceof Error ? error.message : String(error)}`,
    );
    // Don't throw here to avoid breaking the extension
  }
}

function registerCoreCommands(context: vscode.ExtensionContext): void {
  // Analyze file command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "neurolint.analyzeFile",
      async (uri?: vscode.Uri) => {
        await analyzeFile(uri);
      },
    ),
  );

  // Analyze workspace command
  context.subscriptions.push(
    vscode.commands.registerCommand("neurolint.analyzeWorkspace", async () => {
      await analyzeWorkspace();
    }),
  );

  // Fix file command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "neurolint.fixFile",
      async (uri?: vscode.Uri) => {
        await fixFile(uri);
      },
    ),
  );

  // Fix workspace command
  context.subscriptions.push(
    vscode.commands.registerCommand("neurolint.fixWorkspace", async () => {
      await fixWorkspace();
    }),
  );

  // Configuration command
  context.subscriptions.push(
    vscode.commands.registerCommand("neurolint.configure", async () => {
      await configureNeuroLint();
    }),
  );

  // Login command
  context.subscriptions.push(
    vscode.commands.registerCommand("neurolint.login", async () => {
      await loginToNeuroLint();
    }),
  );

  // Show output command
  context.subscriptions.push(
    vscode.commands.registerCommand("neurolint.showOutput", () => {
      outputChannel.show();
    }),
  );

  // Apply refactor command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "neurolint.applyRefactor",
      async (uri: vscode.Uri, range: vscode.Range) => {
        await applyRefactor(uri, range);
      },
    ),
  );

  // Optimize structure command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "neurolint.optimizeStructure",
      async (uri: vscode.Uri, range: vscode.Range) => {
        await optimizeStructure(uri, range);
      },
    ),
  );
}

function registerEnterpriseCommands(context: vscode.ExtensionContext): void {
  // Enterprise dashboard
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "neurolint.enterprise.dashboard",
      async () => {
        await openEnterpriseDashboard();
      },
    ),
  );

  // Enterprise analytics
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "neurolint.enterprise.analytics",
      async () => {
        await showEnterpriseAnalytics();
      },
    ),
  );

  // Team management
  context.subscriptions.push(
    vscode.commands.registerCommand("neurolint.enterprise.team", async () => {
      await manageTeam();
    }),
  );

  // Compliance report
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "neurolint.enterprise.compliance",
      async () => {
        await showComplianceReport();
      },
    ),
  );

  // Audit trail
  context.subscriptions.push(
    vscode.commands.registerCommand("neurolint.enterprise.audit", async () => {
      await showAuditTrail();
    }),
  );
}

function registerEventListeners(context: vscode.ExtensionContext): void {
  // Auto-fix on save if enabled
  context.subscriptions.push(
    vscode.workspace.onWillSaveTextDocument(async (event) => {
      const config = vscode.workspace.getConfiguration("neurolint");
      if (config.get("autoFix") && isSupported(event.document)) {
        event.waitUntil(autoFixDocument(event.document));
      }
    }),
  );

  // File change listeners
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (isSupported(event.document)) {
        diagnosticProvider.updateDiagnostics(event.document);
      }
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => {
      if (isSupported(document)) {
        diagnosticProvider.updateDiagnostics(document);
      }
    }),
  );

  // Configuration change listener
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("neurolint")) {
        configManager.reload();
        statusBar.updateStatus("Configuration updated");

        // Register enterprise commands if newly enabled
        if (configManager.isEnterpriseMode()) {
          registerEnterpriseCommands(context);
        }
      }
    }),
  );
}

async function analyzeFile(uri?: vscode.Uri): Promise<void> {
  const document = uri
    ? await vscode.workspace.openTextDocument(uri)
    : vscode.window.activeTextEditor?.document;

  if (!document || !isSupported(document)) {
    vscode.window.showWarningMessage(
      "Please select a TypeScript or JavaScript file",
    );
    return;
  }

  statusBar.updateStatus("Analyzing...", true);
  outputChannel.appendLine(`Analyzing: ${document.fileName}`);

  try {
    await neurolintProvider.analyzeDocument(document);
    const result = neurolintProvider.getAnalysisResult(document);

    if (result) {
      webview.showAnalysisResults(result);
      outputChannel.appendLine(
        `Analysis complete: ${result.layers?.length || 0} layers processed`,
      );
      statusBar.showSuccess("Analysis complete");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    outputChannel.appendLine(`Analysis failed: ${message}`);
    vscode.window.showErrorMessage(`NeuroLint analysis failed: ${message}`);
    statusBar.showError("Analysis failed");
  }
}

async function analyzeWorkspace(): Promise<void> {
  if (!vscode.workspace.workspaceFolders) {
    vscode.window.showWarningMessage("No workspace folder open");
    return;
  }

  try {
    statusBar.updateStatus("Analyzing workspace...", true);
    await neurolintProvider.analyzeWorkspace();
    statusBar.showSuccess("Workspace analysis complete");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    outputChannel.appendLine(`Workspace analysis failed: ${message}`);
    statusBar.showError("Workspace analysis failed");
  }
}

async function fixFile(uri?: vscode.Uri): Promise<void> {
  const document = uri
    ? await vscode.workspace.openTextDocument(uri)
    : vscode.window.activeTextEditor?.document;

  if (!document || !isSupported(document)) {
    vscode.window.showWarningMessage(
      "Please select a TypeScript or JavaScript file",
    );
    return;
  }

  const choice = await vscode.window.showWarningMessage(
    "This will modify your file. Do you want to continue?",
    "Yes",
    "Preview Changes",
    "Cancel",
  );

  if (choice === "Cancel") {
    return;
  }

  statusBar.updateStatus("Fixing...", true);
  outputChannel.appendLine(`Fixing: ${document.fileName}`);

  try {
    const transformedCode = await neurolintProvider.transformDocument(document);

    if (!transformedCode) {
      vscode.window.showInformationMessage("No changes needed");
      statusBar.updateStatus("Ready");
      return;
    }

    if (choice === "Preview Changes") {
      webview.showDiffView(
        document.getText(),
        transformedCode,
        document.fileName,
      );
    } else {
      const edit = new vscode.WorkspaceEdit();
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(document.getText().length),
      );
      edit.replace(document.uri, fullRange, transformedCode);

      const success = await vscode.workspace.applyEdit(edit);
      if (success) {
        outputChannel.appendLine("File fixed successfully");
        statusBar.showSuccess("Fix applied");
        vscode.window.showInformationMessage(
          "NeuroLint fixes applied successfully",
        );
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    outputChannel.appendLine(`Fix failed: ${message}`);
    vscode.window.showErrorMessage(`NeuroLint fix failed: ${message}`);
    statusBar.showError("Fix failed");
  }
}

async function fixWorkspace(): Promise<void> {
  const workspaceSettings = configManager.getWorkspaceSettings();
  const files = await vscode.workspace.findFiles(
    `{${workspaceSettings.includePatterns.join(",")}}`,
    `{${workspaceSettings.excludePatterns.join(",")}}`,
  );

  if (files.length === 0) {
    vscode.window.showInformationMessage(
      "No TypeScript/JavaScript files found in workspace",
    );
    return;
  }

  const choice = await vscode.window.showWarningMessage(
    `This will modify ${files.length} files in your workspace. Do you want to continue?`,
    "Yes",
    "Cancel",
  );

  if (choice === "Cancel") {
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "NeuroLint Workspace Fix",
      cancellable: true,
    },
    async (progress, token) => {
      let fixed = 0;

      for (let i = 0; i < files.length; i++) {
        if (token.isCancellationRequested) {
          break;
        }

        const file = files[i];
        progress.report({
          increment: 100 / files.length,
          message: `Fixing ${file.fsPath}`,
        });

        try {
          const document = await vscode.workspace.openTextDocument(file);
          const transformedCode =
            await neurolintProvider.transformDocument(document);

          if (transformedCode && transformedCode !== document.getText()) {
            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(
              document.positionAt(0),
              document.positionAt(document.getText().length),
            );
            edit.replace(document.uri, fullRange, transformedCode);

            if (await vscode.workspace.applyEdit(edit)) {
              fixed++;
            }
          }
        } catch (error) {
          outputChannel.appendLine(`Failed to fix ${file.fsPath}: ${error}`);
        }
      }

      vscode.window.showInformationMessage(`NeuroLint fixed ${fixed} files`);
    },
  );
}

async function configureNeuroLint(): Promise<void> {
  const options = [
    "API URL",
    "API Key",
    "Enabled Layers",
    "Auto Fix on Save",
    "Diagnostic Level",
    "Enterprise Settings",
    "Workspace Settings",
    "Export Configuration",
    "Import Configuration",
    "Reset to Defaults",
  ];

  const choice = await vscode.window.showQuickPick(options, {
    placeHolder: "Select configuration to modify",
  });

  switch (choice) {
    case "API URL":
      await configureApiUrl();
      break;
    case "API Key":
      await configureApiKey();
      break;
    case "Enabled Layers":
      await configureEnabledLayers();
      break;
    case "Auto Fix on Save":
      await configureAutoFix();
      break;
    case "Diagnostic Level":
      await configureDiagnosticLevel();
      break;
    case "Enterprise Settings":
      await configureEnterpriseSettings();
      break;
    case "Workspace Settings":
      await configureWorkspaceSettings();
      break;
    case "Export Configuration":
      await exportConfiguration();
      break;
    case "Import Configuration":
      await importConfiguration();
      break;
    case "Reset to Defaults":
      await resetConfiguration();
      break;
  }
}

async function configureApiUrl(): Promise<void> {
  const current = configManager.getApiUrl();
  const apiUrl = await vscode.window.showInputBox({
    prompt: "Enter NeuroLint API URL",
    value: current,
    validateInput: (value) => {
      try {
        new URL(value);
        return null;
      } catch {
        return "Please enter a valid URL";
      }
    },
  });

  if (apiUrl) {
    await configManager.setApiUrl(apiUrl);
    vscode.window.showInformationMessage("API URL updated");
  }
}

async function configureApiKey(): Promise<void> {
  const apiKey = await vscode.window.showInputBox({
    prompt: "Enter your NeuroLint API key",
    password: true,
    ignoreFocusOut: true,
  });

  if (apiKey) {
    await configManager.setApiKey(apiKey);
    vscode.window.showInformationMessage("API key updated");
  }
}

async function configureEnabledLayers(): Promise<void> {
  const allLayers = [
    { label: "Layer 1: Configuration Validation", value: 1 },
    { label: "Layer 2: Pattern & Entity Analysis", value: 2 },
    { label: "Layer 3: Component Best Practices", value: 3 },
    { label: "Layer 4: Hydration & SSR Guards", value: 4 },
    { label: "Layer 5: Next.js Optimization", value: 5 },
    { label: "Layer 6: Testing Integration", value: 6 },
  ];

  const current = configManager.getEnabledLayers();
  const selected = await vscode.window.showQuickPick(allLayers, {
    placeHolder: "Select layers to enable",
    canPickMany: true,
    selectedItems: allLayers.filter((layer) => current.includes(layer.value)),
  });

  if (selected) {
    const layers = selected.map((item) => item.value);
    await configManager.setEnabledLayers(layers);
    vscode.window.showInformationMessage(
      `Enabled layers: ${layers.join(", ")}`,
    );
  }
}

async function configureAutoFix(): Promise<void> {
  const choice = await vscode.window.showQuickPick(["Enable", "Disable"], {
    placeHolder: "Auto-fix on save setting",
  });

  if (choice) {
    const config = vscode.workspace.getConfiguration("neurolint");
    await config.update(
      "autoFix",
      choice === "Enable",
      vscode.ConfigurationTarget.Workspace,
    );
    vscode.window.showInformationMessage(`Auto-fix ${choice.toLowerCase()}d`);
  }
}

async function configureDiagnosticLevel(): Promise<void> {
  const levels = ["error", "warning", "info"];
  const choice = await vscode.window.showQuickPick(levels, {
    placeHolder: "Select diagnostic level",
  });

  if (choice) {
    const config = vscode.workspace.getConfiguration("neurolint");
    await config.update(
      "diagnosticsLevel",
      choice,
      vscode.ConfigurationTarget.Workspace,
    );
    vscode.window.showInformationMessage(`Diagnostic level set to ${choice}`);
  }
}

async function configureEnterpriseSettings(): Promise<void> {
  if (!configManager.isEnterpriseMode()) {
    const enable = await vscode.window.showQuickPick(
      ["Enable Enterprise Features", "Cancel"],
      {
        placeHolder: "Enterprise features are not enabled",
      },
    );

    if (enable === "Enable Enterprise Features") {
      const config = vscode.workspace.getConfiguration("neurolint");
      await config.update(
        "enterpriseFeatures.enabled",
        true,
        vscode.ConfigurationTarget.Workspace,
      );
      vscode.window.showInformationMessage("Enterprise features enabled");
    }
    return;
  }

  const options = [
    "Team ID",
    "Enable SSO",
    "Enable Audit Logging",
    "Enable Compliance Mode",
    "Disable Enterprise Features",
  ];

  const choice = await vscode.window.showQuickPick(options, {
    placeHolder: "Select enterprise setting",
  });

  switch (choice) {
    case "Team ID":
      const teamId = await vscode.window.showInputBox({
        prompt: "Enter team ID",
        value: configManager.getTeamId() || "",
      });
      if (teamId) {
        await configManager.setTeamId(teamId);
        vscode.window.showInformationMessage("Team ID updated");
      }
      break;
    case "Enable Compliance Mode":
      await configManager.enableComplianceMode(true);
      vscode.window.showInformationMessage("Compliance mode enabled");
      break;
    case "Enable Audit Logging":
      await configManager.enableAuditLogging(true);
      vscode.window.showInformationMessage("Audit logging enabled");
      break;
  }
}

async function configureWorkspaceSettings(): Promise<void> {
  const options = [
    "Include Patterns",
    "Exclude Patterns",
    "Max File Size",
    "Max Files",
  ];

  const choice = await vscode.window.showQuickPick(options, {
    placeHolder: "Select workspace setting",
  });

  const config = vscode.workspace.getConfiguration("neurolint");

  switch (choice) {
    case "Max File Size":
      const sizeInput = await vscode.window.showInputBox({
        prompt: "Enter maximum file size in MB",
        value: String(
          configManager.getWorkspaceSettings().maxFileSize / (1024 * 1024),
        ),
        validateInput: (value) => {
          const num = parseFloat(value);
          return !isNaN(num) && num > 0
            ? null
            : "Please enter a positive number";
        },
      });
      if (sizeInput) {
        const sizeBytes = parseFloat(sizeInput) * 1024 * 1024;
        await config.update(
          "workspace.maxFileSize",
          sizeBytes,
          vscode.ConfigurationTarget.Workspace,
        );
        vscode.window.showInformationMessage(
          `Max file size set to ${sizeInput}MB`,
        );
      }
      break;
    case "Max Files":
      const filesInput = await vscode.window.showInputBox({
        prompt: "Enter maximum number of files to analyze",
        value: String(configManager.getWorkspaceSettings().maxFiles),
        validateInput: (value) => {
          const num = parseInt(value);
          return !isNaN(num) && num > 0
            ? null
            : "Please enter a positive integer";
        },
      });
      if (filesInput) {
        await config.update(
          "workspace.maxFiles",
          parseInt(filesInput),
          vscode.ConfigurationTarget.Workspace,
        );
        vscode.window.showInformationMessage(`Max files set to ${filesInput}`);
      }
      break;
  }
}

async function exportConfiguration(): Promise<void> {
  const configJson = configManager.exportConfiguration();
  const uri = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file("neurolint-config.json"),
    filters: { JSON: ["json"] },
  });

  if (uri) {
    await vscode.workspace.fs.writeFile(uri, Buffer.from(configJson, "utf8"));
    vscode.window.showInformationMessage("Configuration exported successfully");
  }
}

async function importConfiguration(): Promise<void> {
  const uri = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectMany: false,
    filters: { JSON: ["json"] },
  });

  if (uri && uri[0]) {
    try {
      const content = await vscode.workspace.fs.readFile(uri[0]);
      const configJson = Buffer.from(content).toString("utf8");
      await configManager.importConfiguration(configJson);
      vscode.window.showInformationMessage(
        "Configuration imported successfully",
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to import configuration: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

async function resetConfiguration(): Promise<void> {
  const confirm = await vscode.window.showWarningMessage(
    "This will reset all NeuroLint settings to defaults. Continue?",
    "Yes",
    "Cancel",
  );

  if (confirm === "Yes") {
    await configManager.resetToDefaults();
    vscode.window.showInformationMessage("Configuration reset to defaults");
  }
}

async function loginToNeuroLint(): Promise<void> {
  const apiKey = await vscode.window.showInputBox({
    prompt: "Enter your NeuroLint API key",
    password: true,
    ignoreFocusOut: true,
    validateInput: (value) => {
      if (!value || value.trim().length === 0) {
        return "API key cannot be empty";
      }
      if (value.length < 8) {
        return "API key must be at least 8 characters long";
      }
      if (value.includes(" ") || value.includes("\n")) {
        return "API key contains invalid characters";
      }
      return null;
    },
  });

  if (!apiKey || apiKey.trim().length === 0) {
    return;
  }

  const trimmedApiKey = apiKey.trim();

  try {
    statusBar.updateStatus("Validating API key...", true);

    // Test the API key without saving it first
    const testClient = new ApiClient(configManager);

    // Temporarily set API key for testing
    const originalKey = configManager.getApiKey();
    await configManager.setApiKey(trimmedApiKey);

    try {
      // Test connection and authentication
      const isHealthy = await testClient.healthCheck();
      if (!isHealthy) {
        throw new Error("Cannot connect to NeuroLint API server");
      }

      // For enterprise users, try enterprise authentication
      if (configManager.isEnterpriseMode()) {
        statusBar.updateStatus("Authenticating enterprise user...", true);
        const userInfo = await apiClient.authenticateEnterprise(trimmedApiKey);
        vscode.window
          .showInformationMessage(
            `Welcome ${userInfo.name}! Enterprise features are now available.`,
            "View Dashboard",
          )
          .then((action) => {
            if (action === "View Dashboard") {
              vscode.commands.executeCommand("neurolint.enterprise.dashboard");
            }
          });
      } else {
        // Test a simple API call to verify the key works
        statusBar.updateStatus("Testing API access...", true);
        await apiClient.getLayerInfo();

        vscode.window
          .showInformationMessage(
            "Successfully logged in to NeuroLint",
            "Analyze Current File",
          )
          .then((action) => {
            if (action === "Analyze Current File") {
              vscode.commands.executeCommand("neurolint.analyzeFile");
            }
          });
      }

      statusBar.showSuccess("Logged in");
      outputChannel.appendLine("API key validated and saved successfully");
    } catch (testError) {
      // Restore original API key on test failure
      await configManager.setApiKey(originalKey);
      throw testError;
    }
  } catch (error) {
    statusBar.showError("Authentication failed");

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    outputChannel.appendLine(`Authentication failed: ${errorMessage}`);

    vscode.window
      .showErrorMessage(
        `Authentication failed: ${errorMessage}`,
        "Check Configuration",
        "View Documentation",
      )
      .then((action) => {
        if (action === "Check Configuration") {
          vscode.commands.executeCommand("neurolint.configure");
        } else if (action === "View Documentation") {
          vscode.env.openExternal(
            vscode.Uri.parse("https://docs.neurolint.com/authentication"),
          );
        }
      });
  }
}

async function autoFixDocument(
  document: vscode.TextDocument,
): Promise<vscode.TextEdit[]> {
  try {
    const transformedCode = await neurolintProvider.transformDocument(document);

    if (transformedCode && transformedCode !== document.getText()) {
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(document.getText().length),
      );
      return [vscode.TextEdit.replace(fullRange, transformedCode)];
    }
  } catch (error) {
    outputChannel.appendLine(`Auto-fix failed: ${error}`);
  }

  return [];
}

async function applyRefactor(
  uri: vscode.Uri,
  range: vscode.Range,
): Promise<void> {
  const document = await vscode.workspace.openTextDocument(uri);
  const selectedText = document.getText(range);

  try {
    const transformedCode = await neurolintProvider.transformDocument(document);
    if (transformedCode) {
      const edit = new vscode.WorkspaceEdit();
      edit.replace(uri, range, transformedCode);
      await vscode.workspace.applyEdit(edit);
      vscode.window.showInformationMessage("Refactoring applied successfully");
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      `Refactoring failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

async function optimizeStructure(
  uri: vscode.Uri,
  range: vscode.Range,
): Promise<void> {
  vscode.window.showInformationMessage(
    "Structure optimization feature coming soon",
  );
}

// Enterprise feature functions
async function openEnterpriseDashboard(): Promise<void> {
  if (!configManager.isEnterpriseMode()) {
    vscode.window.showWarningMessage("Enterprise features are not enabled");
    return;
  }

  try {
    const teamInfo = await apiClient.getTeamInfo();
    const analytics = await apiClient.getAnalyticsData();

    // Show enterprise dashboard in webview
    webview.showAnalysisResults({
      teamInfo,
      analytics,
      type: "enterprise-dashboard",
    });
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to load enterprise dashboard: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

async function showEnterpriseAnalytics(): Promise<void> {
  if (!configManager.isEnterpriseMode()) {
    vscode.window.showWarningMessage("Enterprise features are not enabled");
    return;
  }

  const period = await vscode.window.showQuickPick(
    ["week", "month", "quarter"],
    {
      placeHolder: "Select analytics period",
    },
  );

  if (period) {
    try {
      const analytics = await apiClient.getAnalyticsData(period);
      webview.showAnalysisResults({
        analytics,
        period,
        type: "analytics",
      });
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to load analytics: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

async function manageTeam(): Promise<void> {
  if (!configManager.isEnterpriseMode()) {
    vscode.window.showWarningMessage("Enterprise features are not enabled");
    return;
  }

  const options = ["View Team Info", "View Team Members", "Analytics"];
  const choice = await vscode.window.showQuickPick(options, {
    placeHolder: "Select team management option",
  });

  switch (choice) {
    case "View Team Info":
      try {
        const teamInfo = await apiClient.getTeamInfo();
        if (teamInfo) {
          vscode.window.showInformationMessage(
            `Team: ${teamInfo.name}\nMembers: ${teamInfo.members}\nSubscription: ${teamInfo.subscription}`,
          );
        }
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to load team info: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
      break;
    case "View Team Members":
      try {
        const members = await apiClient.getTeamMembers();
        webview.showAnalysisResults({
          members,
          type: "team-members",
        });
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to load team members: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
      break;
  }
}

async function showComplianceReport(): Promise<void> {
  if (!configManager.isComplianceModeEnabled()) {
    vscode.window.showWarningMessage("Compliance mode is not enabled");
    return;
  }

  const frameworks = ["All", "SOC2", "GDPR", "ISO27001"];
  const choice = await vscode.window.showQuickPick(frameworks, {
    placeHolder: "Select compliance framework",
  });

  if (choice) {
    try {
      const framework = choice === "All" ? undefined : choice.toLowerCase();
      const report = await apiClient.getComplianceReport(framework);
      webview.showAnalysisResults({
        report,
        framework,
        type: "compliance",
      });
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to load compliance report: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

async function showAuditTrail(): Promise<void> {
  if (!configManager.isAuditLoggingEnabled()) {
    vscode.window.showWarningMessage("Audit logging is not enabled");
    return;
  }

  const daysInput = await vscode.window.showInputBox({
    prompt: "Number of days to look back",
    value: "30",
    validateInput: (value) => {
      const num = parseInt(value);
      return !isNaN(num) && num > 0 && num <= 365
        ? null
        : "Please enter a number between 1-365";
    },
  });

  if (daysInput) {
    try {
      const days = parseInt(daysInput);
      const auditTrail = await apiClient.getAuditTrail(days);
      webview.showAnalysisResults({
        auditTrail,
        days,
        type: "audit-trail",
      });
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to load audit trail: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

async function showEnterpriseWelcome(
  context: vscode.ExtensionContext,
): Promise<void> {
  const choice = await vscode.window.showInformationMessage(
    "Welcome to NeuroLint Enterprise! Would you like to configure your team settings?",
    "Configure Now",
    "Later",
  );

  if (choice === "Configure Now") {
    await configureEnterpriseSettings();
  }

  context.globalState.update("neurolint.enterprise.welcomed", true);
}

function isSupported(document: vscode.TextDocument): boolean {
  return [
    "typescript",
    "javascript",
    "typescriptreact",
    "javascriptreact",
  ].includes(document.languageId);
}

export function deactivate() {
  try {
    outputChannel?.appendLine("NeuroLint extension deactivating...");

    // Cancel all pending API requests
    if (apiClient) {
      apiClient.cancelAllRequests();
    }

    // Dispose providers in order
    if (neurolintProvider) {
      neurolintProvider.dispose();
      outputChannel?.appendLine("Main provider disposed");
    }

    if (diagnosticProvider) {
      diagnosticProvider.dispose();
      outputChannel?.appendLine("Diagnostic provider disposed");
    }

    if (statusBar) {
      statusBar.dispose();
      outputChannel?.appendLine("Status bar disposed");
    }

    if (webview) {
      webview.dispose();
      outputChannel?.appendLine("Webview disposed");
    }

    // Clear context
    vscode.commands.executeCommand("setContext", "neurolint.enabled", false);

    outputChannel?.appendLine("NeuroLint extension deactivated successfully");

    // Dispose output channel last
    if (outputChannel) {
      outputChannel.dispose();
    }
  } catch (error) {
    console.error("Error during NeuroLint extension deactivation:", error);

    // Still try to dispose critical resources
    try {
      if (apiClient) {
        apiClient.cancelAllRequests();
      }
      if (outputChannel) {
        outputChannel.dispose();
      }
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }
  }
}
