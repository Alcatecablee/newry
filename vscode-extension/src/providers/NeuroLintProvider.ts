import * as vscode from "vscode";
import { ApiClient } from "../utils/ApiClient";
import { ConfigurationManager } from "../utils/ConfigurationManager";

export class NeuroLintProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private documentAnalysisCache: Map<string, any> = new Map();
  private analysisQueue: Set<string> = new Set();
  private isAnalyzing: boolean = false;
  private cacheCleanupTimer: NodeJS.Timeout | undefined;
  private maxCacheSize: number = 100;
  private cacheExpiryTime: number = 5 * 60 * 1000; // 5 minutes
  private isDisposed: boolean = false;

  constructor(
    private apiClient: ApiClient,
    private configManager: ConfigurationManager,
    private outputChannel: vscode.OutputChannel,
  ) {
    this.diagnosticCollection =
      vscode.languages.createDiagnosticCollection("neurolint");

    // Start cache cleanup timer
    this.startCacheCleanup();
  }

  public async analyzeDocument(document: vscode.TextDocument): Promise<void> {
    if (!this.isSupported(document) || this.isDisposed) {
      return;
    }

    const uri = document.uri.toString();

    // Avoid duplicate analysis
    if (this.analysisQueue.has(uri)) {
      return;
    }

    // Check file size limits
    const fileSize = document.getText().length;
    const maxFileSize = this.configManager.getWorkspaceSettings().maxFileSize;
    if (fileSize > maxFileSize) {
      this.outputChannel.appendLine(
        `Skipping analysis for large file: ${document.fileName} (${Math.round(fileSize / 1024)}KB > ${Math.round(maxFileSize / 1024)}KB)`,
      );
      return;
    }

    this.analysisQueue.add(uri);

    try {
      this.outputChannel.appendLine(`Analyzing document: ${document.fileName}`);

      const result = await this.apiClient.analyzeCode(
        document.getText(),
        document.fileName,
      );

      if (this.isDisposed) return;

      // Cache the result with timestamp
      this.setCachedResult(uri, {
        ...result,
        cachedAt: Date.now(),
        fileVersion: document.version,
      });

      // Update diagnostics
      this.updateDiagnostics(document, result);

      // Log audit trail if enabled
      if (this.configManager.isAuditLoggingEnabled()) {
        this.logAuditEvent("document.analyzed", {
          file: document.fileName,
          layers: result.layers?.length || 0,
          issues: this.countIssues(result),
          fileSize: fileSize,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      if (this.isDisposed) return;

      this.outputChannel.appendLine(
        `Analysis failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Only clear diagnostics for certain types of errors
      if (this.shouldClearDiagnosticsOnError(error)) {
        this.diagnosticCollection.set(document.uri, []);
      }

      if (this.configManager.isAuditLoggingEnabled()) {
        this.logAuditEvent("document.analysis.failed", {
          file: document.fileName,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        });
      }
    } finally {
      this.analysisQueue.delete(uri);
    }
  }

  public async transformDocument(
    document: vscode.TextDocument,
  ): Promise<string | undefined> {
    if (!this.isSupported(document)) {
      return undefined;
    }

    try {
      this.outputChannel.appendLine(
        `Transforming document: ${document.fileName}`,
      );

      const result = await this.apiClient.transformCode(
        document.getText(),
        document.fileName,
      );

      // Log audit trail if enabled
      if (this.configManager.isAuditLoggingEnabled()) {
        this.logAuditEvent("document.transformed", {
          file: document.fileName,
          layers: result.layers?.length || 0,
          changes: this.countChanges(result),
          timestamp: new Date().toISOString(),
        });
      }

      return result.transformed;
    } catch (error) {
      this.outputChannel.appendLine(
        `Transform failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      if (this.configManager.isAuditLoggingEnabled()) {
        this.logAuditEvent("document.transform.failed", {
          file: document.fileName,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        });
      }

      throw error;
    }
  }

  public async validateWorkspace(): Promise<
    vscode.WorkspaceFoldersChangeEvent | undefined
  > {
    if (!vscode.workspace.workspaceFolders) {
      return undefined;
    }

    try {
      this.outputChannel.appendLine("Validating workspace configuration...");

      // Check configuration validity
      const configValidation = this.configManager.validateConfiguration();
      if (!configValidation.valid) {
        vscode.window.showWarningMessage(
          `NeuroLint configuration issues: ${configValidation.errors.join(", ")}`,
        );
        return undefined;
      }

      // Validate API connection
      const connectionValid = await this.apiClient.healthCheck();
      if (!connectionValid) {
        vscode.window.showErrorMessage(
          "NeuroLint: Cannot connect to API server",
        );
        return undefined;
      }

      // Enterprise validation
      if (this.configManager.isEnterpriseMode()) {
        const teamId = this.configManager.getTeamId();
        if (!teamId) {
          vscode.window.showWarningMessage(
            "NeuroLint: Enterprise mode requires team configuration",
          );
        }
      }

      this.outputChannel.appendLine(
        "Workspace validation completed successfully",
      );

      if (this.configManager.isAuditLoggingEnabled()) {
        this.logAuditEvent("workspace.validated", {
          workspaceCount: vscode.workspace.workspaceFolders.length,
          enterpriseMode: this.configManager.isEnterpriseMode(),
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.outputChannel.appendLine(
        `Workspace validation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      vscode.window.showErrorMessage(
        `NeuroLint workspace validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    return undefined;
  }

  public getAnalysisResult(document: vscode.TextDocument): any {
    return this.documentAnalysisCache.get(document.uri.toString());
  }

  public clearAnalysisCache(): void {
    this.documentAnalysisCache.clear();
    this.diagnosticCollection.clear();
    this.outputChannel.appendLine("Analysis cache cleared");
  }

  public async analyzeWorkspace(): Promise<void> {
    if (!vscode.workspace.workspaceFolders || this.isDisposed) {
      vscode.window.showWarningMessage("No workspace folder open");
      return;
    }

    const workspaceSettings = this.configManager.getWorkspaceSettings();

    try {
      this.isAnalyzing = true;

      // Find files to analyze with better filtering
      const files = await this.findFilesToAnalyze(workspaceSettings);

      if (files.length === 0) {
        vscode.window.showInformationMessage("No files found to analyze");
        return;
      }

      // Check file count limit
      if (files.length > workspaceSettings.maxFiles) {
        const proceed = await vscode.window.showWarningMessage(
          `Found ${files.length} files, but limit is ${workspaceSettings.maxFiles}. Continue with first ${workspaceSettings.maxFiles} files?`,
          "Yes",
          "No",
        );
        if (proceed !== "Yes") {
          return;
        }
        files.splice(workspaceSettings.maxFiles);
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "NeuroLint Workspace Analysis",
          cancellable: true,
        },
        async (progress, token) => {
          const batchSize = this.apiClient.isConnectionHealthy() ? 5 : 1;
          let completed = 0;
          const total = files.length;
          const batches = this.createBatches(files, batchSize);

          for (const batch of batches) {
            if (token.isCancellationRequested || this.isDisposed) {
              break;
            }

            // Process batch in parallel
            const batchPromises = batch.map(async (file) => {
              try {
                const document = await vscode.workspace.openTextDocument(file);

                // Pre-filter by file size without reading full content
                const stats = await vscode.workspace.fs.stat(file);
                if (stats.size > workspaceSettings.maxFileSize) {
                  this.outputChannel.appendLine(
                    `Skipping large file: ${file.fsPath} (${Math.round(stats.size / 1024)}KB)`,
                  );
                  return false;
                }

                await this.analyzeDocument(document);
                return true;
              } catch (error) {
                this.outputChannel.appendLine(
                  `Failed to analyze ${file.fsPath}: ${error instanceof Error ? error.message : String(error)}`,
                );
                return false;
              }
            });

            const batchResults = await Promise.allSettled(batchPromises);
            const batchCompleted = batchResults.filter(
              (result) =>
                result.status === "fulfilled" && result.value === true,
            ).length;

            completed += batchCompleted;

            progress.report({
              increment: (batchCompleted / total) * 100,
              message: `${completed}/${total} files analyzed`,
            });

            // Add small delay between batches to avoid overwhelming API
            if (batches.indexOf(batch) < batches.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          }

          return completed;
        },
      );

      if (this.configManager.isAuditLoggingEnabled()) {
        this.logAuditEvent("workspace.analyzed", {
          totalFiles: files.length,
          completedFiles: Array.from(this.documentAnalysisCache.keys()).length,
          timestamp: new Date().toISOString(),
        });
      }
    } finally {
      this.isAnalyzing = false;
    }
  }

  public isAnalysisInProgress(): boolean {
    return this.isAnalyzing || this.analysisQueue.size > 0;
  }

  private updateDiagnostics(document: vscode.TextDocument, result: any): void {
    const diagnostics: vscode.Diagnostic[] = [];

    if (result.layers) {
      result.layers.forEach((layer: any) => {
        if (layer.insights) {
          layer.insights.forEach((insight: any) => {
            const diagnostic = this.createDiagnostic(insight, document);
            if (diagnostic) {
              diagnostics.push(diagnostic);
            }
          });
        }
      });
    }

    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  private createDiagnostic(
    insight: any,
    document: vscode.TextDocument,
  ): vscode.Diagnostic | null {
    try {
      let range: vscode.Range;

      if (insight.line !== undefined) {
        const line = Math.max(
          0,
          Math.min(insight.line - 1, document.lineCount - 1),
        );
        const lineText = document.lineAt(line).text;
        const startChar = insight.column || 0;
        const endChar = Math.min(
          startChar + (insight.length || 10),
          lineText.length,
        );

        range = new vscode.Range(
          new vscode.Position(line, startChar),
          new vscode.Position(line, endChar),
        );
      } else {
        range = new vscode.Range(0, 0, 0, 0);
      }

      const severity = this.getSeverity(insight.severity || "warning");

      const diagnostic = new vscode.Diagnostic(
        range,
        insight.message,
        severity,
      );

      diagnostic.source = "NeuroLint";
      diagnostic.code = insight.ruleId || `layer-${insight.layerId}`;

      if (insight.fix) {
        diagnostic.relatedInformation = [
          new vscode.DiagnosticRelatedInformation(
            new vscode.Location(document.uri, range),
            `Suggested fix: ${insight.fix}`,
          ),
        ];
      }

      return diagnostic;
    } catch (error) {
      this.outputChannel.appendLine(`Failed to create diagnostic: ${error}`);
      return null;
    }
  }

  private getSeverity(severity: string): vscode.DiagnosticSeverity {
    switch (severity.toLowerCase()) {
      case "error":
        return vscode.DiagnosticSeverity.Error;
      case "warning":
        return vscode.DiagnosticSeverity.Warning;
      case "info":
        return vscode.DiagnosticSeverity.Information;
      case "hint":
        return vscode.DiagnosticSeverity.Hint;
      default:
        return vscode.DiagnosticSeverity.Warning;
    }
  }

  private countIssues(result: any): number {
    if (!result.layers) return 0;
    return result.layers.reduce(
      (sum: number, layer: any) => sum + (layer.insights?.length || 0),
      0,
    );
  }

  private countChanges(result: any): number {
    if (!result.layers) return 0;
    return result.layers.reduce(
      (sum: number, layer: any) => sum + (layer.changes || 0),
      0,
    );
  }

  private logAuditEvent(event: string, data: any): void {
    const auditData = {
      event,
      data,
      user: vscode.env.username,
      workspace: vscode.workspace.name,
      extension: "vscode-neurolint",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    };

    this.outputChannel.appendLine(`AUDIT: ${JSON.stringify(auditData)}`);
  }

  private isSupported(document: vscode.TextDocument): boolean {
    return [
      "typescript",
      "javascript",
      "typescriptreact",
      "javascriptreact",
    ].includes(document.languageId);
  }

  private startCacheCleanup(): void {
    this.cacheCleanupTimer = setInterval(() => {
      this.cleanupCache();
    }, 60000); // Clean up every minute
  }

  private cleanupCache(): void {
    if (this.isDisposed) return;

    const now = Date.now();
    const keysToDelete: string[] = [];

    // Remove expired entries
    this.documentAnalysisCache.forEach((value, key) => {
      if (value.cachedAt && now - value.cachedAt > this.cacheExpiryTime) {
        keysToDelete.push(key);
      }
    });

    // Remove oldest entries if cache is too large
    if (this.documentAnalysisCache.size > this.maxCacheSize) {
      const sortedEntries = Array.from(
        this.documentAnalysisCache.entries(),
      ).sort((a, b) => (a[1].cachedAt || 0) - (b[1].cachedAt || 0));

      const excess = this.documentAnalysisCache.size - this.maxCacheSize;
      for (let i = 0; i < excess; i++) {
        keysToDelete.push(sortedEntries[i][0]);
      }
    }

    keysToDelete.forEach((key) => this.documentAnalysisCache.delete(key));

    if (keysToDelete.length > 0) {
      this.outputChannel.appendLine(
        `Cleaned up ${keysToDelete.length} cached analysis results`,
      );
    }
  }

  private setCachedResult(uri: string, result: any): void {
    this.documentAnalysisCache.set(uri, result);

    // Trigger cleanup if cache is getting large
    if (this.documentAnalysisCache.size > this.maxCacheSize * 1.2) {
      this.cleanupCache();
    }
  }

  private shouldClearDiagnosticsOnError(error: any): boolean {
    // Only clear diagnostics for connection errors, not for server errors
    if (error && typeof error === "object" && "code" in error) {
      const errorCode = error.code;
      return errorCode === "ECONNREFUSED" || errorCode === "ENOTFOUND";
    }
    return false;
  }

  private async findFilesToAnalyze(
    workspaceSettings: any,
  ): Promise<vscode.Uri[]> {
    const includePattern = `{${workspaceSettings.includePatterns.join(",")}}`;
    const excludePattern = `{${workspaceSettings.excludePatterns.join(",")}}`;

    const files = await vscode.workspace.findFiles(
      includePattern,
      excludePattern,
    );

    // Sort files by priority: smaller files first, then by extension
    return files.sort((a, b) => {
      const aExt = a.fsPath.split(".").pop() || "";
      const bExt = b.fsPath.split(".").pop() || "";

      // Prioritize TypeScript files over JavaScript
      if (aExt === "ts" && bExt === "js") return -1;
      if (aExt === "js" && bExt === "ts") return 1;
      if (aExt === "tsx" && bExt === "jsx") return -1;
      if (aExt === "jsx" && bExt === "tsx") return 1;

      // Then by filename length (smaller files first)
      return a.fsPath.length - b.fsPath.length;
    });
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  public dispose(): void {
    this.isDisposed = true;
    this.diagnosticCollection.dispose();
    this.documentAnalysisCache.clear();
    this.analysisQueue.clear();

    if (this.cacheCleanupTimer) {
      clearInterval(this.cacheCleanupTimer);
      this.cacheCleanupTimer = undefined;
    }
  }
}
